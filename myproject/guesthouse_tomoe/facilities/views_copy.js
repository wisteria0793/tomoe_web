import json
import logging
from datetime import datetime, timedelta, timezone
from dateutil.parser import parse

import requests
import stripe
from django.conf import settings
from django.http import JsonResponse, HttpResponse
from django.shortcuts import render
from django.db.utils import IntegrityError

from django.views.decorators.csrf import csrf_exempt
from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Facility, FAQ, Reservation
from .serializers import FacilitySerializer, FAQSerializer, ReservationSerializer
from .services import get_facility_ids, get_room_ids, get_facility_info, set_booking
from .sendMail import send_reservation_email

# ロガーの設定
logger = logging.getLogger(__name__)

# Stripe APIキーの設定
stripe.api_key = settings.STRIPE_SECRET_KEY


class FacilityViewSet(viewsets.ModelViewSet):
    queryset = Facility.objects.all()
    serializer_class = FacilitySerializer


@csrf_exempt
def search_facilities(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid HTTP method'}, status=405)

    try:
        print(request)
        prop_ids = get_facility_ids()
        if not prop_ids:
            return JsonResponse({'error': 'No facility IDs found'}, status=400)

        data = json.loads(request.body)
        print(data)

        # 日付フォーマットの変換
        check_in = data.get('checkIn')
        check_out = data.get('checkOut')

        if not check_in or not check_out:
            return JsonResponse({'error': 'Invalid check-in or check-out date'}, status=400)

        check_in_formatted = (
            datetime.fromisoformat(check_in.replace("Z", "+00:00")) + timedelta(days=1)
        ).strftime('%Y%m%d')
        check_out_formatted = datetime.fromisoformat(check_out.replace("Z", "+00:00")).strftime('%Y%m%d')

        # ゲスト情報
        guests = data.get('guests', {})
        adult_count = int(guests.get('adult', 0))  # 明示的に int 型に変換
        child_count = int(guests.get('child', 0))  # 明示的に int 型に変換
        
        number_of_guests = adult_count + child_count

        results = []

        # 各施設の情報を取得
        for prop_id in prop_ids:
            facility = Facility.objects.filter(id=prop_id).first()
            if not facility or facility.capacity < number_of_guests:
                continue
            
            
            # 宿泊料金を取得
            prices = get_facility_info(
                facility.id,
                facility.roomid, 
                facility.prop_key,
                check_in_formatted, 
                check_out_formatted, 
                number_of_guests, 
                facility.base_guests, 
                facility.extra_guest_price
            )

            if len(prices) == 0:
                continue  # 宿泊不可の場合スキップ
            try:
                prices = [float(price) for price in prices]
                
            except ValueError as e:
                print(f"施設ID {prop_id}: 価格リストに無効なデータがあります。エラー: {e}")
                continue
            # 施設情報を構成
            serialized_facility = FacilitySerializer(facility).data
            serialized_facility["prices"] = prices
            serialized_facility["total_price"] = sum(prices)

            results.append(serialized_facility)
        return JsonResponse({'results': results})

    except requests.exceptions.HTTPError as http_err:
        logger.error(f"HTTP error occurred: {http_err}")
        return JsonResponse({'error': str(http_err)}, status=400)

    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        return JsonResponse({'error': str(e)}, status=500)







# Create a Checkout Session
@csrf_exempt
def create_checkout_session(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            guest_data_dict = json.loads(data['reservationDetails']['guests'])

            # Convert check-in and check-out dates to JST
            check_in_date_utc = datetime.fromisoformat(data['reservationDetails']['checkInDate'].replace("Z", "+00:00"))
            check_out_date_utc = datetime.fromisoformat(data['reservationDetails']['checkOutDate'].replace("Z", "+00:00"))

            japan_timezone = timezone(timedelta(hours=9))
            check_in_date_jst = check_in_date_utc.astimezone(japan_timezone)
            check_out_date_jst = check_out_date_utc.astimezone(japan_timezone)

            metadata = {
                'first_name': data['personalInfo']['firstName'],
                'last_name': data['personalInfo']['lastName'],
                'email': data['personalInfo']['email'],
                'phone': data['personalInfo']['phone'],
                'notes': data['personalInfo']['notes'],
                'facility_id': data['reservationDetails']['facilityId'],
                'facility_name': data['reservationDetails']['facilityName'],
                'check_in_date': check_in_date_jst.strftime('%Y-%m-%d'),
                'check_out_date': check_out_date_jst.strftime('%Y-%m-%d'),
                'total_price': data['reservationDetails']['totalPrice'],
                'discount': data['reservationDetails']['discount'],
                'adult': guest_data_dict['adult'],  # guestsを追加
                'child': guest_data_dict['child'],  # guestsを追加
                'infant': guest_data_dict['infant'],  # guestsを追加
            }
            
            total_price = data['reservationDetails']['totalPrice']

            # Create a checkout session
            session = stripe.checkout.Session.create(
                payment_method_types=['card'],
                line_items=[
                    {
                        'price_data': {
                            'currency': 'jpy',
                            'product_data': {'name': data['reservationDetails']['facilityName']},
                            'unit_amount': total_price,
                        },
                        'quantity': 1,
                    }
                ],
                mode='payment',
                success_url='https://hakodate-tomoe.com/success',
                cancel_url='https://hakodate-tomoe.com/cancel',
                metadata=metadata,
            )
	    # メール送信
            send_reservation_email(metadata)
	    # facility = Facility.objects.filter(id=data['reservationDetails']['facilityId']).first()
	    # set_booking(facility.roomid, facility.prop_key, check_in_date, last_night, adult_count, child_count, metadata.get('first_name', ''), metadata.get('last_name', ''))
            return JsonResponse({'id': session.id})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)

    return JsonResponse({'error': 'Invalid request method'}, status=405)

# Webhook to handle payment confirmation
@csrf_exempt
def stripe_webhook(request):
    stripe.api_key = settings.STRIPE_SECRET_KEY
    endpoint_secret = settings.STRIPE_ENDPOINT_SECRET
    payload = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE', '')

    try:
        event = stripe.Webhook.construct_event(payload, sig_header, endpoint_secret)
    except ValueError as e:
        print(f"Payload parsing error: {e}")
        return HttpResponse(status=400)
    except stripe.error.SignatureVerificationError as e:
        print(f"Signature verification failed: {e}")
        return HttpResponse(status=400)

    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        metadata = session['metadata']
        # JSON文字列を辞書型に変換
        guests = json.loads(metadata.get('guests', '{}'))

        adult_count = guests.get('adult', 0)
        child_count = guests.get('child', 0)

        
        # ISO 8601形式の日付をDjangoのモデルで扱える形式に変換
        def parse_date(date_string):
            try:
                jst_datetime = parse(date_string).astimezone(timezone(timedelta(hours=9)))
                return jst_datetime.date()  # YYYY-MM-DD形式
            except (ValueError, TypeError) as e:
                print(f"Date parsing error: {e} for date_string: {date_string}")
                return None

        check_in_date = parse_date(metadata.get('check_in_date'))
        check_out_date = parse_date(metadata.get('check_out_date'))
        last_night = (check_out_date - timedelta(days=1)).strftime('%Y-%m-%d')

        

        # 日付フォーマットエラーの処理
        if not check_in_date or not check_out_date:
            print("Invalid date format")
            return HttpResponse(status=400)

        # Save the reservation to the database
        try:
            # データベースに保存
            reservation = Reservation.objects.create(
                first_name=metadata.get('first_name', ''),
                last_name=metadata.get('last_name', ''),
                email=metadata.get('email', ''),
                phone=metadata.get('phone', ''),
                room_name=metadata.get('facility_name', 'Unknown Room'),
                check_in_date=check_in_date,
                check_out_date=check_out_date,
                guests=json.loads(metadata.get('guests', '{}')),  # JSON文字列から辞書に変換
                total_price=int(metadata.get('total_price', 0)) + int(metadata.get('discount', 0)),
                discount=int(metadata.get('discount', 0)),
                final_price=int(metadata.get('total_price', 0)),
                notes=metadata.get('notes', ''),  # 備考を保存
                
            )
            facility_id = metadata.get('facility_id', ''),
            facility = Facility.objects.filter(id=facility_id[0]).first()
            set_booking(facility.roomid, facility.prop_key, check_in_date, last_night, adult_count, child_count, metadata.get('first_name', ''), metadata.get('last_name', ''))
            print(f"Reservation saved successfully: ID {reservation.id}")
            
            # メール送信
            send_reservation_email(metadata, guests, check_in_date, check_out_date)
            
            
        except IntegrityError as e:
            print(f"Database integrity error: {e}")
            return HttpResponse(status=500)
        except ValueError as e:
            print(f"Data type conversion error: {e}")
            return HttpResponse(status=500)
        except Exception as e:
            print(f"Unexpected error: {e}")
            return HttpResponse(status=500)


    return HttpResponse(status=200)


class FAQListView(APIView):
    def get(self, request):
        faqs = FAQ.objects.all()
        serializer = FAQSerializer(faqs, many=True)
        return Response(serializer.data)
    
    

