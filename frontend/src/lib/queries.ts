export const AVAILABLE_SLOTS_QUERY = `
  query GetAvailableSlots($date: String!) {
    availableSlots(date: $date) {
      id
      startTime
      endTime
      isBooked
    }
  }
`;

export const CREATE_BOOKING_MUTATION = `
  mutation CreateBooking(
    $bookerFirstName: String!
    $bookerLastName: String!
    $bookerEmail: String!
    $bookerPhone: String!
    $slotId: ID!
    $status: String!
  ) {
    createBooking(
      bookerFirstName: $bookerFirstName
      bookerLastName: $bookerLastName
      bookerEmail: $bookerEmail
      bookerPhone: $bookerPhone
      slotId: $slotId
      status: $status
    ) {
      booking {
        id
        booking_id
        bookerFirstName
        bookerLastName
        status
        slot {
          id
          startTime
          endTime
          isBooked
        }
      }
    }
  }
`;

export const CANCEL_BOOKING_MUTATION = `
  mutation CancelBooking($id: ID!) {
    cancelBooking(id: $id) {
      success
      booking {
        id
        booking_id
        status
        slot {
          id
          isBooked
        }
      }
    }
  }
`;

export const GET_BOOKING_BY_ID = `
  query GetBookingByBookingId($bookingId: String!) {
    bookingByBookingId(bookingId: $bookingId) {
      id
      bookingId
      bookerFirstName
      bookerLastName
      bookerEmail
      bookerPhone
      status
      slot {
        id
        startTime
        endTime
        isBooked
      }
    }
  }
`;
