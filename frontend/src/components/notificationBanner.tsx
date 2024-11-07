import { Notification } from "@/lib/types";

interface NotificationBannerProps {
  notification: Notification | null;
}

export const NotificationBanner: React.FC<NotificationBannerProps> = ({
  notification,
}) => {
  if (!notification) return null;

  return (
    <div
      className={`p-4 mb-6 rounded-md ${
        notification.type === "error"
          ? "bg-red-100 text-red-700"
          : "bg-green-100 text-green-700"
      }`}
    >
      {notification.message}
    </div>
  );
};
