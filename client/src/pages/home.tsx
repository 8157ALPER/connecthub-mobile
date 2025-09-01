import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Navigation } from "@/components/navigation";
import { UserCard } from "@/components/user-card";
import { Link } from "wouter";

export default function Home() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [isBored, setIsBored] = useState(false);

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

  const { data: discoveredUsers, isLoading: isDiscovering } = useQuery({
    queryKey: ["/api/discover"],
    enabled: isAuthenticated,
    retry: false,
  });

  const { data: connectionRequests, isLoading: isLoadingRequests } = useQuery({
    queryKey: ["/api/connection-requests"],
    enabled: isAuthenticated,
    retry: false,
  });

  const { data: connections } = useQuery({
    queryKey: ["/api/connections"],
    enabled: isAuthenticated,
    retry: false,
  });

  const { data: boredUsers, isLoading: isLoadingBored } = useQuery({
    queryKey: ["/api/bored-users"],
    enabled: isAuthenticated,
    retry: false,
  });

  const toggleBoredMutation = useMutation({
    mutationFn: async (bored: boolean) => {
      return await apiRequest("POST", "/api/user-bored-status", { isBored: bored });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: isBored ? "You're now marked as bored!" : "You're no longer marked as bored",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/bored-users"] });
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
        description: "Failed to update bored status. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleBoredToggle = (checked: boolean) => {
    setIsBored(checked);
    toggleBoredMutation.mutate(checked);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Main Dashboard Area */}
          <div className="lg:col-span-2 space-y-8">
            {/* Welcome Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-slate-900" data-testid="welcome-title">
                  Welcome to Your Community
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 mb-6" data-testid="welcome-description">
                  Discover new connections, manage your relationships, and explore shared interests with like-minded people.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/discover" className="flex-1">
                    <Button className="w-full h-12 md:h-10 text-lg md:text-base touch-manipulation" data-testid="button-discover-people">
                      <i className="fas fa-search mr-2"></i>
                      Discover People
                    </Button>
                  </Link>
                  <Link href="/profile" className="flex-1">
                    <Button variant="outline" className="w-full h-12 md:h-10 text-lg md:text-base touch-manipulation" data-testid="button-edit-profile">
                      <i className="fas fa-user-edit mr-2"></i>
                      Edit Profile
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* I am Bored Section */}
            <Card className="bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-orange-900 flex items-center" data-testid="bored-section-title">
                  <i className="fas fa-coffee mr-3 text-orange-600"></i>
                  I am Bored
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-orange-200">
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-slate-900" data-testid="bored-toggle-title">
                        Looking for something to do?
                      </h3>
                      <p className="text-slate-600" data-testid="bored-toggle-description">
                        Let others know you're bored and discover people with similar interests who are also looking for activities!
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Label htmlFor="home-bored-switch" className="text-sm font-medium">
                        {isBored ? "I'm bored!" : "Not bored"}
                      </Label>
                      <Switch
                        id="home-bored-switch"
                        checked={isBored}
                        onCheckedChange={handleBoredToggle}
                        disabled={toggleBoredMutation.isPending}
                        data-testid="home-bored-toggle"
                      />
                    </div>
                  </div>
                  
                  {/* Bored Users Preview */}
                  {boredUsers && (boredUsers as any[]).length > 0 ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-slate-900" data-testid="bored-users-title">
                          People currently bored ({(boredUsers as any[]).length})
                        </h4>
                        <Link href="/bored">
                          <Button variant="outline" size="sm" data-testid="view-all-bored">
                            View All
                          </Button>
                        </Link>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        {(boredUsers as any[]).slice(0, 2).map((user: any) => (
                          <div key={user.id} className="relative">
                            <UserCard 
                              user={user} 
                              showInterests={true}
                              data-testid={`home-bored-user-${user.id}`}
                            />
                            <Badge 
                              className="absolute -top-2 -right-2 bg-orange-500 text-white"
                              data-testid={`home-bored-badge-${user.id}`}
                            >
                              <i className="fas fa-clock mr-1"></i>
                              Bored
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  
                  {/* Call to Action */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link href="/bored" className="flex-1">
                      <Button className="w-full bg-orange-600 hover:bg-orange-700" data-testid="explore-bored-community">
                        <i className="fas fa-users mr-2"></i>
                        Explore Bored Community
                      </Button>
                    </Link>
                    {!isBored && (
                      <Button 
                        variant="outline" 
                        onClick={() => handleBoredToggle(true)}
                        disabled={toggleBoredMutation.isPending}
                        data-testid="mark-myself-bored"
                      >
                        <i className="fas fa-hand-peace mr-2"></i>
                        Mark Myself as Bored
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs for different sections */}
            <Tabs defaultValue="activity" className="w-full">
              <TabsList className="grid w-full grid-cols-3 h-auto">
                <TabsTrigger value="activity" className="h-12 md:h-10 text-base md:text-sm touch-manipulation" data-testid="tab-activity">Activity</TabsTrigger>
                <TabsTrigger value="discover" className="h-12 md:h-10 text-base md:text-sm touch-manipulation" data-testid="tab-discover">Discover</TabsTrigger>
                <TabsTrigger value="requests" className="h-12 md:h-10 text-base md:text-sm touch-manipulation" data-testid="tab-requests">
                  Requests
                  {connectionRequests && (connectionRequests as any[]).length > 0 ? (
                    <Badge variant="destructive" className="ml-2" data-testid="badge-request-count">
                      {(connectionRequests as any[]).length}
                    </Badge>
                  ) : null}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="activity" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle data-testid="activity-title">Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {connections && (connections as any[]).length > 0 ? (
                      <div className="space-y-4">
                        {(connections as any[]).slice(0, 3).map((connection: any) => (
                          <div key={connection.id} className="flex items-center space-x-4 p-4 bg-slate-50 rounded-lg" data-testid={`activity-item-${connection.id}`}>
                            <img 
                              src={connection.user.profileImageUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=60&h=60"} 
                              alt={connection.user.displayName} 
                              className="w-10 h-10 rounded-full object-cover"
                              data-testid={`activity-user-image-${connection.id}`}
                            />
                            <div className="flex-1">
                              <p className="text-slate-900" data-testid={`activity-user-name-${connection.id}`}>
                                <span className="font-semibold">{connection.user.displayName || connection.user.firstName}</span> is now connected with you
                              </p>
                              <p className="text-sm text-slate-500" data-testid={`activity-time-${connection.id}`}>
                                {new Date(connection.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8" data-testid="no-activity">
                        <i className="fas fa-clock text-4xl text-slate-300 mb-4"></i>
                        <p className="text-slate-500">No recent activity</p>
                        <p className="text-sm text-slate-400 mt-2">Start connecting with people to see activity here</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="discover" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle data-testid="discover-title">People You Might Like</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isDiscovering ? (
                      <div className="text-center py-8" data-testid="discover-loading">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-2 text-slate-500">Finding people for you...</p>
                      </div>
                    ) : discoveredUsers && (discoveredUsers as any[]).length > 0 ? (
                      <div className="grid md:grid-cols-2 gap-4">
                        {(discoveredUsers as any[]).slice(0, 4).map((user: any) => (
                          <UserCard key={user.id} user={user} showInterests={true} data-testid={`discovered-user-${user.id}`} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8" data-testid="no-discoveries">
                        <i className="fas fa-users text-4xl text-slate-300 mb-4"></i>
                        <p className="text-slate-500">No people to discover yet</p>
                        <p className="text-sm text-slate-400 mt-2">Add interests to your profile to find like-minded people</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="requests" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle data-testid="requests-title">Connection Requests</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoadingRequests ? (
                      <div className="text-center py-8" data-testid="requests-loading">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-2 text-slate-500">Loading requests...</p>
                      </div>
                    ) : connectionRequests && (connectionRequests as any[]).length > 0 ? (
                      <div className="space-y-4">
                        {(connectionRequests as any[]).map((request: any) => (
                          <div key={request.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg" data-testid={`request-item-${request.id}`}>
                            <div className="flex items-center space-x-4">
                              <img 
                                src={request.requester.profileImageUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=60&h=60"} 
                                alt={request.requester.displayName} 
                                className="w-12 h-12 rounded-full object-cover"
                                data-testid={`request-user-image-${request.id}`}
                              />
                              <div>
                                <p className="font-semibold text-slate-900" data-testid={`request-user-name-${request.id}`}>
                                  {request.requester.displayName || request.requester.firstName}
                                </p>
                                <p className="text-sm text-slate-500" data-testid={`request-user-location-${request.id}`}>
                                  {request.requester.location}
                                </p>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <Button size="sm" data-testid={`button-accept-${request.id}`}>
                                Accept
                              </Button>
                              <Button variant="outline" size="sm" data-testid={`button-decline-${request.id}`}>
                                Decline
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8" data-testid="no-requests">
                        <i className="fas fa-user-plus text-4xl text-slate-300 mb-4"></i>
                        <p className="text-slate-500">No pending connection requests</p>
                        <p className="text-sm text-slate-400 mt-2">New connection requests will appear here</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card className="bg-gradient-to-r from-primary to-secondary text-white">
              <CardHeader>
                <CardTitle className="text-lg" data-testid="stats-title">Your Network</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Connections</span>
                  <span className="font-semibold" data-testid="stat-connections">
                    {connections ? (connections as any[]).length : 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Requests</span>
                  <span className="font-semibold" data-testid="stat-requests">
                    {connectionRequests ? (connectionRequests as any[]).length : 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Discoveries</span>
                  <span className="font-semibold" data-testid="stat-discoveries">
                    {discoveredUsers ? (discoveredUsers as any[]).length : 0}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle data-testid="actions-title">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/discover" className="block">
                  <Button variant="outline" className="w-full justify-start" data-testid="action-discover">
                    <i className="fas fa-search mr-2"></i>
                    Discover People
                  </Button>
                </Link>
                <Link href="/connections" className="block">
                  <Button variant="outline" className="w-full justify-start" data-testid="action-connections">
                    <i className="fas fa-users mr-2"></i>
                    My Connections
                  </Button>
                </Link>
                <Link href="/messages" className="block">
                  <Button variant="outline" className="w-full justify-start" data-testid="action-messages">
                    <i className="fas fa-envelope mr-2"></i>
                    Messages
                  </Button>
                </Link>
                <Link href="/profile" className="block">
                  <Button variant="outline" className="w-full justify-start" data-testid="action-profile">
                    <i className="fas fa-user mr-2"></i>
                    Edit Profile
                  </Button>
                </Link>
                <Link href="/bored" className="block">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200" 
                    data-testid="action-bored"
                  >
                    <i className="fas fa-coffee mr-2"></i>
                    I am Bored
                    {boredUsers && (boredUsers as any[]).length > 0 ? (
                      <Badge variant="secondary" className="ml-auto">
                        {(boredUsers as any[]).length}
                      </Badge>
                    ) : null}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
