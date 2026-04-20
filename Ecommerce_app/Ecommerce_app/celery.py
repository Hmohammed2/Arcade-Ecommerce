import os
from celery import Celery
from celery.schedules import crontab

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "Ecommerce_app.settings")

app = Celery("Ecommerce_app")
app.config_from_object("django.conf:settings", namespace="CELERY")
app.autodiscover_tasks()

app.conf.beat_schedule = {
    "process-newsletter-followups-every-15-minutes": {
        "task": "retail.tasks.process_newsletter_followups",
        "schedule": crontab(minute="*/15"),
    },
}