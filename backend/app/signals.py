# Importing necessary modules for Django model signals and Graphene subscriptions
from django.db.models.signals import post_save, post_delete
from graphene_subscriptions.signals import post_save_subscription, post_delete_subscription
from django.dispatch import receiver
from .models import Booking, Slot

def booking_saved(sender, instance, **kwargs):
    # Check if the booking has an associated slot
    if instance.slot:
        # Access the start_time and end_time from the related Slot instance
        start_time = instance.slot.start_time
        end_time = instance.slot.end_time
        print(f"Booking by {instance.booker_first_name} {instance.booker_last_name} for slot starting at {start_time} and ending at {end_time} has been saved!")
    else:
        print(f"Booking by {instance.booker_first_name} {instance.booker_last_name} has been saved without a specific slot!")

## Connecting the custom callback function to the post_save signal for the Booking model.
# This ensures the booking_saved function is called whenever a Booking instance is saved.
post_save.connect(booking_saved, sender=Booking, dispatch_uid="booking_saved_custom")

# Connecting the Graphene subscription's post_save_subscription function to the post_save signal for the Booking model.
# This will inform any subscribers that a Booking instance has been saved.
post_save.connect(post_save_subscription, sender=Booking, dispatch_uid="booking_post_save")

# Connecting the Graphene subscription's post_delete_subscription function to the post_delete signal for the Booking model.
# This will inform any subscribers that a Booking instance has been deleted.
post_delete.connect(post_delete_subscription, sender=Booking, dispatch_uid="booking_post_delete")

@receiver(post_delete, sender=Booking)
def update_slot_availability(sender, instance, **kwargs):
    if instance.slot:
        instance.slot.is_booked = False
        instance.slot.save()