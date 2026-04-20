from celery import shared_task
from django.db import transaction
from django.utils import timezone
from django.conf import settings
from .models import Order, NewsletterSubscriber
from users.services.SendEmail import send_graph_email
from .email_template.out_for_delivery import out_for_delivery_email
from .email_template.delivered_review import delivered_review_email
from .email_template.send_welcome_email_async import send_welcome_email, send_followup_email_1, send_followup_email_2


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
def send_welcome_email_task(self, subscriber_id):
    with transaction.atomic():
        subscriber = NewsletterSubscriber.objects.select_for_update().get(pk=subscriber_id)

        if subscriber.welcome_sent_at:
            return

        if settings.DEBUG:
            print(f"DEV MODE – welcome suppressed for subscriber_id={subscriber.id} email={subscriber.email}")
            subscriber.welcome_sent_at = timezone.now()
            subscriber.save(update_fields=["welcome_sent_at"])
            return

        send_welcome_email(subscriber.email)
        subscriber.welcome_sent_at = timezone.now()
        subscriber.save(update_fields=["welcome_sent_at"])

@shared_task(bind=True)
def send_followup_email_1_task(self, subscriber_id):
    with transaction.atomic():
        subscriber = NewsletterSubscriber.objects.select_for_update().get(pk=subscriber_id)

        if not subscriber.is_active:
            return

        if subscriber.followup_1_sent_at:
            return

        if settings.DEBUG:
            print(f"DEV MODE – followup 1 suppressed for subscriber_id={subscriber.id} email={subscriber.email}")
            subscriber.followup_1_sent_at = timezone.now()
            subscriber.save(update_fields=["followup_1_sent_at"])
            return

        send_followup_email_1(subscriber.email)
        subscriber.followup_1_sent_at = timezone.now()
        subscriber.save(update_fields=["followup_1_sent_at"])


@shared_task(bind=True)
def send_followup_email_2_task(self, subscriber_id):
    with transaction.atomic():
        subscriber = NewsletterSubscriber.objects.select_for_update().get(pk=subscriber_id)

        if not subscriber.is_active:
            return

        if subscriber.followup_2_sent_at:
            return

        if settings.DEBUG:
            print(f"DEV MODE – followup 2 suppressed for subscriber_id={subscriber.id} email={subscriber.email}")
            subscriber.followup_2_sent_at = timezone.now()
            subscriber.save(update_fields=["followup_2_sent_at"])
            return

        send_followup_email_2(subscriber.email)
        subscriber.followup_2_sent_at = timezone.now()
        subscriber.save(update_fields=["followup_2_sent_at"])
        
from datetime import timedelta
from django.utils import timezone

@shared_task
def process_newsletter_followups():
    now = timezone.now()

    followup_1_candidates = NewsletterSubscriber.objects.filter(
        is_active=True,
        welcome_sent_at__isnull=False,
        followup_1_sent_at__isnull=True,
        created_at__lte=now - timedelta(hours=24),
    )

    for subscriber in followup_1_candidates.iterator():
        send_followup_email_1_task.delay(subscriber.id)

    followup_2_candidates = NewsletterSubscriber.objects.filter(
        is_active=True,
        welcome_sent_at__isnull=False,
        followup_2_sent_at__isnull=True,
        created_at__lte=now - timedelta(hours=48),
    )

    for subscriber in followup_2_candidates.iterator():
        send_followup_email_2_task.delay(subscriber.id)