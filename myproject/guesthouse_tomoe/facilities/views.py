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
from django.utils.translation import activate
from django.views.decorators.csrf import csrf_exempt
from rest_framework import viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework import status

from .models import Facility, FAQ, Reservation
from .serializers import FacilitySerializer, FAQSerializer, ReservationSerializer
from .services import get_facility_ids, get_room_ids, get_facility_info, set_booking, get_availability
from .sendMail import send_reservation_email

# ロガーの設定
logger = logging.getLogger(__name__)

# Stripe APIキーの設定
stripe.api_key = settings.STRIPE_SECRET_KEY

class FacilityViewSet(viewsets.ModelViewSet):
    queryset = Facility.objects.all()
    serializer_class = FacilitySerializer
    permission_classes = [AllowAny]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        lang = self.request.query_params.get('lang', 'ja')
        logger.debug(f"Current language parameter: {lang}")  # 言語パラメータをログに出力
        context['language'] = lang
        return context

    def get_queryset(self):
        """
        言語パラメータに基づいて施設情報を返す
        """
        queryset = Facility.objects.all()
        lang = self.request.query_params.get('lang', 'ja')  # デフォルトは日本語
        
        # 言語設定を活性化
        activate(lang)
        
        return queryset

    def list(self, request, *args, **kwargs):
        """
        施設一覧を返すメソッドをカスタマイズ
        """
        try:
            queryset = self.get_queryset()
            lang = request.query_params.get('lang', 'ja')
            logger.debug(f"Request query params: {request.query_params}")  # クエリパラメータをログに出力
            logger.debug(f"Selected language: {lang}")  # 選択された言語をログに出力
            
            serializer = self.get_serializer(queryset, many=True, context={'language': lang})
            facilities_data = serializer.data
            
            # デバッグ用：最初の施設のデータを出力
            if facilities_data:
                logger.debug(f"First facility data: {facilities_data[0]}")
            
            return Response(facilities_data)
            
        except Exception as e:
            logger.error(f"Error fetching facilities: {e}")
            return Response(
                {'error': 'Failed to fetch facilities'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


def parse_date(date_string):
    """
    日付文字列をパースして、JSTのYYYY-MM-DD形式に変換します。
    """
    try:
        jst_datetime = parse(date_string).astimezone(timezone(timedelta(hours=9)))
        return jst_datetime.strftime('%Y-%m-%d')
    except (ValueError, TypeError) as e:
        logger.error(f"Date parsing error: {e} for date_string: {date_string}")
        return None

@csrf_exempt
def search_facilities(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid HTTP method'}, status=405)

    try:
        logger.debug(f"Request received: {request}")
        facilities = get_facility_ids()  # この関数は施設のリストを返す
        if not facilities:
            return JsonResponse({'error': 'No facility IDs found'}, status=400)

        data = json.loads(request.body)
        logger.debug(f"Request data: {data}")
        
        print('data: ', data)

        # 日付フォーマットの変換
        check_in = data.get('checkIn')
        check_out = data.get('checkOut')
        if not check_in or not check_out:
            return JsonResponse({'error': 'Invalid check-in or check-out date'}, status=400)

        # timedelta(days=1)の加算を削除
        check_in_formatted = datetime.fromisoformat(check_in.replace("Z", "+00:00")).strftime('%Y%m%d')
        check_out_formatted = datetime.fromisoformat(check_out.replace("Z", "+00:00")).strftime('%Y%m%d')
        
        print(f"check_in_formatted: {check_in_formatted}, check_out_formatted: {check_out_formatted}")
        
        # ゲスト情報の処理を修正
        number_of_guests = int(data.get('guests', 0))  # 直接guestsの値を使用

        results = []
        
        # 以下でエラーが発生
        # 各施設の情報を取得
        for facility_data in facilities:  # facilitiesはディクショナリのリスト
            print(f"facility_data: {facility_data}")
            facility = Facility.objects.filter(id=facility_data).first()
            # facility = Facility.objects.filter(id=facility_data['id']).first()
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
                logger.error(f"施設ID {facility.id}: 価格リストに無効なデータがあります。エラー: {e}")
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
            

            check_in_date = parse_date(data['reservationDetails']['checkInDate'])
            check_out_date = parse_date(data['reservationDetails']['checkOutDate'])
            last_night = (parse(check_out_date) - timedelta(days=1)).strftime('%Y-%m-%d')
            
            metadata = {
                'first_name': data['personalInfo']['firstName'],
                'last_name': data['personalInfo']['lastName'],
                'email': data['personalInfo']['email'],
                'phone': data['personalInfo']['phone'],
                'notes': data['personalInfo']['notes'],
                'facility_id': data['reservationDetails']['facilityId'],
                'facility_name': data['reservationDetails']['facilityName'],
                'check_in_date': check_in_date,
                'check_out_date': check_out_date,
                'last_night': last_night,
                'total_price': data['reservationDetails']['totalPrice'],
                'discount': data['reservationDetails']['discount'],
                'guests': data['reservationDetails']['guests']
            }

            # Create a checkout session
            session = stripe.checkout.Session.create(
                payment_method_types=['card'],
                line_items=[
                    {
                        'price_data': {
                            'currency': 'jpy',
                            'product_data': {'name': metadata.get('facility_name', 'Guesthouse Tomoe.com')},
                            'unit_amount': int(data['reservationDetails']['totalPrice']),
                        },
                        'quantity': 1,
                    }
                ],
                mode='payment',
                # success_url='http://localhost:3000/success/',
                # cancel_url='http://localhost:3000/cancel/',
                success_url='https://hakodate-tomoe.com/success/',
                cancel_url='https://hakodate-tomoe.com/cancel/',
                metadata=metadata,
            )
            return JsonResponse({'id': session.id})
        except Exception as e:
            logger.error(f"Error creating checkout session: {e}")
            return JsonResponse({'error': str(e)}, status=400)

    return JsonResponse({'error': 'Invalid request method'}, status=405)



# Webhook to handle payment confirmation
@csrf_exempt
def stripe_webhook(request):
    endpoint_secret = settings.ENDPOINT_SECRET
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
        metadata = session.get('metadata', {})

        try:
           
            facility_id = metadata.get('facility_id', '')
            facility = Facility.objects.filter(id=facility_id).first()
            print(f"facility: {facility}")
            if facility is not None:
                set_booking(facility.roomid, facility.prop_key, metadata.get('check_in_date', ''), metadata.get('last_night', ''), metadata.get('guests', 0), metadata.get('first_name', ''), metadata.get('last_name', ''))
                send_reservation_email(metadata)
                
        except IntegrityError as e:
            return HttpResponse(status=500)
        except ValueError as e:
            return HttpResponse(status=500)
        except Exception as e:
            return HttpResponse(status=500)

    return HttpResponse(status=200)


class FAQListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        try:
            lang = request.query_params.get('lang', 'ja')
            logger.debug(f"FAQ View language parameter: {lang}")
            
            faqs = FAQ.objects.all().order_by('created_at')
            serializer = FAQSerializer(faqs, many=True, context={'language': lang})
            
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Error fetching FAQs: {e}")
            return Response(
                {'error': 'Failed to fetch FAQs'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


from django.middleware.csrf import get_token

def get_csrf_token(request):
    """
    この関数は、新しいCSRFトークンを生成してフロントエンドに送信します。
    """
    token = get_token(request)
    return JsonResponse({'csrfToken': token})




from rest_framework.decorators import permission_classes
from rest_framework.permissions import AllowAny


@api_view(['GET'])
@permission_classes([AllowAny])
def availability(request, facility_id):
    """
    特定の施設の空室状況を返す
    """
    try:
        # 施設の取得
        print(f"facility_id: {facility_id}")
        facility = Facility.objects.filter(id=facility_id).first()
        print(f"Facility details:")
        print(f"- ID: {facility.id}")
        print(f"- Room ID: {facility.roomid}")
        print(f"- Name: {facility.name}")
        print(f"- Prop Key: {facility.prop_key}")
        print(f"- Capacity: {facility.capacity}")
        
        if not facility:
            return JsonResponse({'error': 'Facility not found'}, status=404)
        
        # 空室状況の取得
        result = get_availability(facility.prop_key, facility.roomid)        
        return JsonResponse(result)  # get_availabilityから返される辞書をそのまま返す
        
    except Exception as e:
        logger.error(f"Error getting availability for facility {facility_id}: {e}")
        return JsonResponse(
            {'error': 'Failed to get availability'},
            status=500
        )



# views.py
from django.core.mail import send_mail
from django.shortcuts import render, redirect
from django.urls import reverse

@csrf_exempt  # CSRF チェックを無効化
def contact_view(request):
    if request.method == 'POST':
        
        try:
            data = json.loads(request.body)
            # フォームからデータを取得
            name = data.get('name')
            email = data.get('email')
            message = data.get('message')

            if not name or not email or not message:
                return JsonResponse({"error": "必須フィールドが不足しています。"}, status=400)

            # メールの件名と本文を作成
            subject = f'お問い合わせ from {name}'
            body = (
                f"以下の内容でお問い合わせがありました。\n\n"
                f"お名前: {name}\n"
                f"メールアドレス: {email}\n"
                f"メッセージ:\n{message}\n"
            )

            # メール送信
            # 会社の代表アドレス or 担当部署アドレスを指定
            send_mail(
                subject,
                body,
                'no-reply@hakodate-tomoe.com',  # 送信元 (From)
                # ['wisteria07930791@gmail.com'],        # 送信先 (To)
                settings.BCC,
                fail_silently=False,
                # bcc=settings.BCC,
                # bcc=["wisteria07930791@gmail.com"]
            )

            return JsonResponse({"message": "メール送信が完了しました"}, status=200)
        except Exception as e:
            # フォームのバリデーションに失敗した場合
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "無効なリクエスト"}, status=400)





def mail(data):
    subject = "booking"
    body = (
       f"{data}"
    )

    send_mail(
        subject,
        body,
        'no-reply@hakodate-tomoe.com',
        settings.BCC,
        fail_silently=False,
    )


def mail2():
    subject = "complete"
    body = (
        "Hello World!"
    )

    send_mail(
        subject,
        body,
        'no-reply@hakodate-tomoe.com',
        settings.BCC,
        fail_silently=False,
    )
