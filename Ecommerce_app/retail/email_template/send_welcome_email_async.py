from users.services.SendEmail import send_graph_email

def send_welcome_email(to_email: str):
    subject = "Welcome to ArcadeStickLabs 🎮 (10% Inside)"

    body = f"""
    <html>
    <body style="font-family: Arial, sans-serif; background:#f9fafb; padding:20px;">
      <div style="max-width:600px;margin:auto;background:#fff;padding:24px;border-radius:10px;">
        
        <h2>Welcome 👋</h2>

        <p>You're in.</p>

        <p>Most people who join us are either:</p>
        <ul>
          <li>Upgrading their fightstick</li>
          <li>Building their first one</li>
        </ul>

        <p>To get you started:</p>

        <p><strong>Here’s 10% off your first order:</strong></p>

        <p style="font-size:20px;font-weight:bold;">WELCOME10</p>

        <p style="margin-top:20px;">
          👉 If you're not sure what to buy, start here:
        </p>

        <a href="https://arcadesticklabs.co.uk/resources/articles/the-ultimate-guide-to-building-stick"
           style="display:inline-block;margin-top:10px;padding:12px 20px;
           background:#111;color:#fff;border-radius:999px;text-decoration:none;">
           Beginner Setup Guide
        </a>

        <p style="margin-top:20px;">
          Or go straight to the most popular parts:
        </p>

        <a href="https://arcadesticklabs.co.uk/shop"
           style="display:inline-block;margin-top:10px;padding:12px 20px;
           background:#14485A;color:#fff;border-radius:999px;text-decoration:none;">
           Shop Best Sellers
        </a>

        <p style="margin-top:30px;font-size:12px;color:#6b7280;">
          – ArcadeStickLabs
        </p>

      </div>
    </body>
    </html>
    """

    send_graph_email(to_email, subject, body)
    
def send_followup_email_1(to_email: str):
    subject = "Not sure what to get? Start here"

    body = f"""
    <html>
    <body style="font-family: Arial; background:#f9fafb; padding:20px;">
      <div style="max-width:600px;margin:auto;background:#fff;padding:24px;border-radius:10px;">

        <h2>Quick recommendations 👇</h2>

        <p>If you're just getting started, here’s a simple setup:</p>

        <ul>
          <li>8x Sanwa buttons (standard layout)</li>
          <li>1x Joystick (JLF or Korean lever depending on style)</li>
        </ul>

        <p>This covers 90% of players.</p>

        <a href="https://arcadesticklabs.co.uk/shop"
           style="display:inline-block;margin-top:20px;padding:12px 20px;
           background:#14485A;color:#fff;border-radius:999px;text-decoration:none;">
           View Recommended Parts
        </a>

        <p style="margin-top:20px;font-size:12px;color:#6b7280;">
          Don’t forget your 10% code: <strong>WELCOME10</strong>
        </p>

      </div>
    </body>
    </html>
    """

    send_graph_email(to_email, subject, body)
    
def send_followup_email_2(to_email: str):
    subject = "Last reminder — your 10% code"

    body = f"""
    <html>
    <body style="font-family: Arial; background:#f9fafb; padding:20px;">
      <div style="max-width:600px;margin:auto;background:#fff;padding:24px;border-radius:10px;">

        <h2>Still thinking it over?</h2>

        <p>Most people upgrading their setup go with:</p>

        <ul>
          <li>Sanwa OBSF buttons</li>
          <li>High-quality joystick upgrade</li>
        </ul>

        <p>Your code is still active:</p>

        <p style="font-size:20px;font-weight:bold;">WELCOME10</p>

        <a href="https://arcadesticklabs.co.uk/shop"
           style="display:inline-block;margin-top:20px;padding:12px 20px;
           background:#14485A;color:#fff;border-radius:999px;text-decoration:none;">
           Complete Your Setup
        </a>

        <p style="margin-top:20px;font-size:12px;color:#6b7280;">
          – ArcadeStickLabs
        </p>

      </div>
    </body>
    </html>
    """

    send_graph_email(to_email, subject, body)