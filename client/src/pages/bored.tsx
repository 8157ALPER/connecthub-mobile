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
import { InterestTag } from "@/components/interest-tag";

export default function Bored() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
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

  const { data: boredUsers, isLoading: isLoadingBored } = useQuery({
    queryKey: ["/api/bored-users"],
    enabled: isAuthenticated,
    retry: false,
  });

  const { data: interestGroups, isLoading: isLoadingGroups } = useQuery({
    queryKey: ["/api/interest-groups"],
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
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
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
          <p className="mt-4 text-slate-600">Loading bored community...</p>
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
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900" data-testid="bored-title">
              I am Bored
            </h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto" data-testid="bored-description">
              Connect with other bored people and discover activities based on shared interests. Turn boredom into connection!
            </p>
          </div>

          {/* Bored Status Toggle */}
          <Card className="bg-gradient-to-r from-primary/10 to-secondary/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-slate-900" data-testid="status-title">
                    Are you bored right now?
                  </h3>
                  <p className="text-slate-600" data-testid="status-description">
                    Let others know you're looking for something fun to do and discover people with similar interests
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <Label htmlFor="bored-switch" className="text-sm font-medium">
                    {isBored ? "I'm bored!" : "Not bored"}
                  </Label>
                  <Switch
                    id="bored-switch"
                    checked={isBored}
                    onCheckedChange={handleBoredToggle}
                    disabled={toggleBoredMutation.isPending}
                    data-testid="bored-toggle"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs defaultValue="bored-people" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="bored-people" data-testid="tab-bored-people">
                Bored People
                {boredUsers && (boredUsers as any[]).length > 0 ? (
                  <Badge variant="secondary" className="ml-2" data-testid="badge-bored-count">
                    {(boredUsers as any[]).length}
                  </Badge>
                ) : null}
              </TabsTrigger>
              <TabsTrigger value="interest-groups" data-testid="tab-interest-groups">
                Interest Groups
                {interestGroups && (interestGroups as any[]).length > 0 ? (
                  <Badge variant="secondary" className="ml-2" data-testid="badge-groups-count">
                    {(interestGroups as any[]).length}
                  </Badge>
                ) : null}
              </TabsTrigger>
            </TabsList>

            {/* Bored People Tab */}
            <TabsContent value="bored-people" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle data-testid="bored-people-title">People Looking for Activities</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingBored ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {[1, 2, 3, 4, 5, 6].map((i) => (
                        <Card key={i} className="animate-pulse" data-testid={`skeleton-bored-${i}`}>
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
                              <div className="flex gap-2">
                                <div className="h-6 bg-slate-200 rounded w-16"></div>
                                <div className="h-6 bg-slate-200 rounded w-20"></div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : boredUsers && (boredUsers as any[]).length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {(boredUsers as any[]).map((user: any) => (
                        <div key={user.id} className="relative">
                          <UserCard 
                            user={user} 
                            showInterests={true}
                            data-testid={`bored-user-${user.id}`}
                          />
                          <Badge 
                            className="absolute -top-2 -right-2 bg-orange-500 text-white"
                            data-testid={`bored-badge-${user.id}`}
                          >
                            <i className="fas fa-clock mr-1"></i>
                            Bored
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12" data-testid="no-bored-people">
                      <i className="fas fa-coffee text-6xl text-slate-300 mb-4"></i>
                      <h3 className="text-xl font-semibold text-slate-900 mb-2">No one is bored right now</h3>
                      <p className="text-slate-600 mb-6">
                        Be the first to mark yourself as bored and start connecting with others!
                      </p>
                      <Button 
                        onClick={() => handleBoredToggle(true)}
                        disabled={isBored}
                        data-testid="button-mark-bored"
                      >
                        <i className="fas fa-hand-peace mr-2"></i>
                        I'm Bored!
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Interest Groups Tab */}
            <TabsContent value="interest-groups" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle data-testid="interest-groups-title">Popular Interest Groups</CardTitle>
                  <p className="text-sm text-slate-600">Discover groups of people with intersecting interests</p>
                </CardHeader>
                <CardContent>
                  {isLoadingGroups ? (
                    <div className="space-y-4">
                      {[1, 2, 3, 4].map((i) => (
                        <Card key={i} className="animate-pulse" data-testid={`skeleton-group-${i}`}>
                          <CardContent className="p-6">
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <div className="space-y-2">
                                  <div className="h-5 bg-slate-200 rounded w-32"></div>
                                  <div className="h-4 bg-slate-200 rounded w-48"></div>
                                </div>
                                <div className="h-6 bg-slate-200 rounded w-16"></div>
                              </div>
                              <div className="flex gap-2">
                                <div className="h-6 bg-slate-200 rounded w-20"></div>
                                <div className="h-6 bg-slate-200 rounded w-24"></div>
                                <div className="h-6 bg-slate-200 rounded w-18"></div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : interestGroups && (interestGroups as any[]).length > 0 ? (
                    <div className="space-y-4">
                      {(interestGroups as any[]).map((group: any) => (
                        <Card key={group.id} className="hover:shadow-lg transition-all duration-300" data-testid={`interest-group-${group.id}`}>
                          <CardContent className="p-6">
                            <div className="space-y-4">
                              <div className="flex items-start justify-between">
                                <div className="space-y-2">
                                  <h3 className="text-lg font-semibold text-slate-900" data-testid={`group-title-${group.id}`}>
                                    {group.name}
                                  </h3>
                                  <p className="text-slate-600" data-testid={`group-description-${group.id}`}>
                                    {group.description}
                                  </p>
                                </div>
                                <Badge variant="outline" data-testid={`group-member-count-${group.id}`}>
                                  {group.memberCount} members
                                </Badge>
                              </div>
                              
                              <div className="space-y-2">
                                <p className="text-sm font-medium text-slate-700">Common Interests:</p>
                                <div className="flex flex-wrap gap-2">
                                  {group.interests?.map((interest: any) => (
                                    <InterestTag 
                                      key={interest.id} 
                                      interest={interest} 
                                      size="sm"
                                      data-testid={`group-interest-${group.id}-${interest.id}`}
                                    />
                                  ))}
                                </div>
                              </div>
                              
                              {group.boredMembers > 0 && (
                                <div className="flex items-center space-x-2 p-3 bg-orange-50 rounded-lg">
                                  <i className="fas fa-clock text-orange-500"></i>
                                  <span className="text-sm font-medium text-orange-700" data-testid={`group-bored-count-${group.id}`}>
                                    {group.boredMembers} member{group.boredMembers !== 1 ? 's' : ''} currently bored
                                  </span>
                                </div>
                              )}
                              
                              <div className="flex space-x-3 pt-2">
                                <Button className="flex-1" data-testid={`button-join-group-${group.id}`}>
                                  <i className="fas fa-users mr-2"></i>
                                  Join Group
                                </Button>
                                <Button variant="outline" data-testid={`button-view-group-${group.id}`}>
                                  <i className="fas fa-eye mr-2"></i>
                                  View Members
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12" data-testid="no-interest-groups">
                      <i className="fas fa-users text-6xl text-slate-300 mb-4"></i>
                      <h3 className="text-xl font-semibold text-slate-900 mb-2">No interest groups yet</h3>
                      <p className="text-slate-600 mb-6">
                        Interest groups will form automatically as people with similar interests mark themselves as bored
                      </p>
                      <Button variant="outline" data-testid="button-explore-interests">
                        <i className="fas fa-star mr-2"></i>
                        Explore Interests
                      </Button>
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