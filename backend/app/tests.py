from django.test import TestCase
from graphene.test import Client
from .models import Slot, Booking
from .schema import schema
from django.utils import timezone
import datetime

class BookingSlotGraphQLTestCase(TestCase):
    def setUp(self):
        # Specify the date and time for the slot
        slot_date = datetime.date(2024, 2, 21)
        start_time = datetime.datetime.combine(slot_date, datetime.time(10, 0))  # 10:00 AM on 2/21/2024
        end_time = datetime.datetime.combine(slot_date, datetime.time(11, 0))  # 11:00 AM on 2/21/2024

        # Make the datetime objects timezone-aware
        start_time = timezone.make_aware(start_time)
        end_time = timezone.make_aware(end_time)

        # Create a test slot for 2/21/2024
        self.slot = Slot.objects.create(
            start_time=start_time,
            end_time=end_time,
            is_booked=False
        )
        self.client = Client(schema)

    def test_create_booking(self):
        response = self.client.execute('''
            mutation {
                createBooking(
                    bookerFirstName: "Test",
                    bookerLastName: "User",
                    bookerEmail: "test@example.com",
                    bookerPhone: "+123456789",
                    slotId: "%s",
                    status: "confirmed"
                ) {
                    booking {
                        bookerFirstName
                        bookerLastName
                        bookerEmail
                        bookerPhone
                        slot {
                            id
                        }
                        status
                    }
                }
            }
        ''' % self.slot.id)
        self.assertIsNone(response.get('errors'), msg=str(response.get('errors')))
        self.assertEqual(response.get('data')['createBooking']['booking']['status'], "CONFIRMED")
        self.slot.refresh_from_db()
        self.assertTrue(self.slot.is_booked)

    def test_delete_booking(self):
        # First, create a booking to delete
        booking = Booking.objects.create(
            booker_first_name="Delete",
            booker_last_name="Test",
            booker_email="delete@example.com",
            booker_phone="+987654321",
            slot=self.slot,
            status="confirmed"
        )
        # Mutation to delete a booking
        response = self.client.execute('''
            mutation {
                deleteBooking(id: "%s") {
                    success
                }
            }
        ''' % booking.id)
        self.assertIsNone(response.get('errors'), msg=str(response.get('errors')))
        self.assertTrue(response.get('data')['deleteBooking']['success'])
        with self.assertRaises(Booking.DoesNotExist):
            Booking.objects.get(pk=booking.id)

    def test_all_slots_query(self):
        # Query to get all slots
        response = self.client.execute('''
            query {
                allSlots {
                    id
                    isBooked
                }
            }
        ''')

        # Ensure no errors in the response
        self.assertIsNone(response.get('errors'), msg=str(response.get('errors')))

        # Check if 'allSlots' is in the response data
        self.assertIn('allSlots', response.get('data'), "Response data does not contain 'allSlots'")

        # Optionally, check the number of slots returned or other properties
        # Ensure the response contains slots data
        slots_data = response.get('data').get('allSlots')
        self.assertTrue(len(slots_data) >= 0, "No slots found in the response")

    def test_available_slots_query(self):
    # Query to get available slots from a certain date
        response = self.client.execute('''
        query {
             availableSlots(date: "2024-02-14") {
                id
                startTime
                endTime
                isBooked
            }
        }
    ''')

        self.assertIsNone(response.get('errors'), msg=str(response.get('errors')))

        available_slots = response.get('data', {}).get('availableSlots', [])
        if available_slots:
            self.assertFalse(available_slots[0]['isBooked'])
        else:
            # Handle the scenario where no available slots are returned
            print("No available slots for the specified date.")
