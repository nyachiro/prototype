import { useState, useEffect } from "react";
import { Bell, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Notification } from "@/types";
import { storageUtils } from "@/utils/storage";

interface NotificationCenterProps {
  userId: string;
}

const NotificationCenter = ({ userId }: NotificationCenterProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setNotifications(storageUtils.getNotifications(userId));
  }, [userId]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    storageUtils.markNotificationRead(id);
    setNotifications(storageUtils.getNotifications(userId));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "verdict_published":
        return <Check className="w-4 h-4 text-truth-green" />;
      case "claim_rejected":
        return <X className="w-4 h-4 text-false-red" />;
      default:
        return <Bell className="w-4 h-4 text-primary" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md max-h-96">
        <DialogHeader>
          <DialogTitle>Notifications</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-3 overflow-y-auto">
          {notifications.length === 0 ? (
            <p className="text-center text-gray-500 py-4">No notifications yet</p>
          ) : (
            notifications.map((notification) => (
              <Card 
                key={notification.id} 
                className={`p-3 cursor-pointer transition-colors ${
                  !notification.read ? "bg-blue-50 border-blue-200" : ""
                }`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex items-start gap-3">
                  {getNotificationIcon(notification.type)}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{notification.title}</p>
                    <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(notification.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {!notification.read && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NotificationCenter;