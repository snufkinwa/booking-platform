export interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
}

export interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface Notification {
  type: "error" | "success";
  message: string;
}

export interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string }>;
}

export interface AvailableSlotsResponse {
  availableSlots: TimeSlot[];
}

export interface BookingResponse {
  booking: {
    id: string;
    bookerFirstName: string;
    bookerLastName: string;
    status: string;
  };
}
