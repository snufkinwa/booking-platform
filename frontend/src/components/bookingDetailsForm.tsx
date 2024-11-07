import { FormData } from "@/lib/types";

interface BookingDetailsFormProps {
  formData: FormData;
  onChange: (field: keyof FormData, value: string) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  loading: boolean;
}

export const BookingDetailsForm: React.FC<BookingDetailsFormProps> = ({
  formData,
  onChange,
  onSubmit,
  loading,
}) => {
  return (
    <div className="w-full md:max-w-2xl mx-auto">
      <div className="border rounded-lg p-4 sm:p-6 shadow-sm">
        <h3 className="text-lg font-medium mb-4">Enter Your Details</h3>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                First Name
              </label>
              <input
                required
                value={formData.firstName}
                onChange={(e) => onChange("firstName", e.target.value)}
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
                onChange={(e) => onChange("lastName", e.target.value)}
                className="w-full p-2 border rounded-md"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => onChange("email", e.target.value)}
              className="w-full p-2 border rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => onChange("phone", e.target.value)}
              className="w-full p-2 border rounded-md"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full p-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-300 mt-4"
          >
            {loading ? "Booking..." : "Book Appointment"}
          </button>
        </form>
      </div>
    </div>
  );
};
