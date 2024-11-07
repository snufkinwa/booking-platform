interface CalendarProps {
  currentMonth: Date;
  selectedDate: string;
  onDateSelect: (day: number) => void;
  onMonthChange: (increment: number) => void;
}

export const Calendar: React.FC<CalendarProps> = ({
  currentMonth,
  selectedDate,
  onDateSelect,
  onMonthChange,
}) => {
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

    for (let i = 0; i < firstDay; i++) {
      calendar.push(null);
    }

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

  return (
    <div className="w-full space-y-6">
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => onMonthChange(-1)}
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
          onClick={() => onMonthChange(1)}
          className="p-2 border rounded hover:bg-gray-50"
          type="button"
        >
          Next
        </button>
      </div>

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
                  onClick={() => isDateSelectable(day) && onDateSelect(day)}
                  disabled={!isDateSelectable(day)}
                  type="button"
                  className={`w-full h-full p-2 rounded-md text-center ${
                    selectedDate ===
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
    </div>
  );
};
