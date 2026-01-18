import requests
from django.conf import settings

def send_slack_message(text: str):
    """
    Send a simple message to Slack via webhook.
    """
    webhook_url = getattr(settings, "SLACK_WEBHOOK_URL", None)
    if not webhook_url:
        return False
    if settings.DEBUG:
        return False  # Avoid sending messages in debug mode
    payload = {"text": text}
    try:
        response = requests.post(webhook_url, json=payload, timeout=5)
        response.raise_for_status()
        return True
    except Exception as e:
        # Log instead of raising
        import logging
        logging.getLogger(__name__).error(f"Slack notification failed: {e}")
        return False
