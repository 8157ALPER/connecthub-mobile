import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Navigation } from "@/components/navigation";
import { format } from "date-fns";
import { Link } from "wouter";

export default function PopularEvents() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");

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

  const { data: popularEvents, isLoading: isLoadingEvents } = useQuery({
    queryKey: ["/api/popular-events"],
    enabled: isAuthenticated,
    retry: false,
  });

  const { data: trendingEvents, isLoading: isLoadingTrending } = useQuery({
    queryKey: ["/api/trending-events"],
    enabled: isAuthenticated,
    retry: false,
  });

  const bookmarkEventMutation = useMutation({
    mutationFn: async (eventId: string) => {
      return await apiRequest("POST", "/api/bookmarks", { eventId, type: "event" });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Event bookmarked!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/bookmarks"] });
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
        description: "Failed to bookmark event. Please try again.",
        variant: "destructive",
      });
    },
  });

  const renderEventCard = (event: any) => (
    <Card key={event.id} className="hover:shadow-lg transition-all duration-300" data-testid={`event-${event.id}`}>
      <CardContent className="p-6">
        <div className="space-y-4">
          {event.imageUrl && (
            <div className="aspect-video w-full">
              <img 
                src={event.imageUrl} 
                alt={event.title}
                className="w-full h-full object-cover rounded-lg"
                data-testid={`event-image-${event.id}`}
              />
            </div>
          )}
          
          <div className="space-y-2">
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-semibold text-slate-900 flex-1" data-testid={`event-title-${event.id}`}>
                {event.title}
              </h3>
              {event.isHot && (
                <Badge variant="destructive" className="ml-2" data-testid={`event-hot-${event.id}`}>
                  🔥 HOT
                </Badge>
              )}
            </div>
            {event.description && (
              <p className="text-slate-600 text-sm line-clamp-2" data-testid={`event-description-${event.id}`}>
                {event.description}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center text-sm text-slate-600">
              <i className="fas fa-calendar mr-2"></i>
              <span data-testid={`event-date-${event.id}`}>
                {format(new Date(event.startDate), 'PPP p')}
              </span>
            </div>

            <div className="flex items-center text-sm text-slate-600">
              <i className="fas fa-map-marker-alt mr-2"></i>
              <span data-testid={`event-location-${event.id}`}>
                {event.venue || event.location}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              {event.price && (
                <div className="flex items-center text-slate-600">
                  <i className="fas fa-dollar-sign mr-2"></i>
                  <span data-testid={`event-price-${event.id}`}>
                    From ${event.price}
                  </span>
                </div>
              )}
              
              <div className="flex items-center text-slate-600">
                <i className="fas fa-users mr-2"></i>
                <span data-testid={`event-attendees-${event.id}`}>
                  {event.attendeeCount || 0} interested
                </span>
              </div>
            </div>
          </div>

          {event.categories && event.categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {event.categories.map((category: string, index: number) => (
                <Badge key={index} variant="outline" className="text-xs" data-testid={`event-category-${event.id}-${index}`}>
                  {category}
                </Badge>
              ))}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button
              size="sm"
              data-testid={`button-get-tickets-${event.id}`}
            >
              <i className="fas fa-ticket-alt mr-2"></i>
              Get Tickets
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => bookmarkEventMutation.mutate(event.id)}
              disabled={bookmarkEventMutation.isPending}
              data-testid={`button-bookmark-${event.id}`}
            >
              <i className="fas fa-bookmark mr-2"></i>
              Save
            </Button>
          </div>

          {/* Sponsored Events */}
          {event.sponsored && (
            <div className="mt-4 p-3 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <Badge variant="secondary" className="text-xs mb-1">Sponsored</Badge>
                  <p className="text-sm font-medium text-green-900">
                    {event.sponsorMessage || "Special promotion available!"}
                  </p>
                </div>
                <Button size="sm" variant="outline" className="text-green-700 border-green-300">
                  Learn More
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderCategoryCard = (category: string, icon: string, count?: number) => (
    <Card key={category} className="hover:shadow-md transition-shadow cursor-pointer" data-testid={`category-${category.toLowerCase().replace(' ', '-')}`}>
      <CardContent className="p-6 text-center">
        <i className={`${icon} text-3xl text-primary mb-3`}></i>
        <h3 className="font-semibold text-slate-900">{category}</h3>
        {count && (
          <p className="text-sm text-slate-600 mt-1">{count} events</p>
        )}
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading popular events...</p>
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
                  <CardTitle className="flex items-center space-x-2" data-testid="popular-events-title">
                    <i className="fas fa-star text-primary"></i>
                    <span>Popular Events</span>
                  </CardTitle>
                  <p className="text-slate-600 mt-2">
                    Discover the most talked-about events happening around you
                  </p>
                </div>
                <div className="w-64">
                  <Input
                    placeholder="Search events..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                    data-testid="input-search-events"
                  />
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Featured Sponsor Banner */}
          <Card className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-2">🎪 Festival Season is Here!</h3>
                  <p className="text-purple-100">Get early bird tickets for the biggest festivals this summer. Limited time offer!</p>
                </div>
                <Button variant="secondary" size="lg" data-testid="button-festival-sponsor">
                  View Festivals
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Events Tabs */}
          <Tabs defaultValue="trending" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="trending" data-testid="tab-trending">
                <i className="fas fa-fire mr-2"></i>
                Trending
              </TabsTrigger>
              <TabsTrigger value="this-weekend" data-testid="tab-this-weekend">
                <i className="fas fa-calendar-week mr-2"></i>
                This Weekend
              </TabsTrigger>
              <TabsTrigger value="categories" data-testid="tab-categories">
                <i className="fas fa-th-large mr-2"></i>
                Categories
              </TabsTrigger>
              <TabsTrigger value="near-you" data-testid="tab-near-you">
                <i className="fas fa-map-marker-alt mr-2"></i>
                Near You
              </TabsTrigger>
            </TabsList>

            <TabsContent value="trending" className="space-y-4">
              {isLoadingTrending ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i} className="animate-pulse" data-testid={`skeleton-trending-${i}`}>
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <div className="aspect-video bg-slate-200 rounded-lg"></div>
                          <div className="space-y-2">
                            <div className="h-5 bg-slate-200 rounded w-3/4"></div>
                            <div className="h-4 bg-slate-200 rounded"></div>
                          </div>
                          <div className="space-y-2">
                            <div className="h-3 bg-slate-200 rounded"></div>
                            <div className="h-3 bg-slate-200 rounded w-2/3"></div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : trendingEvents && (trendingEvents as any[]).length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(trendingEvents as any[]).map(renderEventCard)}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center" data-testid="no-trending-events">
                    <i className="fas fa-fire text-6xl text-slate-300 mb-4"></i>
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">No trending events</h3>
                    <p className="text-slate-600 mb-6">Check back later for the hottest events!</p>
                    <Link href="/events">
                      <Button data-testid="button-browse-events">
                        <i className="fas fa-search mr-2"></i>
                        Browse All Events
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="this-weekend" className="space-y-4">
              {isLoadingEvents ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i} className="animate-pulse" data-testid={`skeleton-weekend-${i}`}>
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <div className="aspect-video bg-slate-200 rounded-lg"></div>
                          <div className="space-y-2">
                            <div className="h-5 bg-slate-200 rounded w-3/4"></div>
                            <div className="h-4 bg-slate-200 rounded"></div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : popularEvents && (popularEvents as any[]).length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(popularEvents as any[]).filter((e: any) => {
                    const eventDate = new Date(e.startDate);
                    const now = new Date();
                    const weekEnd = new Date();
                    weekEnd.setDate(now.getDate() + (7 - now.getDay()));
                    return eventDate >= now && eventDate <= weekEnd;
                  }).map(renderEventCard)}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center" data-testid="no-weekend-events">
                    <i className="fas fa-calendar-week text-6xl text-slate-300 mb-4"></i>
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">No weekend events</h3>
                    <p className="text-slate-600">Nothing planned for this weekend yet!</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="categories" className="space-y-4">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {renderCategoryCard('Music & Concerts', 'fas fa-music', 25)}
                {renderCategoryCard('Food & Drink', 'fas fa-utensils', 18)}
                {renderCategoryCard('Arts & Culture', 'fas fa-palette', 12)}
                {renderCategoryCard('Sports & Fitness', 'fas fa-dumbbell', 15)}
                {renderCategoryCard('Business & Tech', 'fas fa-briefcase', 8)}
                {renderCategoryCard('Family & Kids', 'fas fa-child', 22)}
                {renderCategoryCard('Nightlife & Parties', 'fas fa-cocktail', 14)}
                {renderCategoryCard('Outdoor & Adventure', 'fas fa-mountain', 9)}
              </div>
            </TabsContent>

            <TabsContent value="near-you" className="space-y-4">
              <Card>
                <CardContent className="p-12 text-center" data-testid="location-events-placeholder">
                  <i className="fas fa-map-marker-alt text-6xl text-slate-300 mb-4"></i>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">Events Near You</h3>
                  <p className="text-slate-600 mb-6">
                    Enable location services to discover events happening in your area!
                  </p>
                  <Button data-testid="button-enable-location">
                    <i className="fas fa-location-arrow mr-2"></i>
                    Enable Location
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}