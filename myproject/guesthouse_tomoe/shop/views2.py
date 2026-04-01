from django.shortcuts import render
from rest_framework import generics, status
from rest_framework.response import Response
from django.conf import settings
from .models import Product, Genre, ProductImage, BuyerInfo
from .serializers import ProductSerializer, GenreSerializer, ProductImageSerializer
from .sendMail import send_purchase_email
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt



import stripe
import json
from django.utils.translation import gettext as _
from django.utils import translation
from rest_framework.exceptions import ValidationError
import logging

stripe.api_key = settings.STRIPE_SECRET_KEY
# stripe.api_key = 'sk_test_51EdXAnKrki57bLDpvkWjk0fOv91o3T2NxYPl85jF4IGNYo6IL0v08Xk83Dvcdsz2QNCVZWtUpiBTnjuA91rMGPyV003ln3Y8xu'

logger = logging.getLogger(__name__)

class ProductListCreateView(generics.ListCreateAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

class GenreListCreateView(generics.ListCreateAPIView):
    queryset = Genre.objects.all()
    serializer_class = GenreSerializer

class CreatePaymentIntentView(generics.GenericAPIView):
    def post(self, request, *args, **kwargs):
        try:
            amount = int(request.data.get('amount'))
            payment_method_id = request.data.get('paymentMethodId')

            intent = stripe.PaymentIntent.create(
                amount=amount,
                currency='jpy',
                payment_method=payment_method_id,
                confirmation_method='manual',
                confirm=True,
            )
            return Response({'success': True, 'paymentIntent': intent}, status=status.HTTP_200_OK)
        except stripe.error.CardError as e:
            return Response({'success': False, 'error': e.user_message}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'success': False, 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ProductImageCreateView(generics.CreateAPIView):
    serializer_class = ProductImageSerializer

    def create(self, request, *args, **kwargs):
        product_id = kwargs.get('product_id')
        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found.'}, status=status.HTTP_404_NOT_FOUND)
        
        if product.images.count() >= 5:
            return Response({'error': 'Maximum of 5 images per product.'}, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(product=product)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class ProductImageListView(generics.ListAPIView):
    serializer_class = ProductImageSerializer

    def get_queryset(self):
        product_id = self.kwargs.get('product_id')
        return ProductImage.objects.filter(product_id=product_id)

class CreateCheckoutSessionView(generics.GenericAPIView):
    def post(self, request, *args, **kwargs):
        try:

            data = request.data
            logger.debug(f"Received data: {data}")  # デバッグ用ログ

            personal_info = json.loads(data.get('personalInfo', '{}'))  # JSON文字列を辞書に変換
            total_price = data['reservationDetails']['totalPrice']

            # 在庫数確認
            product_id = data['reservationDetails']['product']['id']
            product = Product.objects.get(id=product_id)
            if product.stock < 0:
                return Response({'error': 'Product is out of stock.'}, status=status.HTTP_400_BAD_REQUEST)

            # Stripeのチェックアウトセッションを作成
            session = stripe.checkout.Session.create(
                payment_method_types=['card'],
                line_items=[
                    {
                        'price_data': {
                            'currency': 'jpy',
                            'product_data': {
                                'name': data['reservationDetails']['product']['name_ja'],  # 商品名を適切に設定
                                'description': '商品説明',  # 商品説明を適切に設定
                            },
                            'unit_amount': total_price,  # 合計金額
                        },
                        'quantity': 1,  # 数量
                    },
                ],
                mode='payment',
                success_url='https://hakodate-tomoe.com/success/',  # 成功時のリダイレクトURL
                cancel_url='https://hakodate-tomoe.com/cancel/',  # キャンセル時のリダイレクトURL
                metadata={  # Webhookで処理するために必要な情報を渡す
                    "product_id": product_id,
                    "name": personal_info.get('name'),
                    "email": personal_info.get('email'),
                    "phone": personal_info.get('phone'),
                    "nationality": personal_info.get('nationality'),
                    "postal_code": personal_info.get('postalCode'),
                    "address1": personal_info.get('address1'),
                    "address2": personal_info.get('address2'),
                    "price": data['reservationDetails']['product']['price'],
                    "shopping_fee": data['reservationDetails']['shippingCost'],
                    "final_price": data['reservationDetails']['totalPrice'],
                    "product_name": data['reservationDetails']['product']['name_ja'],
                    "product_description": data['reservationDetails']['product']['description_ja'],
                }
            )

            return Response({'id': session.id}, status=status.HTTP_200_OK)
        except stripe.error.StripeError as e:
            logger.error(f"Stripe error: {e.user_message}")
            return Response({'error': _('A payment error occurred.')}, status=status.HTTP_400_BAD_REQUEST)
        except ValidationError as e:
            logger.error(f"Validation error: {str(e)}")
            return Response({'error': _('Invalid data provided.')}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Unexpected error: {str(e)}")
            return Response({'error': _('An unexpected error occurred.')}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# Webhook to Handle Stripe Events
@csrf_exempt
def stripe_webhook(request):
    endpoint_secret = settings.SHOP_ENDPOINT_SECRET
    payload = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE', '')

    try:
        # Webhook署名を検証
        event = stripe.Webhook.construct_event(payload, sig_header, endpoint_secret)
    except ValueError as e:
        logger.error(f"Invalid payload: {e}")
        return HttpResponse(status=400)
    except stripe.error.SignatureVerificationError as e:
        logger.error(f"Signature verification failed: {e}")
        return HttpResponse(status=400)

    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        metadata = session.get('metadata', {})

        try:
            # 在庫を減らす
            product_id = metadata.get('product_id')
            product = Product.objects.get(id=product_id)
            if product.stock > 0:
                product.stock -= 1
                product.save()

            # BuyerInfoを保存
            BuyerInfo.objects.create(
                name=metadata.get('name'),
                phone=metadata.get('phone'),
                email=metadata.get('email'),
                nationality=metadata.get('nationality'),
                postal_code=metadata.get('postal_code'),
                address1=metadata.get('address1'),
                address2=metadata.get('address2'),
		product_name=metadata.get('product_name'),  # 商品名
                quantity=1,  # 点数（Webhookから渡された情報がない場合はデフォルト値）
                purchase_date=session['created'],  # Stripeセッションの作成時刻（UNIXタイムスタンプ）
                product_price=metadata.get('price'),  # 商品の金額
                shipping_cost=metadata.get('shopping_fee'),  # 配送料
                total_price=metadata.get('final_price'),  # 合計金額
            )

            # メール送信
            # send_purchase_email(metadata)
            logger.info("Email sent successfully.")
        except Product.DoesNotExist:
            logger.error("Product does not exist.")
            return HttpResponse(status=400)
        except Exception as e:
            logger.error(f"Unexpected error in Webhook: {str(e)}")
            return HttpResponse(status=500)

    return HttpResponse(status=200)


class SetLanguageView(generics.GenericAPIView):
    def post(self, request, *args, **kwargs):
        lang = request.data.get('language')
        if lang in dict(settings.LANGUAGES):
            translation.activate(lang)
            request.session[translation.LANGUAGE_SESSION_KEY] = lang
            return Response({'success': True}, status=status.HTTP_200_OK)
        return Response({'error': 'Invalid language'}, status=status.HTTP_400_BAD_REQUEST)



from django.middleware.csrf import get_token
from django.http import JsonResponse

def get_csrf_token(request):
    token = get_token(request)
    return JsonResponse({'csrfToken': token})
