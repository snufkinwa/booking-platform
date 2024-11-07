import React, { useState, useEffect } from "react";
import getCookie from "@/lib/utils";
import { NotificationBanner } from "@/components/notificationBanner";
import { Calendar } from "@/components/calendar";
import { TimeSlots } from "@/components/timeSlots";
import { BookingDetailsForm } from "@/components/bookingDetailsForm";
import {
  TimeSlot,
  FormData,
  Notification,
  GraphQLResponse,
  AvailableSlotsResponse,
  BookingResponse,
} from "@/lib/types";
import { AVAILABLE_SLOTS_QUERY, CREATE_BOOKING_MUTATION } from "@/lib/queries";

export default function BookingForm() {
  // State management
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

  // Fetch available slots
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
            variables: { date },
          }),
        });

        const { data, errors }: GraphQLResponse<AvailableSlotsResponse> =
          await response.json();

        if (errors) {
          throw new Error(errors[0].message);
        }

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

  // Handle form submission
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

      // Reset form
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

  // Calendar handlers
  const handleDateClick = (day: number) => {
    const newDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );
    setDate(newDate.toISOString().split("T")[0]);
  };

  const handleMonthChange = (increment: number) => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + increment);
    setCurrentMonth(newDate);
  };

  // Form field change handler
  const handleFormChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      <h1 className="text-2xl font-bold mb-6">Book an Appointment</h1>

      <NotificationBanner notification={notification} />

      <div className="flex flex-col space-y-6">
        <div className="w-full space-y-6">
          <Calendar
            currentMonth={currentMonth}
            selectedDate={date}
            onDateSelect={handleDateClick}
            onMonthChange={handleMonthChange}
          />

          <TimeSlots
            availableSlots={availableSlots}
            selectedSlot={selectedSlot}
            onSlotSelect={setSelectedSlot}
          />
        </div>

        <BookingDetailsForm
          formData={formData}
          onChange={handleFormChange}
          onSubmit={handleSubmit}
          loading={loading}
        />
      </div>
    </div>
  );
}
