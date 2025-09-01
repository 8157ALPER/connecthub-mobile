import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Navigation } from "@/components/navigation";
import { InterestTag } from "@/components/interest-tag";
import { updateProfileSchema, type UpdateProfile } from "@shared/schema";

export default function Profile() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [newInterest, setNewInterest] = useState("");

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

  const { data: interests, isLoading: isLoadingInterests } = useQuery({
    queryKey: ["/api/interests"],
    enabled: isAuthenticated,
    retry: false,
  });

  const form = useForm<UpdateProfile>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      displayName: user?.displayName || "",
      location: user?.location || "",
      bio: user?.bio || "",
    },
  });

  // Update form when user data loads
  useEffect(() => {
    if (user) {
      form.reset({
        displayName: user.displayName || "",
        location: user.location || "",
        bio: user.bio || "",
      });
    }
  }, [user, form]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: UpdateProfile) => {
      return await apiRequest("PUT", "/api/profile", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });
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
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const addInterestMutation = useMutation({
    mutationFn: async (interestId: string) => {
      return await apiRequest("POST", "/api/user-interests", { interestId });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Interest added successfully!",
      });
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
        description: "Failed to add interest. Please try again.",
        variant: "destructive",
      });
    },
  });

  const removeInterestMutation = useMutation({
    mutationFn: async (interestId: string) => {
      return await apiRequest("DELETE", `/api/user-interests/${interestId}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Interest removed successfully!",
      });
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
        description: "Failed to remove interest. Please try again.",
        variant: "destructive",
      });
    },
  });

  const createInterestMutation = useMutation({
    mutationFn: async (name: string) => {
      return await apiRequest("POST", "/api/interests", {
        name,
        description: `Interest in ${name}`,
        icon: "fas fa-star",
        color: "bg-slate-500",
      });
    },
    onSuccess: (response) => {
      const newInterest = response;
      toast({
        title: "Success",
        description: "New interest created successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/interests"] });
      // Auto-add the new interest to user
      addInterestMutation.mutate(newInterest.id);
      setNewInterest("");
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
        description: "Failed to create interest. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: UpdateProfile) => {
    updateProfileMutation.mutate(data);
  };

  const handleAddInterest = (interestId: string) => {
    addInterestMutation.mutate(interestId);
  };

  const handleRemoveInterest = (interestId: string) => {
    removeInterestMutation.mutate(interestId);
  };

  const handleCreateInterest = () => {
    if (newInterest.trim()) {
      createInterestMutation.mutate(newInterest.trim());
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  const userInterestIds = user?.interests?.map((i: any) => i.id) || [];
  const availableInterests = interests?.filter((interest: any) => !userInterestIds.includes(interest.id)) || [];

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Profile Header */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-slate-900" data-testid="profile-title">
                Edit Your Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start space-x-6">
                <div className="flex-shrink-0">
                  <img 
                    src={user?.profileImageUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150"} 
                    alt="Profile" 
                    className="w-24 h-24 rounded-full object-cover"
                    data-testid="profile-image"
                  />
                  <Button variant="outline" size="sm" className="mt-2 w-full" data-testid="button-upload-photo">
                    <i className="fas fa-camera mr-2"></i>
                    Change Photo
                  </Button>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-slate-900" data-testid="profile-name">
                    {user?.displayName || user?.firstName || "Your Name"}
                  </h3>
                  <p className="text-slate-600" data-testid="profile-email">{user?.email}</p>
                  <p className="text-slate-500" data-testid="profile-location">{user?.location || "Add your location"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle data-testid="basic-info-title">Basic Information</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="displayName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Display Name</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Your display name" 
                              {...field} 
                              data-testid="input-display-name"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="City, State" 
                              {...field} 
                              data-testid="input-location"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>About You</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Tell others about yourself and your interests..."
                              rows={4}
                              {...field} 
                              data-testid="input-bio"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      disabled={updateProfileMutation.isPending}
                      data-testid="button-save-profile"
                    >
                      {updateProfileMutation.isPending ? "Saving..." : "Save Profile"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* Interests */}
            <Card>
              <CardHeader>
                <CardTitle data-testid="interests-title">Your Interests</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Current Interests */}
                {user?.interests && user.interests.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium">Current Interests</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {user.interests.map((interest: any) => (
                        <InterestTag
                          key={interest.id}
                          interest={interest}
                          onRemove={() => handleRemoveInterest(interest.id)}
                          removable
                          data-testid={`current-interest-${interest.id}`}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Available Interests */}
                {!isLoadingInterests && availableInterests.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium">Add Interests</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {availableInterests.slice(0, 10).map((interest: any) => (
                        <InterestTag
                          key={interest.id}
                          interest={interest}
                          onClick={() => handleAddInterest(interest.id)}
                          clickable
                          data-testid={`available-interest-${interest.id}`}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Add New Interest */}
                <div>
                  <Label className="text-sm font-medium">Create New Interest</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      placeholder="Interest name..."
                      value={newInterest}
                      onChange={(e) => setNewInterest(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleCreateInterest()}
                      data-testid="input-new-interest"
                    />
                    <Button 
                      onClick={handleCreateInterest}
                      disabled={!newInterest.trim() || createInterestMutation.isPending}
                      data-testid="button-create-interest"
                    >
                      {createInterestMutation.isPending ? "Creating..." : "Add"}
                    </Button>
                  </div>
                </div>

                {isLoadingInterests && (
                  <div className="text-center py-4" data-testid="interests-loading">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-slate-500">Loading interests...</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
