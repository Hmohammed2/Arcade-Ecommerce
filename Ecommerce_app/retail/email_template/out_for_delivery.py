from django.utils import timezone

def out_for_delivery_email(order):
    tracking = order.tracking_number or ""

    tracking_url = f"https://www.royalmail.com/track-your-item#/tracking-results/{tracking}"

    return f"""
<html>
<body style="font-family:Segoe UI, Arial; background:#f9fafb; padding:20px;">
  <div style="max-width:600px;margin:auto;background:white;border-radius:12px;padding:24px;">
    <h2 style="color:#4f46e5;">🚚 Your order has been dispatched and is out for delivery!</h2>

    <p>Hi {order.first_name},</p>

    <p>Your ArcadeStickLabs order <strong>#{order.public_id}</strong> has been dispatched and is now <strong>out for delivery</strong>.</p>

    <p><strong>Tracking number:</strong> {tracking or "Pending"}</p>

    <a href="{tracking_url}"
       style="display:inline-block;margin-top:16px;background:#db2777;color:white;padding:12px 24px;border-radius:999px;text-decoration:none;">
       Track your delivery
    </a>

    <p style="margin-top:24px;">You should receive your delivery very soon 🎉</p>

    <p>– ArcadeStickLabs</p>
  </div>
</body>
</html>
"""
