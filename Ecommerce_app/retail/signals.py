# retail/signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.mail import send_mail
from django.conf import settings
from retail.models import Order
import requests

SLACK_WEBHOOK_URL = getattr(settings, "SLACK_WEBHOOK_URL", None)

@receiver(post_save, sender=Order)
def notify_order_status_change(sender, instance, created, **kwargs):
    """
    Trigger Slack + Email notifications when an order's delivery status changes.
    """
    if created:
        return  # Skip notifications for new orders, only updates

    # Detect status change by checking if status was modified
    try:
        old_instance = sender.objects.get(pk=instance.pk)
    except sender.DoesNotExist:
        return

    # If the status changed, send notifications
    if old_instance.status != instance.status:
        status = instance.status.capitalize()
        customer_email = instance.email

        # 📨 Send Email
        send_mail(
            subject=f"Your order #{instance.id} is now {status}",
            message=f"Hi {instance.first_name},\n\nYour order #{instance.id} status has been updated to {status}.\n\nThank you for shopping with us!",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[customer_email],
            fail_silently=True,
        )

        # 💬 Send Slack Message
        if SLACK_WEBHOOK_URL:
            slack_message = {
                "text": f"📦 *Order #{instance.id}* has been updated to *{status}*.\nCustomer: {instance.first_name} {instance.last_name}\nEmail: {customer_email}"
            }
            try:
                requests.post(SLACK_WEBHOOK_URL, json=slack_message, timeout=5)
            except Exception as e:
                print("Slack notification failed:", e)
