from django.contrib import admin
from .models import SlotConfiguration, Slot
from django.utils.timezone import make_aware
from django.contrib import messages
import datetime

@admin.register(SlotConfiguration)
class SlotConfigurationAdmin(admin.ModelAdmin):
    list_display = ('day', 'start_hour', 'end_hour')
    actions = ['generate_slots']

    def generate_slots(self, request, queryset):
        total_created = 0
        for config in queryset:
            created_count = self._generate_slots_for_config(config, request)
            total_created += created_count
        messages.success(request, f"Total slots created: {total_created}")

    def _generate_slots_for_config(self, config, request):
        created_count = 0
        start_time = make_aware(datetime.datetime.combine(config.day, datetime.time(hour=config.start_hour)))
        end_time = make_aware(datetime.datetime.combine(config.day, datetime.time(hour=config.end_hour)))

        current_time = start_time
        while current_time < end_time:
            slot_end_time = current_time + datetime.timedelta(hours=1)  # Assuming 1-hour slots
            if not Slot.objects.filter(start_time=current_time, end_time=slot_end_time).exists():
                Slot.objects.create(start_time=current_time, end_time=slot_end_time)
                created_count += 1
            current_time += datetime.timedelta(hours=1)
        return created_count
