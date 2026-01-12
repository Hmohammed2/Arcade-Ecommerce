import os
from celery import Celery

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "Ecommerce_app.settings")

app = Celery("Ecommerce_app")
app.config_from_object("django.conf:settings", namespace="CELERY")
app.autodiscover_tasks()
