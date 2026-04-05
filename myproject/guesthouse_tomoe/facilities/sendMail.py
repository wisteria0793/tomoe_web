import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from django.conf import settings
from django.core.mail import send_mail



def send_reservation_email(metadata):
    """
    予約確認メールを送信する
    """
    # 件名
    subject = f"【予約確認】ご予約ありがとうございます - {metadata['facility_name']}"
    # 送信先
    recipient_email = metadata['email']
    # 送信元メールアドレス
    from_email = settings.EMAIL_HOST_USER
    password = settings.EMAIL_HOST_PASSWORD
    # コンテキストデータ
    context = {
        "name": f"{metadata['first_name']} {metadata['last_name']}",
        "email": metadata['email'],
        "phone": metadata['phone'],
        "facility_name": metadata['facility_name'],
        "check_in_date": metadata['check_in_date'],
        "check_out_date": metadata['check_out_date'],
        "guests": metadata['guests'],
        "total_price": int(metadata['total_price']) + int(metadata['discount']),
        "discount": metadata['discount'],
        "final_price": int(metadata['total_price']),
        "notes": metadata.get('notes', ''),
    }
    
    # テンプレートファイルのパス
    template_path = os.path.join(settings.BASE_DIR, 'guesthouse_tomoe/templates/emails/reservation_confirmation.html')

    # テンプレート読み込み
    if not os.path.exists(template_path):
        raise FileNotFoundError(f"テンプレートが見つかりません: {template_path}")

    with open(template_path, 'r', encoding='utf-8') as file:
        html_template = file.read()
    
    # コンテキストデータをテンプレートに埋め込む
    html_content = html_template.format(**context)

    # プレーンテキストの本文（最低限の内容でもOK）
    text_content = (
       "このメールは HTML メール対応クライアントでご覧ください。\n"
       "HTML 形式で予約情報をお送りしています。"
    )
   
    # 送信先 (to + bcc)。bcc を明示的に使う引数がないので、結合します。
    to_emails = [recipient_email]  # メインの送信先
    bcc_emails = settings.BCC      # BCC 先リスト
    all_recipients = to_emails + bcc_emails

    # HTMLコンテンツを添付
    # message.attach(MIMEText(html_content, "html"))


    # SMTPサーバーへ接続してメールを送信
    send_mail(
        subject=subject,
        message=text_content,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=all_recipients,
        fail_silently=False,
        html_message=html_content
    )
