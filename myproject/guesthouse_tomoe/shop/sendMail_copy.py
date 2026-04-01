import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from django.conf import settings


def send_purchase_email(metadata):
    """
    購入確認メールを送信する
    """

    # 件名
    subject = f"【購入確認】ご購入ありがとうございます"
    # 送信先
    recipient_email = metadata['email']
    # 送信元メールアドレス
    from_email = settings.EMAIL_HOST_USER
    password = settings.EMAIL_HOST_PASSWORD
    # コンテキストデータ
    context = {
        "name": metadata['name'],
        "email": metadata['email'],
        "phone": metadata['phone'],
        "nationality": metadata['nationality'],
        "postal_code": metadata['postal_code'],
        "address1": metadata['address1'],
        "address2": metadata['address2'],
        "price": int(float(metadata['price'])),
        "shopping_fee": int(float(metadata['shopping_fee'])),
        "final_price": int(float(metadata['final_price'])),
        "product_name": metadata['product_name'],
        "product_description": metadata['product_description'],
    }


    try:
        # テンプレートファイルのパス
        template_path = os.path.join(settings.BASE_DIR, 'guesthouse_tomoe/templates/shop/purchase_confirmation.html')

        # テンプレート読み込み
        if not os.path.exists(template_path):
            raise FileNotFoundError(f"テンプレートが見つかりません: {template_path}")

        with open(template_path, 'r', encoding='utf-8') as file:
            html_template = file.read()

        # コンテキストデータをテンプレートに埋め込む
        try:
            html_content = html_template.format(**context)
        except KeyError as e:
            raise ValueError(f"テンプレートに必要なキーが不足しています: {e}")

        # メール作成
        message = MIMEMultipart("alternative")
        message["Subject"] = subject
        message["From"] = from_email
        # message["To"] = recipient_email
        # BCCフィールドに予約者のメールアドレスを追加
        bcc_emails = [recipient_email] + settings.BCC
        message["Bcc"] = ', '.join(bcc_emails)

        # HTMLコンテンツを添付
        message.attach(MIMEText(html_content, "html"))

        # SMTPサーバーへ接続してメールを送信
        try:
            with smtplib.SMTP('smtp.gmail.com', 587) as smtp:
                smtp.starttls()
                smtp.login(from_email, password)
                smtp.sendmail(from_email, bcc_emails, message.as_string())

            print(f"メールを送信しました: {recipient_email}")
        except smtplib.SMTPException as smtp_error:
            raise ConnectionError(f"SMTPサーバーへの接続中にエラーが発生しました: {smtp_error}")

    except Exception as e:
        print(f"メール送信中にエラーが発生しました: {e}")

