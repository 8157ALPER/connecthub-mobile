import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Navigation } from "@/components/navigation";
import { format } from "date-fns";
import { Link } from "wouter";

export default function ActivityFeed() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

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

  const { data: activities, isLoading: isLoadingActivities } = useQuery({
    queryKey: ["/api/activities"],
    enabled: isAuthenticated,
    retry: false,
  });

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "connection": return "fas fa-users";
      case "interest": return "fas fa-heart";
      case "event": return "fas fa-calendar";
      case "group": return "fas fa-layer-group";
      case "skill": return "fas fa-graduation-cap";
      case "status": return "fas fa-comment";
      default: return "fas fa-bell";
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "connection": return "bg-blue-100 text-blue-700";
      case "interest": return "bg-pink-100 text-pink-700";
      case "event": return "bg-green-100 text-green-700";
      case "group": return "bg-purple-100 text-purple-700";
      case "skill": return "bg-orange-100 text-orange-700";
      case "status": return "bg-yellow-100 text-yellow-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading activity feed...</p>
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
              <CardTitle className="flex items-center space-x-2" data-testid="activity-feed-title">
                <i className="fas fa-stream text-primary"></i>
                <span>Activity Feed</span>
              </CardTitle>
              <p className="text-slate-600">
                Stay updated with what's happening in your network
              </p>
            </CardHeader>
          </Card>

          {/* Activities */}
          <div className="space-y-4">
            {isLoadingActivities ? (
              Array.from({ length: 8 }).map((_, i) => (
                <Card key={i} className="animate-pulse" data-testid={`skeleton-activity-${i}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-slate-200 rounded-full"></div>
                      <div className="flex-1 space-y-3">
                        <div className="space-y-2">
                          <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                          <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                        </div>
                        <div className="h-6 bg-slate-200 rounded w-20"></div>
                      </div>
                      <div className="h-3 bg-slate-200 rounded w-16"></div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : activities && (activities as any[]).length > 0 ? (
              (activities as any[]).map((activity: any) => (
                <Card key={activity.id} className="hover:shadow-md transition-all duration-200" data-testid={`activity-${activity.id}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      {/* User Avatar */}
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={activity.user?.profileImageUrl} />
                        <AvatarFallback>
                          {activity.user?.firstName?.[0] || activity.user?.displayName?.[0] || 'U'}
                        </AvatarFallback>
                      </Avatar>

                      {/* Activity Content */}
                      <div className="flex-1 space-y-3">
                        <div className="space-y-1">
                          <h3 className="font-semibold text-slate-900" data-testid={`activity-title-${activity.id}`}>
                            {activity.title}
                          </h3>
                          {activity.description && (
                            <p className="text-slate-600 text-sm" data-testid={`activity-description-${activity.id}`}>
                              {activity.description}
                            </p>
                          )}
                          <p className="text-xs text-slate-500">
                            by {activity.user?.displayName || activity.user?.firstName || "User"}
                          </p>
                        </div>

                        <div className="flex items-center space-x-3">
                          <Badge variant="outline" className={getActivityColor(activity.type)} data-testid={`activity-type-${activity.id}`}>
                            <i className={`${getActivityIcon(activity.type)} mr-1`}></i>
                            {activity.type}
                          </Badge>
                          
                          {activity.metadata?.tags && (
                            <div className="flex gap-1">
                              {activity.metadata.tags.slice(0, 2).map((tag: string, index: number) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Timestamp */}
                      <div className="text-xs text-slate-500" data-testid={`activity-time-${activity.id}`}>
                        {format(new Date(activity.createdAt), 'MMM d, h:mm a')}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-12 text-center" data-testid="no-activities">
                  <i className="fas fa-stream text-6xl text-slate-300 mb-4"></i>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">No activities yet</h3>
                  <p className="text-slate-600 mb-6">
                    Start connecting with people and joining activities to see updates here!
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