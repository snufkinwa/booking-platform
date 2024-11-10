import graphene
import datetime
from graphene_django.types import DjangoObjectType
from .models import Booking, Slot
from graphene_subscriptions.events import CREATED, UPDATED, DELETED
from django.core.exceptions import ObjectDoesNotExist


class SlotType(DjangoObjectType):
    class Meta:
        model = Slot
# Define the BookingType which is a representation of the Booking model in GraphQL
class BookingType(DjangoObjectType):
    class Meta:
        model = Booking

# Subscription for when a booking is created
class BookingCreatedSubscription(graphene.ObjectType):
    booking_created = graphene.Field(BookingType)

    def resolve_booking_created(root, info):
        return root.filter(
            lambda event:
                event.operation == CREATED and
                isinstance(event.instance, Booking)
        ).map(lambda event: event.instance)

# Subscription for when a booking is updated
class BookingUpdatedSubscription(graphene.ObjectType):
    booking_updated = graphene.Field(BookingType)

    def resolve_booking_updated(root, info):
        return root.filter(
            lambda event: 
                event.operation == UPDATED and
                isinstance(event.instance, Booking)
        ).map(lambda event: event.instance)

# Subscription for when a booking is deleted
class BookingDeletedSubscription(graphene.ObjectType):
    booking_deleted = graphene.Field(BookingType)

    def resolve_booking_deleted(root, info):
        return root.filter(
            lambda event: 
                event.operation == DELETED and
                isinstance(event.instance, Booking)
        ).map(lambda event: event.instance)

# GraphQL query to fetch all bookings
class Query(graphene.ObjectType):
    all_bookings = graphene.List(BookingType)
    all_slots = graphene.List(SlotType)
    available_slots = graphene.List(SlotType, date=graphene.String(required=True))
    booking_by_id = graphene.Field(BookingType, id=graphene.ID(required=True))

    def resolve_all_bookings(self, info, **kwargs):
        return Booking.objects.all()

    def resolve_all_slots(self, info, **kwargs):
        return Slot.objects.all()

    def resolve_booking_by_id(self, info, id):
        try:
            return Booking.objects.get(pk=id)
        except ObjectDoesNotExist:
            return None

    def resolve_available_slots(self, info, date, **kwargs):
        # Convert the provided date string to a datetime object
        try:
            date_obj = datetime.datetime.strptime(date, "%Y-%m-%d").date()
        except ValueError:
            raise ValueError("Invalid date format. Please provide the date in YYYY-MM-DD format.")

        # Filter slots based on the provided date and whether they are booked or not
        return Slot.objects.filter(start_time__date=date_obj, is_booked=False)


# GraphQL mutation to create a booking
class CreateBooking(graphene.Mutation):
    booking = graphene.Field(BookingType)

    class Arguments:
        booker_first_name = graphene.String(required=True)
        booker_last_name = graphene.String(required=True)
        booker_email = graphene.String(required=True)
        booker_phone = graphene.String(required=True)
        slot_id = graphene.ID(required=True)
        status = graphene.String(required=True)

    @staticmethod
    def mutate(root, info, booker_first_name, booker_last_name, booker_email, booker_phone, slot_id, status):
        slot = Slot.objects.get(pk=slot_id)
        booking = Booking(
            booker_first_name=booker_first_name,
            booker_last_name=booker_last_name,
            booker_email=booker_email,
            booker_phone=booker_phone,
            slot=slot,
            status=status
        )
        booking.save()
        return CreateBooking(booking=booking)

# GraphQL mutation to delete a booking
class DeleteBooking(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)

    success = graphene.Boolean()

    @staticmethod
    def mutate(root, info, id):
        try:
            booking = Booking.objects.get(pk=id)
            booking.delete()
            return DeleteBooking(success=True)
        except Booking.DoesNotExist:
            raise GraphQLError('Booking not found')

class CreateSlot(graphene.Mutation):
    class Arguments:
        start_time = graphene.DateTime(required=True)
        end_time = graphene.DateTime(required=True)

    slot = graphene.Field(SlotType)

    @staticmethod
    def mutate(root, info, start_time, end_time):
        slot = Slot(start_time=start_time, end_time=end_time)
        slot.save()
        return CreateSlot(slot=slot)

class UpdateSlot(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)
        start_time = graphene.DateTime()
        end_time = graphene.DateTime()
        is_booked = graphene.Boolean()

    slot = graphene.Field(SlotType)

    @staticmethod
    def mutate(root, info, id, start_time=None, end_time=None, is_booked=None):
        slot = Slot.objects.get(pk=id)
        if start_time:
            slot.start_time = start_time
        if end_time:
            slot.end_time = end_time
        if is_booked is not None:
            slot.is_booked = is_booked
        slot.save()
        return UpdateSlot(slot=slot)

class DeleteSlot(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)

    success = graphene.Boolean()

    @staticmethod
    def mutate(root, info, id):
        try:
            slot = Slot.objects.get(pk=id)
            slot.delete()
            return DeleteSlot(success=True)
        except Slot.DoesNotExist:
            raise GraphQLError('Slot not found')

class CancelBooking(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)

    booking = graphene.Field(BookingType)
    success = graphene.Boolean()

    @staticmethod
    def mutate(root, info, id):
        try:
            booking = Booking.objects.get(pk=id)
            booking.status = 'cancelled'
            booking.save()
            
            # Free up the slot
            if booking.slot:
                booking.slot.is_booked = False
                booking.slot.save()
                
            return CancelBooking(success=True, booking=booking)
        except Booking.DoesNotExist:
            return CancelBooking(success=False, booking=None)

# Aggregating all mutations
class Mutation(graphene.ObjectType):
    create_booking = CreateBooking.Field()
    delete_booking = DeleteBooking.Field()
    cancel_booking = CancelBooking.Field()
    create_slot = CreateSlot.Field()
    update_slot = UpdateSlot.Field()
    delete_slot = DeleteSlot.Field()


# Aggregating all subscriptions
class Subscription(BookingCreatedSubscription, BookingUpdatedSubscription, BookingDeletedSubscription, graphene.ObjectType):
    pass

# Creating the overall schema for GraphQL
schema = graphene.Schema(query=Query, mutation=Mutation, subscription=Subscription)
