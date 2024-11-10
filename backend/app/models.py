from django.db import models
from phonenumber_field.modelfields import PhoneNumberField
from django.db.models.signals import post_save, post_delete
from django.core.exceptions import ValidationError
from django.dispatch import receiver
import uuid
from datetime import datetime

class SlotConfiguration(models.Model):
    day = models.DateField(help_text="The day for which to generate slots.")
    start_hour = models.IntegerField(help_text="Start hour (0-23).")
    end_hour = models.IntegerField(help_text="End hour (must be greater than start hour).")

    def __str__(self):
        return f"Configuration for {self.day}: {self.start_hour} to {self.end_hour}"

class Slot(models.Model):
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    is_booked = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.start_time} to {self.end_time} - {'Booked' if self.is_booked else 'Open'}"

class Booking(models.Model):
    booking_id = models.CharField(max_length=50, unique=True, editable=False)
    booker_first_name = models.CharField(max_length=100)
    booker_last_name = models.CharField(max_length=100)
    booker_email = models.CharField(max_length=200)
    booker_phone = PhoneNumberField()
    slot = models.ForeignKey(Slot, on_delete=models.SET_NULL, null=True, related_name="bookings")
    status = models.CharField(max_length=10, choices=[
        ('confirmed', 'Confirmed'),
        ('pending', 'Pending'),
        ('cancelled', 'Cancelled'),
        ('denied', 'Denied'),
    ], default='confirmed')

    def generate_booking_id(self):
        # Generate a timestamp component (YYMMDDHHmm)
        timestamp = datetime.now().strftime('%y%m%d%H%M')
        
        # Generate a random component (last 4 characters of UUID)
        random_component = str(uuid.uuid4())[-4:]
        
        # Combine with a prefix
        return f'BK-{timestamp}-{random_component}'

    def __str__(self):
        slot_str = f"from {self.slot.start_time} to {self.slot.end_time}" if self.slot else "No slot assigned"
        return f"Booking by {self.booker_first_name} {self.booker_last_name} {slot_str}"

    def save(self, *args, **kwargs):
        # Generate booking_id if it doesn't exist
        if not self.booking_id:
            self.booking_id = self.generate_booking_id()
            
        if self.slot and Booking.objects.filter(slot=self.slot, status='confirmed').exists():
            raise ValidationError('This slot is already booked.')
        super().save(*args, **kwargs)

# Correctly defined outside the Booking class
@receiver(post_save, sender=Booking)
def update_slot_status_on_booking_save(sender, instance, created, **kwargs):
    if created and instance.slot:
        instance.slot.is_booked = True
        instance.slot.save()

@receiver(post_delete, sender=Booking)
def update_slot_status_on_booking_delete(sender, instance, **kwargs):
    # Check if the deleted booking's slot still exists and update its status
    if instance.slot:
        # Check if there are no other confirmed bookings for this slot
        if not Booking.objects.filter(slot=instance.slot, status='confirmed').exists():
            instance.slot.is_booked = False
            instance.slot.save()