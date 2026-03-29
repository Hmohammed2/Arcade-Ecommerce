from users.services.SendEmail import send_graph_email

def send_welcome_email(to_email: str):
    subject = "Welcome to ArcadeStickLabs 🎮"

    body = f"""
    <html>
    <body style="font-family: Arial, sans-serif; background:#f9fafb; padding:20px;">
      <div style="max-width:600px;margin:auto;background:#fff;padding:24px;border-radius:10px;">
        
        <h2>Welcome 👋</h2>

        <p>Thanks for subscribing to ArcadeStickLabs.</p>

        <p>
          Here’s your <strong>10% discount code</strong>:
        </p>

        <p style="font-size:18px;font-weight:bold;">
          WELCOME10
        </p>

        <p>
          Use it on your first order.
        </p>

        <a href="https://arcadesticklabs.co.uk/shop"
           style="display:inline-block;margin-top:20px;padding:12px 20px;
           background:#14485A;color:#fff;border-radius:999px;text-decoration:none;">
           Browse Products
        </a>

        <p style="margin-top:30px;font-size:12px;color:#6b7280;">
          – ArcadeStickLabs
        </p>

      </div>
    </body>
    </html>
    """
    send_graph_email(to_email, subject, body)