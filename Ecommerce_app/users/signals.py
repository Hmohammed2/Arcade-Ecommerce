from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone
from .models import PasswordResetToken

@receiver(post_save, sender=PasswordResetToken)
def delete_expired_tokens(sender, instance, **kwargs):
    """
    Whenever a new PasswordResetToken is created, clean up expired tokens.
    """
    expiration_threshold = timezone.now()
    expired_tokens = PasswordResetToken.objects.filter(expires_at__lt=expiration_threshold)
    count = expired_tokens.count()
    if count:
        expired_tokens.delete()
        print(f"[Cleanup] Deleted {count} expired password reset tokens.")
