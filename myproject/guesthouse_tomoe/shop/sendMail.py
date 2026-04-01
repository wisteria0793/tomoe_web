import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from django.conf import settings
from django.core.mail import send_mail


def send_purchase_email(cart_items, personal_info):

    """
    予約確認メールを送信する
    """
    # 件名
    subject = f"【購入確認】ご購入ありがとうございます"

    # コンテキストデータ
    context = {
        "name": personal_info.get('name', ""),
        "email": personal_info.get('email', ""),
        "phone": personal_info.get('phone', ""),
        "nationality": personal_info.get('nationality', ""),
	"postalCode": personal_info.get('postalCode', ""),
        "address1": personal_info.get('address1', ""),
        "address2": personal_info.get('address2', ""),
        # "name": cart_items.get('name', ""),
    }

    # 購入内容をリスト形式に整形
    cart_items_rows = "".join([
        f"""
        <tr>
            <td>{item['name']}</td>
            <td>¥{int(float(item['price']))}</td>
            <td>{item['quantity']}</td>
            <td>¥{int(float(item['subtotal']))}</td>
        </tr>
        """ for item in cart_items
    ])


    # メール内容テンプレート
    html_template = """
    <!DOCTYPE html>
    <html lang="ja">
    <head>
        <meta charset="UTF-8">
        <title>購入確認</title>
    </head>
    <body>
        <p>{name} 様</p>

        <h3>配送先情報</h3>
        <ul>
            <li>お名前: {name}</li>
            <li>メール: {email}</li>
            <li>電話番号: {phone}</li>
            <li>住所: {address1} {address2}</li>
            <li>郵便番号: {postalCode}</li>
            <li>国籍: {nationality}</li>
        </ul>

        <h3>ご購入商品</h3>
        <table border="1" cellspacing="0" cellpadding="8">
            <thead>
                <tr>
                    <th>商品名</th>
                    <th>価格</th>
                    <th>数量</th>
                    <th>小計</th>
                </tr>
            </thead>
            <tbody>
                {cart_items_rows}
            </tbody>
        </table>

        <p>２営業日以内に発送しますので、今しばらくお待ちください。</p>
        <p>何かご質問がございましたら、お気軽にお問い合わせください。</p>

        <p>--------------------</p>
        <p>
            ゲストハウス巴.com<br>
            〒040-0035 北海道函館市松風町1-2<br>
            電話: 080-9322-4522<br>
            Email: hakodateshino0901@gmail.com<br>
        </p>
    </body>
    </html>
    """

    # コンテキストデータをテンプレートに埋め込む
    html_content = html_template.format(
        name=context["name"],
        email=context["email"],
        phone=context["phone"],
        nationality=context["nationality"],
        postalCode=context["postalCode"],
        address1=context["address1"],
        address2=context["address2"],
        cart_items_rows=cart_items_rows
    )


    # 送信先
    recipient_email = personal_info.get('email', "")
    # 送信元メールアドレス
    from_email = 'no-reply@hakodate-tomoe.com'

    # BCC 用メールアドレスを結合 (メイン送信先 + BCCリスト)
    if recipient_email != "":
        all_recipients = [recipient_email] + settings.BCC
    else:
        all_recipients = settings.BCC

    # HTML メールに対応していないクライアント用のテキスト本文（最低限でOK）
    text_content = (
        "このメールはHTMLメール対応クライアントでご覧ください。\n"
        "HTML形式で購入情報をお送りしています。"
    )
    
    # send_mail でメール送信
    send_mail(
        subject=subject,
        message=text_content,         # プレーンテキスト本文
        from_email=from_email,
        recipient_list=all_recipients, # 宛先 + BCC
        fail_silently=False,
        html_message=html_content     # HTML本文
    )

