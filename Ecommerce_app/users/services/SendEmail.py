import requests
from django.conf import settings
from django.utils import timezone
import logging

logger = logging.getLogger(__name__)

def get_graph_access_token():
    tenant_id = settings.GRAPH_TENANT_ID
    client_id = settings.GRAPH_CLIENT_ID
    client_secret = settings.GRAPH_CLIENT_SECRET

    url = f"https://login.microsoftonline.com/{tenant_id}/oauth2/v2.0/token"

    data = {
        "grant_type": "client_credentials",
        "client_id": client_id,
        "client_secret": client_secret,
        "scope": "https://graph.microsoft.com/.default",
    }

    response = requests.post(url, data=data)
    response.raise_for_status()
    return response.json()["access_token"]


def send_graph_email(to_email, subject, body):
    access_token = get_graph_access_token()
    sender = settings.GRAPH_SHARED_MAILBOX

    url = f"https://graph.microsoft.com/v1.0/users/{sender}/sendMail"

    email_msg = {
        "message": {
            "subject": subject,
            "body": {
                "contentType": "HTML",
                "content": body,
            },
            "toRecipients": [{"emailAddress": {"address": to_email}}],
        },
        "saveToSentItems": "true",
    }

    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json",
    }

    response = requests.post(url, headers=headers, json=email_msg)
    if response.status_code != 202:
        raise Exception(f"Email failed: {response.text}")


def send_payment_success_email(
    to_email,
    first_name,
    order_id,
    amount,
    items=None,
    payment_method: str = "card",
    delivery_fee: float | None = None,
    discount_amount: float | None = None,
    coupon_code: str | None = None,
):
    """
    Sends a styled payment success email using the site's theme, including:
    - line items
    - subtotal
    - delivery
    - discount (if any)
    - total paid
    """
    subject = f"Your ArcadeStickLabs Order #{order_id} — Payment Confirmed!"

    # 🧾 Compute subtotal & amounts
    subtotal = 0.0
    subtotal = sum(float(item["line_total"]) for item in items)

    # If not provided, assume 0 delivery (for backwards compatibility)
    delivery_fee_val = float(delivery_fee) if delivery_fee is not None else 0.0
    total_paid = float(amount)

    # If discount not passed explicitly, derive it from the math if possible
    if discount_amount is None:
        derived_discount = (subtotal + delivery_fee_val) - total_paid
        discount_amount_val = derived_discount if derived_discount > 0 else 0.0
    else:
        discount_amount_val = float(discount_amount)

    # 🧾 Build items HTML table
    items_html = ""
    if items:
        items_html = """
        <table style="width:100%; border-collapse: collapse; margin-top:20px;">
          <thead>
            <tr style="background-color:#f3f4f6; text-align:left;">
              <th style="padding:8px; border-bottom:1px solid #e5e7eb;">Item</th>
              <th style="padding:8px; border-bottom:1px solid #e5e7eb;">Qty</th>
              <th style="padding:8px; border-bottom:1px solid #e5e7eb;">Price</th>
            </tr>
          </thead>
          <tbody>
        """
        for item in items:
            items_html += f"""
              <tr>
                <td style="padding:8px; border-bottom:1px solid #f3f4f6;">{item['title']}</td>
                <td style="padding:8px; border-bottom:1px solid #f3f4f6;">{item['quantity']}</td>
                <td style="padding:8px; border-bottom:1px solid #f3f4f6;">£{float(item['unit_price']):.2f}</td>
              </tr>
            """
        items_html += """
          </tbody>
        </table>
        """

    # 🧮 Build the totals / discount section
    totals_html = f"""
        <div style="margin-top:20px; font-size:0.95rem;">
          <p><strong>Items subtotal:</strong> £{subtotal:.2f}</p>
          <p><strong>Delivery:</strong> £{delivery_fee_val:.2f}</p>
    """

    if discount_amount_val > 0:
        totals_html += f"""
          <p style="color:#16a34a;">
            <strong>Discount applied{f" ({coupon_code})" if coupon_code else ""}:</strong>
            -£{discount_amount_val:.2f}
          </p>
        """

    totals_html += f"""
          <p style="margin-top:8px; font-size:1rem;">
            <strong>Total paid:</strong> £{total_paid:.2f}
          </p>
        </div>
    """

    body = f"""
        <html>
        <head>
        <style>
            body {{
            font-family: 'Segoe UI', Arial, sans-serif;
            background-color: #f9fafb;
            color: #1f2937;
            margin: 0;
            padding: 0;
            }}
            .container {{
            max-width: 600px;
            margin: 40px auto;
            background: #ffffff;
            border-radius: 12px;
            box-shadow: 0 4px 10px rgba(0,0,0,0.08);
            overflow: hidden;
            }}
            .header {{
            background: linear-gradient(135deg, #4f46e5, #db2777);
            color: white;
            text-align: center;
            padding: 30px 20px;
            }}
            .header h1 {{
            margin: 0;
            font-size: 1.75rem;
            font-weight: 700;
            }}
            .content {{
            padding: 30px;
            }}
            .button {{
            display: inline-block;
            background-color: #db2777;
            color: white;
            padding: 12px 24px;
            border-radius: 9999px;
            text-decoration: none;
            font-weight: 600;
            margin-top: 20px;
            }}
            .footer {{
            background-color: #f3f4f6;
            text-align: center;
            padding: 16px;
            font-size: 0.875rem;
            color: #6b7280;
            }}
            a.email-link {{
            color: #db2777;
            text-decoration: none;
            font-weight: 600;
            }}
            a.email-link:hover {{
            text-decoration: underline;
            }}
        </style>
        </head>
        <body>
        <div class="container">
            <div class="header">
            <h1>Payment Received</h1>
            </div>
            <div class="content">
            <p>Hi {first_name},</p>
            <p>Thank you for your purchase! We’ve successfully processed your payment for:</p>
            <h2 style="margin-bottom:10px;">Order #{order_id}</h2>
            <p><strong>Payment Method:</strong> {payment_method}</p>
            {totals_html}
            {items_html}
            <p style="margin-top:20px;">
                Your order is now being prepared and will move to <strong>Processing</strong> shortly.
            </p>
            <p style="margin-top:30px;">
                If you have any questions, just contact 
                <a href="mailto:support@arcadesticklabs.co.uk" class="email-link">support@arcadesticklabs.co.uk</a> — we’re happy to help.
            </p>
            <p>– The ArcadeStickLabs Team</p>
            </div>
            <div class="footer">
            &copy; {timezone.now().year} ArcadeStickLabs. All rights reserved.
            </div>
        </div>
        </body>
        </html>
        """

    if settings.DEBUG:
        logger.info(
            "[Email Debug] Payment success email | to=%s subject=%s body=%s",
            to_email,
            subject,
            body,
        )
        return
    
    send_graph_email(to_email, subject, body)
