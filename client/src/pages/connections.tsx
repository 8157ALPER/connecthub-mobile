import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Navigation } from "@/components/navigation";
import { UserCard } from "@/components/user-card";
import { Link } from "wouter";

export default function Connections() {
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

  const { data: connections, isLoading: isLoadingConnections } = useQuery({
    queryKey: ["/api/connections"],
    enabled: isAuthenticated,
    retry: false,
  });

  const { data: connectionRequests, isLoading: isLoadingRequests } = useQuery({
    queryKey: ["/api/connection-requests"],
    enabled: isAuthenticated,
    retry: false,
  });

  const updateConnectionMutation = useMutation({
    mutationFn: async ({ connectionId, status }: { connectionId: string; status: string }) => {
      return await apiRequest("PUT", `/api/connections/${connectionId}`, { status });
    },
    onSuccess: (_, { status }) => {
      toast({
        title: "Success",
        description: `Connection request ${status} successfully!`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/connections"] });
      queryClient.invalidateQueries({ queryKey: ["/api/connection-requests"] });
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
        description: "Failed to update connection request. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAcceptRequest = (connectionId: string) => {
    updateConnectionMutation.mutate({ connectionId, status: "accepted" });
  };

  const handleDeclineRequest = (connectionId: string) => {
    updateConnectionMutation.mutate({ connectionId, status: "declined" });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading connections...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900" data-testid="connections-title">
              Your Connections
            </h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto" data-testid="connections-description">
              Manage your connections and respond to new connection requests.
            </p>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="connections" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="connections" data-testid="tab-my-connections">
                My Connections
                {connections && connections.length > 0 && (
                  <Badge variant="secondary" className="ml-2" data-testid="badge-connection-count">
                    {connections.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="requests" data-testid="tab-requests">
                Requests
                {connectionRequests && connectionRequests.length > 0 && (
                  <Badge variant="destructive" className="ml-2" data-testid="badge-request-count">
                    {connectionRequests.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            {/* My Connections Tab */}
            <TabsContent value="connections" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between" data-testid="my-connections-title">
                    <span>My Connections</span>
                    <Link href="/discover">
                      <Button variant="outline" size="sm" data-testid="button-find-more">
                        <i className="fas fa-search mr-2"></i>
                        Find More People
                      </Button>
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingConnections ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {[1, 2, 3, 4, 5, 6].map((i) => (
                        <Card key={i} className="animate-pulse" data-testid={`skeleton-connection-${i}`}>
                          <CardContent className="p-6">
                            <div className="space-y-4">
                              <div className="flex items-center space-x-4">
                                <div className="w-16 h-16 bg-slate-200 rounded-full"></div>
                                <div className="space-y-2">
                                  <div className="h-4 bg-slate-200 rounded w-24"></div>
                                  <div className="h-3 bg-slate-200 rounded w-32"></div>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <div className="h-3 bg-slate-200 rounded"></div>
                                <div className="h-3 bg-slate-200 rounded w-3/4"></div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : connections && connections.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {connections.map((connection: any) => (
                        <UserCard 
                          key={connection.id} 
                          user={connection.user}
                          connectionStatus="accepted"
                          showInterests={false}
                          data-testid={`connection-card-${connection.id}`}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12" data-testid="no-connections">
                      <i className="fas fa-users text-6xl text-slate-300 mb-4"></i>
                      <h3 className="text-xl font-semibold text-slate-900 mb-2">No connections yet</h3>
                      <p className="text-slate-600 mb-6">
                        Start connecting with people who share your interests
                      </p>
                      <Link href="/discover">
                        <Button data-testid="button-discover-people">
                          <i className="fas fa-search mr-2"></i>
                          Discover People
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Connection Requests Tab */}
            <TabsContent value="requests" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle data-testid="connection-requests-title">Connection Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingRequests ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse" data-testid={`skeleton-request-${i}`}>
                          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                            <div className="flex items-center space-x-4">
                              <div className="w-16 h-16 bg-slate-200 rounded-full"></div>
                              <div className="space-y-2">
                                <div className="h-4 bg-slate-200 rounded w-32"></div>
                                <div className="h-3 bg-slate-200 rounded w-24"></div>
                                <div className="h-3 bg-slate-200 rounded w-40"></div>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <div className="h-8 w-16 bg-slate-200 rounded"></div>
                              <div className="h-8 w-16 bg-slate-200 rounded"></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : connectionRequests && connectionRequests.length > 0 ? (
                    <div className="space-y-4">
                      {connectionRequests.map((request: any) => (
                        <div 
                          key={request.id} 
                          className="flex items-start justify-between p-6 bg-slate-50 rounded-lg"
                          data-testid={`request-item-${request.id}`}
                        >
                          <div className="flex items-start space-x-4 flex-1">
                            <img 
                              src={request.requester.profileImageUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=60&h=60"} 
                              alt={request.requester.displayName} 
                              className="w-16 h-16 rounded-full object-cover"
                              data-testid={`request-user-image-${request.id}`}
                            />
                            <div className="flex-1">
                              <h3 className="font-semibold text-slate-900 mb-1" data-testid={`request-user-name-${request.id}`}>
                                {request.requester.displayName || request.requester.firstName}
                              </h3>
                              <p className="text-sm text-slate-500 mb-2" data-testid={`request-user-location-${request.id}`}>
                                {request.requester.location}
                              </p>
                              {request.requester.bio && (
                                <p className="text-sm text-slate-600 mb-3" data-testid={`request-user-bio-${request.id}`}>
                                  {request.requester.bio}
                                </p>
                              )}
                              <p className="text-xs text-slate-500" data-testid={`request-time-${request.id}`}>
                                Requested {new Date(request.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col space-y-2 ml-4">
                            <Button 
                              size="sm" 
                              onClick={() => handleAcceptRequest(request.id)}
                              disabled={updateConnectionMutation.isPending}
                              data-testid={`button-accept-${request.id}`}
                            >
                              <i className="fas fa-check mr-2"></i>
                              Accept
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleDeclineRequest(request.id)}
                              disabled={updateConnectionMutation.isPending}
                              data-testid={`button-decline-${request.id}`}
                            >
                              <i className="fas fa-times mr-2"></i>
                              Decline
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12" data-testid="no-requests">
                      <i className="fas fa-user-plus text-6xl text-slate-300 mb-4"></i>
                      <h3 className="text-xl font-semibold text-slate-900 mb-2">No pending requests</h3>
                      <p className="text-slate-600 mb-6">
                        New connection requests will appear here
                      </p>
                      <Link href="/discover">
                        <Button variant="outline" data-testid="button-discover-more">
                          <i className="fas fa-search mr-2"></i>
                          Discover More People
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
