import React, { useState, useEffect } from "react";
import getCookie from "@/lib/utils";

interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface Notification {
  type: "error" | "success";
  message: string;
}

interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string }>;
}

interface AvailableSlotsResponse {
  availableSlots: TimeSlot[];
}

interface BookingResponse {
  booking: {
    id: string;
    bookerFirstName: string;
    bookerLastName: string;
    status: string;
  };
}

const AVAILABLE_SLOTS_QUERY = `
  query GetAvailableSlots($date: String!) {
    availableSlots(date: $date) {
      id
      startTime
      endTime
      isBooked
    }
  }
`;

const CREATE_BOOKING_MUTATION = `
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

export default function BookingForm() {
  const [date, setDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<Notification | null>(null);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  useEffect(() => {
    const fetchSlots = async () => {
      try {
        const response = await fetch("http://localhost:8000/graphql/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCookie("csrftoken") || "",
          },
          body: JSON.stringify({
            query: AVAILABLE_SLOTS_QUERY,
            variables: {
              date,
            },
          }),
        });
        const { data, errors }: GraphQLResponse<AvailableSlotsResponse> =
          await response.json();

        if (errors) {
          throw new Error(errors[0].message);
        }
        console.log(data);
        setAvailableSlots(data?.availableSlots || []);
      } catch (error) {
        setNotification({
          type: "error",
          message:
            error instanceof Error
              ? error.message
              : "Failed to fetch available slots",
        });
      }
    };
    fetchSlots();
  }, [date]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedSlot) {
      setNotification({
        type: "error",
        message: "Please select a time slot",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:8000/graphql/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCookie("csrftoken") || "",
        },
        body: JSON.stringify({
          query: CREATE_BOOKING_MUTATION,
          variables: {
            bookerFirstName: formData.firstName,
            bookerLastName: formData.lastName,
            bookerEmail: formData.email,
            bookerPhone: formData.phone,
            slotId: selectedSlot,
            status: "confirmed",
          },
        }),
      });
      const {
        data,
        errors,
      }: GraphQLResponse<{ createBooking: BookingResponse }> =
        await response.json();

      if (errors) {
        throw new Error(errors[0].message);
      }

      setNotification({
        type: "success",
        message: "Your booking has been confirmed",
      });

      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
      });
      setSelectedSlot(null);
    } catch (error) {
      setNotification({
        type: "error",
        message:
          error instanceof Error ? error.message : "Failed to create booking",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString: string): string => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getDaysInMonth = (date: Date): { days: number; firstDay: number } => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    return { days, firstDay };
  };

  const getCalendarDays = (): (number | null)[] => {
    const { days, firstDay } = getDaysInMonth(currentMonth);
    const calendar: (number | null)[] = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      calendar.push(null);
    }

    // Add the days of the month
    for (let i = 1; i <= days; i++) {
      calendar.push(i);
    }

    return calendar;
  };

  const isDateSelectable = (day: number | null): boolean => {
    if (!day) return false;
    const selectedDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );
    return selectedDate >= new Date(new Date().setHours(0, 0, 0, 0));
  };

  const handleDateClick = (day: number | null) => {
    if (!day || !isDateSelectable(day)) return;
    const newDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );
    setDate(newDate.toISOString().split("T")[0]);
  };

  const changeMonth = (increment: number) => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + increment);
    setCurrentMonth(newDate);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Book an Appointment</h1>

      {notification && (
        <div
          className={`p-4 mb-6 rounded-md ${
            notification.type === "error"
              ? "bg-red-100 text-red-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          {notification.message}
        </div>
      )}

      <div className="flex gap-6">
        {/* Calendar and Time Slots Section */}
        <div className="w-2/3 space-y-6">
          {/* Calendar Navigation */}
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => changeMonth(-1)}
              className="p-2 border rounded hover:bg-gray-50"
              type="button"
            >
              Previous
            </button>
            <h2 className="text-lg font-semibold">
              {currentMonth.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </h2>
            <button
              onClick={() => changeMonth(1)}
              className="p-2 border rounded hover:bg-gray-50"
              type="button"
            >
              Next
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="border rounded-lg shadow-sm">
            <div className="grid grid-cols-7 border-b">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="p-2 text-center font-medium text-sm">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7">
              {getCalendarDays().map((day, index) => (
                <div
                  key={index}
                  className={`p-2 border-t border-l first:border-l-0`}
                >
                  {day && (
                    <button
                      onClick={() => handleDateClick(day)}
                      disabled={!isDateSelectable(day)}
                      type="button"
                      className={`w-full h-full p-2 rounded-md text-center ${
                        date ===
                        new Date(
                          currentMonth.getFullYear(),
                          currentMonth.getMonth(),
                          day
                        )
                          .toISOString()
                          .split("T")[0]
                          ? "bg-blue-600 text-white"
                          : isDateSelectable(day)
                          ? "hover:bg-gray-50"
                          : "text-gray-300 cursor-not-allowed"
                      }`}
                    >
                      {day}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Time Slots */}
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-3">Available Time Slots</h3>
            <div className="grid grid-cols-4 gap-2">
              {availableSlots.length > 0 ? (
                availableSlots.map((slot) => (
                  <button
                    key={slot.id}
                    onClick={() => setSelectedSlot(slot.id)}
                    type="button"
                    className={`p-3 text-sm border rounded-md ${
                      selectedSlot === slot.id
                        ? "bg-blue-600 text-white"
                        : "bg-white hover:bg-gray-50"
                    }`}
                  >
                    {formatTime(slot.startTime)}
                  </button>
                ))
              ) : (
                <p className="col-span-4 text-center text-gray-500 py-4">
                  No available slots for this date
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Booking Form Section */}
        <div className="w-1/3">
          <div className="border rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-medium mb-4">Enter Your Details</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  First Name
                </label>
                <input
                  required
                  value={formData.firstName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  className="w-full p-2 border rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Last Name
                </label>
                <input
                  required
                  value={formData.lastName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  className="w-full p-2 border rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full p-2 border rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full p-2 border rounded-md"
                />
              </div>

              <button
                type="submit"
                disabled={false}
                className="w-full p-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-300 mt-4"
              >
                {loading ? "Booking..." : "Book Appointment"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
