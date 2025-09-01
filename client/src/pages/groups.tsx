import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Navigation } from "@/components/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const createGroupSchema = z.object({
  name: z.string().min(1, "Group name is required"),
  description: z.string().optional(),
  isPrivate: z.boolean().default(false),
  tags: z.string().optional(),
});

export default function Groups() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const form = useForm<z.infer<typeof createGroupSchema>>({
    resolver: zodResolver(createGroupSchema),
    defaultValues: {
      name: "",
      description: "",
      isPrivate: false,
      tags: "",
    },
  });

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

  const { data: groups, isLoading: isLoadingGroups } = useQuery({
    queryKey: ["/api/groups"],
    enabled: isAuthenticated,
    retry: false,
  });

  const { data: myGroups, isLoading: isLoadingMyGroups } = useQuery({
    queryKey: ["/api/my-groups"],
    enabled: isAuthenticated,
    retry: false,
  });

  const createGroupMutation = useMutation({
    mutationFn: async (groupData: z.infer<typeof createGroupSchema>) => {
      const tags = groupData.tags ? groupData.tags.split(',').map(tag => tag.trim()) : [];
      return await apiRequest("POST", "/api/groups", {
        ...groupData,
        tags,
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Group created successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
      queryClient.invalidateQueries({ queryKey: ["/api/my-groups"] });
      setIsCreateDialogOpen(false);
      form.reset();
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
        description: "Failed to create group. Please try again.",
        variant: "destructive",
      });
    },
  });

  const joinGroupMutation = useMutation({
    mutationFn: async (groupId: string) => {
      return await apiRequest("POST", "/api/group-members", { groupId });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Successfully joined the group!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
      queryClient.invalidateQueries({ queryKey: ["/api/my-groups"] });
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
        description: "Failed to join group. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof createGroupSchema>) => {
    createGroupMutation.mutate(data);
  };

  const renderGroupCard = (group: any, showJoinButton = true) => (
    <Card key={group.id} className="hover:shadow-lg transition-all duration-300" data-testid={`group-${group.id}`}>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-semibold text-slate-900" data-testid={`group-name-${group.id}`}>
                  {group.name}
                </h3>
                {group.isPrivate && (
                  <Badge variant="secondary" data-testid={`group-private-${group.id}`}>
                    <i className="fas fa-lock mr-1"></i>
                    Private
                  </Badge>
                )}
              </div>
              {group.description && (
                <p className="text-slate-600" data-testid={`group-description-${group.id}`}>
                  {group.description}
                </p>
              )}
            </div>
            
            {group.imageUrl && (
              <Avatar className="w-12 h-12">
                <AvatarImage src={group.imageUrl} alt={group.name} />
                <AvatarFallback>{group.name[0]}</AvatarFallback>
              </Avatar>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center text-sm text-slate-600">
              <i className="fas fa-user mr-2"></i>
              <span data-testid={`group-creator-${group.id}`}>
                Created by {group.creator?.displayName || group.creator?.firstName || "Unknown"}
              </span>
            </div>

            <div className="flex items-center text-sm text-slate-600">
              <i className="fas fa-users mr-2"></i>
              <span data-testid={`group-members-${group.id}`}>
                {group.memberCount || 0} members
              </span>
            </div>
          </div>

          {group.tags && group.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {group.tags.map((tag: string, index: number) => (
                <Badge key={index} variant="outline" className="text-xs" data-testid={`group-tag-${group.id}-${index}`}>
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {showJoinButton && (
            <div className="pt-2">
              <Button
                size="sm"
                onClick={() => joinGroupMutation.mutate(group.id)}
                disabled={joinGroupMutation.isPending}
                data-testid={`button-join-group-${group.id}`}
              >
                <i className="fas fa-user-plus mr-2"></i>
                {joinGroupMutation.isPending ? "Joining..." : "Join Group"}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading groups...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2" data-testid="groups-title">
                    <i className="fas fa-layer-group text-primary"></i>
                    <span>Groups</span>
                  </CardTitle>
                  <p className="text-slate-600 mt-2">
                    Join communities with shared interests and passions
                  </p>
                </div>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button data-testid="button-create-group">
                      <i className="fas fa-plus mr-2"></i>
                      Create Group
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Create New Group</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Group Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Group name" {...field} data-testid="input-group-name" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Textarea placeholder="What is this group about?" {...field} data-testid="input-group-description" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="isPrivate"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                              <div className="space-y-0.5">
                                <FormLabel>Private Group</FormLabel>
                                <div className="text-sm text-slate-600">
                                  Only invited members can join
                                </div>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  data-testid="switch-private-group"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="tags"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tags (optional)</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="gaming, tech, art (comma separated)" 
                                  {...field} 
                                  data-testid="input-group-tags" 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="flex gap-3 pt-4">
                          <Button 
                            type="submit" 
                            disabled={createGroupMutation.isPending}
                            data-testid="button-submit-group"
                          >
                            {createGroupMutation.isPending ? (
                              <>
                                <i className="fas fa-spinner fa-spin mr-2"></i>
                                Creating...
                              </>
                            ) : (
                              <>
                                <i className="fas fa-plus mr-2"></i>
                                Create Group
                              </>
                            )}
                          </Button>
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => setIsCreateDialogOpen(false)}
                            data-testid="button-cancel-group"
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
          </Card>

          {/* Groups Tabs */}
          <Tabs defaultValue="all-groups" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="all-groups" data-testid="tab-all-groups">
                All Groups
                {groups && (groups as any[]).length > 0 ? (
                  <Badge variant="secondary" className="ml-2" data-testid="badge-all-groups">
                    {(groups as any[]).length}
                  </Badge>
                ) : null}
              </TabsTrigger>
              <TabsTrigger value="my-groups" data-testid="tab-my-groups">
                My Groups
                {myGroups && (myGroups as any[]).length > 0 ? (
                  <Badge variant="secondary" className="ml-2" data-testid="badge-my-groups">
                    {(myGroups as any[]).length}
                  </Badge>
                ) : null}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all-groups" className="space-y-4">
              {isLoadingGroups ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i} className="animate-pulse" data-testid={`skeleton-group-${i}`}>
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <div className="h-5 bg-slate-200 rounded w-3/4"></div>
                            <div className="h-4 bg-slate-200 rounded"></div>
                            <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                          </div>
                          <div className="space-y-2">
                            <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                            <div className="h-3 bg-slate-200 rounded w-2/3"></div>
                          </div>
                          <div className="h-8 bg-slate-200 rounded w-24"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : groups && (groups as any[]).length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(groups as any[]).map((group: any) => renderGroupCard(group))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center" data-testid="no-groups">
                    <i className="fas fa-layer-group text-6xl text-slate-300 mb-4"></i>
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">No groups yet</h3>
                    <p className="text-slate-600 mb-6">
                      Create the first group and build your community!
                    </p>
                    <Button onClick={() => setIsCreateDialogOpen(true)} data-testid="button-create-first-group">
                      <i className="fas fa-plus mr-2"></i>
                      Create First Group
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="my-groups" className="space-y-4">
              {isLoadingMyGroups ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Card key={i} className="animate-pulse" data-testid={`skeleton-my-group-${i}`}>
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <div className="h-5 bg-slate-200 rounded w-3/4"></div>
                            <div className="h-4 bg-slate-200 rounded"></div>
                          </div>
                          <div className="space-y-2">
                            <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                            <div className="h-3 bg-slate-200 rounded w-2/3"></div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : myGroups && (myGroups as any[]).length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(myGroups as any[]).map((group: any) => renderGroupCard(group, false))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center" data-testid="no-my-groups">
                    <i className="fas fa-users text-6xl text-slate-300 mb-4"></i>
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">No groups joined yet</h3>
                    <p className="text-slate-600 mb-6">
                      Join some groups to connect with like-minded people!
                    </p>
                    <Button onClick={() => setIsCreateDialogOpen(true)} data-testid="button-create-my-first-group">
                      <i className="fas fa-plus mr-2"></i>
                      Create Your First Group
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}