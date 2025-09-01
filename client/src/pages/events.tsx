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
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Navigation } from "@/components/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const createEventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  location: z.string().optional(),
  isVirtual: z.boolean().default(false),
  startDate: z.date(),
  endDate: z.date().optional(),
  maxAttendees: z.string().optional(),
  tags: z.string().optional(),
});

export default function Events() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const form = useForm<z.infer<typeof createEventSchema>>({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
      isVirtual: false,
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

  const { data: events, isLoading: isLoadingEvents } = useQuery({
    queryKey: ["/api/events"],
    enabled: isAuthenticated,
    retry: false,
  });

  const { data: myEvents, isLoading: isLoadingMyEvents } = useQuery({
    queryKey: ["/api/my-events"],
    enabled: isAuthenticated,
    retry: false,
  });

  const createEventMutation = useMutation({
    mutationFn: async (eventData: z.infer<typeof createEventSchema>) => {
      const tags = eventData.tags ? eventData.tags.split(',').map(tag => tag.trim()) : [];
      return await apiRequest("POST", "/api/events", {
        ...eventData,
        tags,
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Event created successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      queryClient.invalidateQueries({ queryKey: ["/api/my-events"] });
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
        description: "Failed to create event. Please try again.",
        variant: "destructive",
      });
    },
  });

  const joinEventMutation = useMutation({
    mutationFn: async ({ eventId, status }: { eventId: string; status: string }) => {
      return await apiRequest("POST", "/api/event-attendees", { eventId, status });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Event attendance updated!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
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
        description: "Failed to update attendance. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof createEventSchema>) => {
    createEventMutation.mutate(data);
  };

  const renderEventCard = (event: any) => (
    <Card key={event.id} className="hover:shadow-lg transition-all duration-300" data-testid={`event-${event.id}`}>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-slate-900" data-testid={`event-title-${event.id}`}>
                {event.title}
              </h3>
              {event.description && (
                <p className="text-slate-600" data-testid={`event-description-${event.id}`}>
                  {event.description}
                </p>
              )}
            </div>
            {event.isVirtual && (
              <Badge variant="secondary" data-testid={`event-virtual-${event.id}`}>
                <i className="fas fa-video mr-1"></i>
                Virtual
              </Badge>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center text-sm text-slate-600">
              <i className="fas fa-calendar mr-2"></i>
              <span data-testid={`event-date-${event.id}`}>
                {format(new Date(event.startDate), 'PPP p')}
                {event.endDate && ` - ${format(new Date(event.endDate), 'PPP p')}`}
              </span>
            </div>

            {event.location && (
              <div className="flex items-center text-sm text-slate-600">
                <i className="fas fa-map-marker-alt mr-2"></i>
                <span data-testid={`event-location-${event.id}`}>{event.location}</span>
              </div>
            )}

            <div className="flex items-center text-sm text-slate-600">
              <i className="fas fa-user mr-2"></i>
              <span data-testid={`event-creator-${event.id}`}>
                By {event.creator?.displayName || event.creator?.firstName || "Unknown"}
              </span>
            </div>

            {event.attendeeCount > 0 && (
              <div className="flex items-center text-sm text-slate-600">
                <i className="fas fa-users mr-2"></i>
                <span data-testid={`event-attendees-${event.id}`}>
                  {event.attendeeCount} attending
                  {event.maxAttendees && ` / ${event.maxAttendees} max`}
                </span>
              </div>
            )}
          </div>

          {event.tags && event.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {event.tags.map((tag: string, index: number) => (
                <Badge key={index} variant="outline" className="text-xs" data-testid={`event-tag-${event.id}-${index}`}>
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button
              size="sm"
              onClick={() => joinEventMutation.mutate({ eventId: event.id, status: "going" })}
              disabled={joinEventMutation.isPending}
              data-testid={`button-join-${event.id}`}
            >
              <i className="fas fa-check mr-1"></i>
              Join Event
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => joinEventMutation.mutate({ eventId: event.id, status: "maybe" })}
              disabled={joinEventMutation.isPending}
              data-testid={`button-maybe-${event.id}`}
            >
              <i className="fas fa-question mr-1"></i>
              Maybe
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading events...</p>
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
                  <CardTitle className="flex items-center space-x-2" data-testid="events-title">
                    <i className="fas fa-calendar text-primary"></i>
                    <span>Events</span>
                  </CardTitle>
                  <p className="text-slate-600 mt-2">
                    Discover and create events to connect with others
                  </p>
                </div>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button data-testid="button-create-event">
                      <i className="fas fa-plus mr-2"></i>
                      Create Event
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Create New Event</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Title</FormLabel>
                              <FormControl>
                                <Input placeholder="Event title" {...field} data-testid="input-event-title" />
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
                                <Textarea placeholder="Event description" {...field} data-testid="input-event-description" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="isVirtual"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                              <div className="space-y-0.5">
                                <FormLabel>Virtual Event</FormLabel>
                                <div className="text-sm text-slate-600">
                                  This event will be held online
                                </div>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  data-testid="switch-virtual-event"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        {!form.watch("isVirtual") && (
                          <FormField
                            control={form.control}
                            name="location"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Location</FormLabel>
                                <FormControl>
                                  <Input placeholder="Event location" {...field} data-testid="input-event-location" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}

                        <FormField
                          control={form.control}
                          name="startDate"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>Start Date</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant="outline"
                                      className={cn(
                                        "pl-3 text-left font-normal",
                                        !field.value && "text-slate-400"
                                      )}
                                      data-testid="button-select-date"
                                    >
                                      {field.value ? (
                                        format(field.value, "PPP")
                                      ) : (
                                        <span>Pick a date</span>
                                      )}
                                      <i className="fas fa-calendar ml-auto h-4 w-4 opacity-50"></i>
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    disabled={(date) =>
                                      date < new Date()
                                    }
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="maxAttendees"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Max Attendees (optional)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  placeholder="Maximum number of attendees" 
                                  {...field} 
                                  data-testid="input-max-attendees" 
                                />
                              </FormControl>
                              <FormMessage />
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
                                  placeholder="gaming, social, tech (comma separated)" 
                                  {...field} 
                                  data-testid="input-event-tags" 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="flex gap-3 pt-4">
                          <Button 
                            type="submit" 
                            disabled={createEventMutation.isPending}
                            data-testid="button-submit-event"
                          >
                            {createEventMutation.isPending ? (
                              <>
                                <i className="fas fa-spinner fa-spin mr-2"></i>
                                Creating...
                              </>
                            ) : (
                              <>
                                <i className="fas fa-plus mr-2"></i>
                                Create Event
                              </>
                            )}
                          </Button>
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => setIsCreateDialogOpen(false)}
                            data-testid="button-cancel-event"
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

          {/* Events Tabs */}
          <Tabs defaultValue="all-events" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="all-events" data-testid="tab-all-events">
                All Events
                {events && (events as any[]).length > 0 ? (
                  <Badge variant="secondary" className="ml-2" data-testid="badge-all-events">
                    {(events as any[]).length}
                  </Badge>
                ) : null}
              </TabsTrigger>
              <TabsTrigger value="my-events" data-testid="tab-my-events">
                My Events
                {myEvents && (myEvents as any[]).length > 0 ? (
                  <Badge variant="secondary" className="ml-2" data-testid="badge-my-events">
                    {(myEvents as any[]).length}
                  </Badge>
                ) : null}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all-events" className="space-y-4">
              {isLoadingEvents ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i} className="animate-pulse" data-testid={`skeleton-event-${i}`}>
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
                          <div className="flex gap-2">
                            <div className="h-8 bg-slate-200 rounded w-20"></div>
                            <div className="h-8 bg-slate-200 rounded w-16"></div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : events && (events as any[]).length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(events as any[]).map(renderEventCard)}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center" data-testid="no-events">
                    <i className="fas fa-calendar text-6xl text-slate-300 mb-4"></i>
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">No events yet</h3>
                    <p className="text-slate-600 mb-6">
                      Be the first to create an event and bring people together!
                    </p>
                    <Button onClick={() => setIsCreateDialogOpen(true)} data-testid="button-create-first-event">
                      <i className="fas fa-plus mr-2"></i>
                      Create First Event
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="my-events" className="space-y-4">
              {isLoadingMyEvents ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Card key={i} className="animate-pulse" data-testid={`skeleton-my-event-${i}`}>
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
              ) : myEvents && (myEvents as any[]).length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(myEvents as any[]).map(renderEventCard)}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center" data-testid="no-my-events">
                    <i className="fas fa-calendar-plus text-6xl text-slate-300 mb-4"></i>
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">No events created yet</h3>
                    <p className="text-slate-600 mb-6">
                      Create your first event to start building your community!
                    </p>
                    <Button onClick={() => setIsCreateDialogOpen(true)} data-testid="button-create-my-first-event">
                      <i className="fas fa-plus mr-2"></i>
                      Create My First Event
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