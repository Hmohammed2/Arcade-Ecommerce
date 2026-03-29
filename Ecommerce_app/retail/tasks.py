from celery import shared_task
from django.conf import settings
from .models import Order
from users.services.SendEmail import send_graph_email
from .email_template.out_for_delivery import out_for_delivery_email
from .email_template.delivered_review import delivered_review_email
from .email_template.send_welcome_email_async import send_welcome_email

@shared_task(bind=True, autoretry_for=(Exception,), retry_backoff=60, retry_kwargs={"max_retries": 5})
def handle_order_status_change(self, order_id, old, new):
    order = Order.objects.get(pk=order_id)

    if new == Order.Status.SHIPPED:
        subject = "🚚 Your ArcadeStickLabs order is out for delivery!"
        body = out_for_delivery_email(order)

    elif new == Order.Status.DELIVERED:
        subject = "🎉 Your ArcadeStickLabs order has been delivered!"
        body = delivered_review_email(order)

    else:
        return

    if settings.DEBUG:
        print("DEV MODE – Email suppressed:", subject, body)
        return

    send_graph_email(order.email, subject, body)

@shared_task(
    bind=True,
    autoretry_for=(Exception,),
    retry_backoff=60,
    retry_kwargs={"max_retries": 5},
)
def send_welcome_email_task(self, email):
    if settings.DEBUG:
        print("DEV MODE – Welcome email suppressed:", email)
        return

    send_welcome_email(email)