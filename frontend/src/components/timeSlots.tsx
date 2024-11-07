import React from "react";
import { TimeSlot } from "@/lib/types";

interface TimeSlotsProps {
  availableSlots: TimeSlot[];
  selectedSlot: string | null;
  onSlotSelect: (slotId: string) => void;
}

export const TimeSlots: React.FC<TimeSlotsProps> = ({
  availableSlots,
  selectedSlot,
  onSlotSelect,
}) => {
  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: "UTC",
    });
  };

  const groupTimeSlots = () => {
    return availableSlots.reduce(
      (groups, slot) => {
        const hour = new Date(slot.startTime).getUTCHours();

        if (hour < 12) {
          groups.morning.push(slot);
        } else if (hour < 17) {
          groups.afternoon.push(slot);
        } else {
          groups.evening.push(slot);
        }

        return groups;
      },
      { morning: [], afternoon: [], evening: [] } as Record<string, TimeSlot[]>
    );
  };

  const getSlotClassName = (slot: TimeSlot, isSelected: boolean): string => {
    const baseClasses = "p-3 text-sm border rounded-md transition-colors";

    if (slot.isBooked) {
      return `${baseClasses} bg-gray-100 text-gray-400 cursor-not-allowed opacity-50`;
    }

    if (isSelected) {
      return `${baseClasses} bg-blue-600 text-white border-blue-700`;
    }

    return `${baseClasses} bg-white hover:bg-gray-50 border-gray-200`;
  };

  const handleSlotClick = (slot: TimeSlot) => {
    if (!slot.isBooked) {
      onSlotSelect(slot.id);
    }
  };

  const renderTimeGroup = (title: string, slots: TimeSlot[]) => {
    if (slots.length === 0) return null;

    return (
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-500 mb-2">{title}</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {slots.map((slot) => (
            <button
              key={slot.id}
              onClick={() => handleSlotClick(slot)}
              disabled={slot.isBooked}
              type="button"
              className={getSlotClassName(slot, selectedSlot === slot.id)}
            >
              <span>{formatTime(slot.startTime)}</span>
              {slot.isBooked && (
                <span className="block text-xs mt-1 text-gray-500">Booked</span>
              )}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const timeGroups = groupTimeSlots();

  return (
    <div className="mt-6">
      <h3 className="text-lg font-medium mb-3">Available Time Slots</h3>
      <div className="space-y-4">
        {renderTimeGroup("Morning", timeGroups.morning)}
        {renderTimeGroup("Afternoon", timeGroups.afternoon)}
        {renderTimeGroup("Evening", timeGroups.evening)}

        {availableSlots.length === 0 && (
          <p className="text-center text-gray-500 py-4">
            No available slots for this date
          </p>
        )}
      </div>
    </div>
  );
};
