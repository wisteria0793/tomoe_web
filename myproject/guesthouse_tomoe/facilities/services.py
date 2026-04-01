import requests
from django.conf import settings
from .models import Facility
import json
from datetime import datetime, timedelta, date
from concurrent.futures import ThreadPoolExecutor

from django.core.mail import send_mail
from django.shortcuts import render, redirect
from django.urls import reverse

#def mail(data):
#     subject = "booking"
#     body = (
#        f"{data}"
#     )

#     send_mail(
#         subject,
#         body,
#         'no-reply@hakodate-tomoe.com',
#         settings.BCC,
#         fail_silently=False,
#     )



def get_facility_ids():
    """
    DBから全施設IDを取得
    """
    return Facility.objects.values_list('id', flat=True)


def get_room_ids():
    """
    DBから全施設IDを取得
    """
    return Facility.objects.values_list('roomid', flat=True)


# 宿泊可能施設を検索
def get_facility_info(prop_id, roomId, prop_key, checkIn, checkOut, guests, base_guests, extra_price):
    prices = [] # 料金を格納するリスト
    
    flg = False

    
    # beds24 api link
    price_url = 'https://www.beds24.com/api/json/getRoomDates'
    avail_url = 'https://www.beds24.com/api/json/getAvailabilities'
    
    headers = {'Content-Type': 'application/json'}
    price_payload = {
        "authentication": {
            "apiKey": settings.BEDS24_API_KEY,
            "propKey": prop_key
        },
        "roomId": roomId,
        "from": checkIn,
        "to": checkOut,
    }
    aval_payload = {
        "authentication": {
            "apiKey": settings.BEDS24_API_KEY,
            # "propKey": prop_key
        },
        "checkIn": checkIn,
        "checkOut": checkOut,
        "propId": prop_id,
        "numAdult": guests,
        "numChild": "0"
    }
    
    # send a request
    # price_response = requests.post(price_url, json=price_payload, headers=headers)
    # avail_response = requests.post(avail_url, json=aval_payload, headers=headers)
    
    # 並列でリクエストを送信
    with ThreadPoolExecutor() as executor:
        price_future = executor.submit(requests.post, price_url, json=price_payload, headers=headers)
        avail_future = executor.submit(requests.post, avail_url, json=aval_payload, headers=headers)
        
        price_response = price_future.result()
        avail_response = avail_future.result()

    # APIレスポンスのエラーチェック
    if price_response.status_code != 200 or avail_response.status_code != 200:
        raise Exception("API request failed with status code: {}, {}".format(price_response.status_code, avail_response.status_code))
    
    print(avail_response.text)
    
    # 辞書型に変更
    price_response_dict = json.loads(price_response.text)
    avail_response_dict = json.loads(avail_response.text)
    
    # 追加料金
    extra_fee = 0
    if base_guests < guests:
        extra_fee = extra_price * (guests-base_guests)
        
    for key, item in avail_response_dict.items():
        if flg is False and key == roomId:
            for child_key, child_item in item.items():
                print(child_key, child_item)
                if child_key == 'roomsavail' and child_item == 1:
                    flg = True
                    print(flg)
                    

    if flg:
        for key, item in price_response_dict.items():
            if key != checkOut:
                for child_key, child_item in item.items():
                    
                    # bookingの価格を参照(p2)
                    if child_key == 'p2':
                        prices.append(int(float(child_item)) + int(extra_fee))

    return prices



def set_booking(roomId, prop_key, firstNight, lastNight, numGuests, firstName, lastName):
    # mail(roomId)
    # beds24 api link
    url = 'https://www.beds24.com/api/json/setBooking'
    headers = {'Content-Type': 'application/json'}
    payload = {
        "authentication": {
            "apiKey": settings.BEDS24_API_KEY,
            "propKey": prop_key,
        },
        "roomId": roomId,
        "unitId": "1",
        "roomQty": "1",
        "status": "1",
        "firstNight": firstNight,
        "lastNight": lastNight,
        "numAdult": numGuests,
        "guestTitle": "Mr",
        "guestFirstName": firstName,
        "guestName": lastName,
    }
    
    # send a request
    response = requests.post(url, json=payload, headers=headers)



def get_availability(prop_key, roomId):
    url = "https://www.beds24.com/api/json/getRoomDates"
    
    headers = {'Content-Type': 'application/json'}
    payload = {
        "authentication": {
            "apiKey": settings.BEDS24_API_KEY,
            "propKey": prop_key
        },
        "roomId": roomId,
        "from": datetime.now().strftime("%Y%m%d"),
        "to": (datetime.now() + timedelta(days=365)).strftime("%Y%m%d"),
    }
    
    response = requests.post(url, json=payload, headers=headers)
    data = response.json()
    

    # 予約可否と料金を別々の辞書で作成
    # 日付ごとの予約可否と料金を1つの辞書にまとめる
    availability_and_price = {
        datetime.strptime(date, '%Y%m%d').strftime('%Y-%m-%d'): {
            'available': details['i'],
            'price': float(details.get('p2', 0))
        }
        for date, details in data.items()
    }

    
    return availability_and_price



