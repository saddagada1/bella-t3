import { type NotificationAction, type Notification } from "@prisma/client";
import { AlertCircle, PackagePlus } from "lucide-react";
import { type HTMLAttributes } from "react";
import { calcRelativeTime } from "~/utils/calc";
import { cn } from "~/utils/shadcn/utils";

const notificationIcons: Record<NotificationAction, React.ReactNode> = {
  NEW_ORDER: <PackagePlus />,
  EDIT_ORDER: <AlertCircle />,
  CANCEL_ORDER: <AlertCircle />,
  UPDATE_ORDER: <AlertCircle />,
};

interface NotificationCardProps extends HTMLAttributes<HTMLDivElement> {
  notification: Notification;
}

const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  ...rest
}) => {
  const { className, ...props } = rest;
  return (
    <div {...props} className={cn("flex items-center gap-4", className)}>
      <div className="shrink-0">{notificationIcons[notification.action]}</div>
      <div className="space-y-1 overflow-hidden">
        <p className="line-clamp-2 break-all text-xs">{notification.message}</p>
        <p className="text-xs text-muted-foreground">
          {calcRelativeTime(notification.createdAt)}
        </p>
      </div>
    </div>
  );
};

export default NotificationCard;
