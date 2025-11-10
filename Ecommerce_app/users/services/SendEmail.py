import requests
from django.conf import settings

def get_graph_access_token():
    tenant_id = settings.GRAPH_TENANT_ID
    client_id = settings.GRAPH_CLIENT_ID
    client_secret = settings.GRAPH_CLIENT_SECRET

    url = f"https://login.microsoftonline.com/{tenant_id}/oauth2/v2.0/token"

    data = {
        "grant_type": "client_credentials",
        "client_id": client_id,
        "client_secret": client_secret,
        "scope": "https://graph.microsoft.com/.default",
    }

    response = requests.post(url, data=data)
    response.raise_for_status()
    return response.json()["access_token"]

def send_graph_email(to_email, subject, body):
    access_token = get_graph_access_token()
    sender = settings.GRAPH_SHARED_MAILBOX

    url = f"https://graph.microsoft.com/v1.0/users/{sender}/sendMail"

    email_msg = {
        "message": {
            "subject": subject,
            "body": {
                "contentType": "HTML",
                "content": body,
            },
            "toRecipients": [{"emailAddress": {"address": to_email}}],
        },
        "saveToSentItems": "true",
    }

    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json",
    }

    response = requests.post(url, headers=headers, json=email_msg)
    if response.status_code != 202:
        raise Exception(f"Email failed: {response.text}")
