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
          bookerFirstName
          bookerLastName
          status
        }
      }
    }
  `;
