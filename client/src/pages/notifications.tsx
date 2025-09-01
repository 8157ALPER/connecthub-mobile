import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Navigation } from "@/components/navigation";
import { format } from "date-fns";
import { Link } from "wouter";

export default function Notifications() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: notifications, isLoading: isLoadingNotifications } = useQuery({
    queryKey: ["/api/notifications"],
    enabled: isAuthenticated,
    retry: false,
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      return await apiRequest("PATCH", `/api/notifications/${notificationId}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to mark notification as read.",
        variant: "destructive",
      });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("PATCH", "/api/notifications/mark-all-read");
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "All notifications marked as read!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to mark all notifications as read.",
        variant: "destructive",
      });
    },
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "connection": return "fas fa-user-plus";
      case "message": return "fas fa-envelope";
      case "event": return "fas fa-calendar";
      case "group": return "fas fa-layer-group";
      case "skill": return "fas fa-graduation-cap";
      case "activity": return "fas fa-bell";
      default: return "fas fa-info-circle";
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "connection": return "bg-blue-100 text-blue-700";
      case "message": return "bg-green-100 text-green-700";
      case "event": return "bg-purple-100 text-purple-700";
      case "group": return "bg-orange-100 text-orange-700";
      case "skill": return "bg-pink-100 text-pink-700";
      case "activity": return "bg-yellow-100 text-yellow-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getNotificationLink = (notification: any) => {
    switch (notification.relatedType) {
      case "user": return `/profile`;
      case "event": return `/events`;
      case "group": return `/groups`;
      case "skill": return `/skills`;
      case "message": return `/messages`;
      default: return "/";
    }
  };

  const unreadCount = notifications ? (notifications as any[]).filter((n: any) => !n.isRead).length : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2" data-testid="notifications-title">
                    <i className="fas fa-bell text-primary"></i>
                    <span>Notifications</span>
                    {unreadCount > 0 && (
                      <Badge variant="destructive" data-testid="unread-count">
                        {unreadCount} unread
                      </Badge>
                    )}
                  </CardTitle>
                  <p className="text-slate-600 mt-2">
                    Stay updated with activities and interactions
                  </p>
                </div>
                {unreadCount > 0 && (
                  <Button 
                    variant="outline" 
                    onClick={() => markAllAsReadMutation.mutate()}
                    disabled={markAllAsReadMutation.isPending}
                    data-testid="button-mark-all-read"
                  >
                    <i className="fas fa-check mr-2"></i>
                    Mark All Read
                  </Button>
                )}
              </div>
            </CardHeader>
          </Card>

          {/* Notifications */}
          <div className="space-y-3">
            {isLoadingNotifications ? (
              Array.from({ length: 8 }).map((_, i) => (
                <Card key={i} className="animate-pulse" data-testid={`skeleton-notification-${i}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-slate-200 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                        <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                        <div className="h-3 bg-slate-200 rounded w-1/4"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : notifications && (notifications as any[]).length > 0 ? (
              (notifications as any[]).map((notification: any) => (
                <Link 
                  key={notification.id} 
                  href={getNotificationLink(notification)}
                  onClick={() => {
                    if (!notification.isRead) {
                      markAsReadMutation.mutate(notification.id);
                    }
                  }}
                >
                  <Card 
                    className={`hover:shadow-md transition-all duration-200 cursor-pointer ${
                      !notification.isRead ? 'border-primary/50 bg-primary/5' : ''
                    }`}
                    data-testid={`notification-${notification.id}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-4">
                        {/* Notification Icon */}
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getNotificationColor(notification.type)}`}>
                          <i className={`${getNotificationIcon(notification.type)} text-sm`}></i>
                        </div>

                        {/* Notification Content */}
                        <div className="flex-1 space-y-1">
                          <h3 className="font-semibold text-slate-900" data-testid={`notification-title-${notification.id}`}>
                            {notification.title}
                          </h3>
                          {notification.message && (
                            <p className="text-slate-600 text-sm" data-testid={`notification-message-${notification.id}`}>
                              {notification.message}
                            </p>
                          )}
                          <div className="flex items-center space-x-3">
                            <Badge variant="outline" className="text-xs" data-testid={`notification-type-${notification.id}`}>
                              {notification.type}
                            </Badge>
                            <span className="text-xs text-slate-500" data-testid={`notification-time-${notification.id}`}>
                              {format(new Date(notification.createdAt), 'MMM d, h:mm a')}
                            </span>
                          </div>
                        </div>

                        {/* Unread Indicator */}
                        {!notification.isRead && (
                          <div className="w-3 h-3 bg-primary rounded-full" data-testid={`unread-dot-${notification.id}`}></div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            ) : (
              <Card>
                <CardContent className="p-12 text-center" data-testid="no-notifications">
                  <i className="fas fa-bell text-6xl text-slate-300 mb-4"></i>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">No notifications yet</h3>
                  <p className="text-slate-600 mb-6">
                    Start connecting with people and joining activities to receive notifications!
                  </p>
                  <div className="flex gap-4 justify-center">
                    <Link href="/discover">
                      <Button data-testid="button-discover-people">
                        <i className="fas fa-search mr-2"></i>
                        Discover People
                      </Button>
                    </Link>
                    <Link href="/events">
                      <Button variant="outline" data-testid="button-explore-events">
                        <i className="fas fa-calendar mr-2"></i>
                        Explore Events
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}