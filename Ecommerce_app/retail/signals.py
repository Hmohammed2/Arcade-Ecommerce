from django.db.models.signals import pre_save
from django.dispatch import receiver
from .models import Order
from .tasks import handle_order_status_change

@receiver(pre_save, sender=Order)
def order_status_changed(sender, instance, **kwargs):
    if not instance.pk:
        return

    old_status = sender.objects.get(pk=instance.pk).status

    if old_status != instance.status:
        handle_order_status_change.delay(instance.id, old_status, instance.status)
