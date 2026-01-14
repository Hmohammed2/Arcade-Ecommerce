def delivered_review_email(order):
    review_url = f"https://arcadesticklabs.co.uk/review/{order.public_id}?t={order.review_token}"

    return f"""
<html>
<body style="font-family:Segoe UI, Arial; background:#f9fafb; padding:20px;">
  <div style="max-width:600px;margin:auto;background:white;border-radius:12px;padding:24px;">
    <h2 style="color:#16a34a;">🎉 Order Delivered!</h2>

    <p>Hi {order.first_name},</p>

    <p>Your ArcadeStickLabs order <strong>#{order.public_id}</strong> has been delivered.</p>

    <p>If you have a minute, we’d really appreciate a quick review — it helps a small UK business grow 🙏</p>

    <a href="{review_url}"
       style="display:inline-block;margin-top:16px;background:#16a34a;color:white;padding:12px 24px;border-radius:999px;text-decoration:none;">
       Leave a review
    </a>

    <p style="margin-top:24px;">Thank you again for your support.</p>
    <p>– ArcadeStickLabs</p>
  </div>
</body>
</html>
"""
