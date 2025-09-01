import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Navigation } from "@/components/navigation";
import { format } from "date-fns";

export default function Theaters() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
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

  const { data: theaters, isLoading: isLoadingTheaters } = useQuery({
    queryKey: ["/api/theaters"],
    enabled: isAuthenticated,
    retry: false,
  });

  const { data: shows, isLoading: isLoadingShows } = useQuery({
    queryKey: ["/api/theater-shows"],
    enabled: isAuthenticated,
    retry: false,
  });

  const renderTheaterCard = (theater: any) => (
    <Card key={theater.id} className="hover:shadow-lg transition-all duration-300" data-testid={`theater-${theater.id}`}>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-slate-900" data-testid={`theater-name-${theater.id}`}>
              {theater.name}
            </h3>
            {theater.description && (
              <p className="text-slate-600 text-sm" data-testid={`theater-description-${theater.id}`}>
                {theater.description}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center text-sm text-slate-600">
              <i className="fas fa-map-marker-alt mr-2"></i>
              <span data-testid={`theater-location-${theater.id}`}>
                {theater.address}
              </span>
            </div>

            {theater.phone && (
              <div className="flex items-center text-sm text-slate-600">
                <i className="fas fa-phone mr-2"></i>
                <span data-testid={`theater-phone-${theater.id}`}>{theater.phone}</span>
              </div>
            )}

            <div className="flex items-center text-sm text-slate-600">
              <i className="fas fa-chair mr-2"></i>
              <span data-testid={`theater-capacity-${theater.id}`}>
                {theater.capacity} seats
              </span>
            </div>
          </div>

          {theater.amenities && theater.amenities.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {theater.amenities.map((amenity: string, index: number) => (
                <Badge key={index} variant="outline" className="text-xs" data-testid={`theater-amenity-${theater.id}-${index}`}>
                  <i className="fas fa-check mr-1"></i>
                  {amenity}
                </Badge>
              ))}
            </div>
          )}

          <div className="pt-2">
            <Button
              size="sm"
              variant="outline"
              data-testid={`button-view-shows-${theater.id}`}
            >
              <i className="fas fa-calendar mr-2"></i>
              View Shows
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderShowCard = (show: any) => (
    <Card key={show.id} className="hover:shadow-lg transition-all duration-300" data-testid={`show-${show.id}`}>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-slate-900" data-testid={`show-title-${show.id}`}>
              {show.title}
            </h3>
            {show.description && (
              <p className="text-slate-600 text-sm" data-testid={`show-description-${show.id}`}>
                {show.description}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center text-sm text-slate-600">
              <i className="fas fa-theater-masks mr-2"></i>
              <span data-testid={`show-theater-${show.id}`}>
                {show.theaterName}
              </span>
            </div>

            <div className="flex items-center text-sm text-slate-600">
              <i className="fas fa-calendar mr-2"></i>
              <span data-testid={`show-dates-${show.id}`}>
                {format(new Date(show.startDate), 'MMM d')} - {format(new Date(show.endDate), 'MMM d, yyyy')}
              </span>
            </div>

            <div className="flex items-center text-sm text-slate-600">
              <i className="fas fa-clock mr-2"></i>
              <span data-testid={`show-times-${show.id}`}>
                {show.showtimes?.join(', ') || 'TBA'}
              </span>
            </div>

            <div className="flex items-center text-sm text-slate-600">
              <i className="fas fa-dollar-sign mr-2"></i>
              <span data-testid={`show-price-${show.id}`}>
                From ${show.minPrice}
              </span>
            </div>
          </div>

          {show.genre && (
            <Badge variant="secondary" data-testid={`show-genre-${show.id}`}>
              {show.genre}
            </Badge>
          )}

          <div className="flex gap-2 pt-2">
            <Button
              size="sm"
              data-testid={`button-book-tickets-${show.id}`}
            >
              <i className="fas fa-ticket-alt mr-2"></i>
              Book Tickets
            </Button>
            <Button
              size="sm"
              variant="outline"
              data-testid={`button-more-info-${show.id}`}
            >
              <i className="fas fa-info-circle mr-2"></i>
              More Info
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
          <p className="mt-4 text-slate-600">Loading theaters...</p>
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
                  <CardTitle className="flex items-center space-x-2" data-testid="theaters-title">
                    <i className="fas fa-theater-masks text-primary"></i>
                    <span>Theaters</span>
                  </CardTitle>
                  <p className="text-slate-600 mt-2">
                    Discover theaters and book tickets for amazing shows
                  </p>
                </div>
                <div className="w-64">
                  <Input
                    placeholder="Search theaters or shows..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                    data-testid="input-search-theaters"
                  />
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Theater Tabs */}
          <Tabs defaultValue="theaters" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="theaters" data-testid="tab-theaters">
                <i className="fas fa-building mr-2"></i>
                Theaters
              </TabsTrigger>
              <TabsTrigger value="current-shows" data-testid="tab-current-shows">
                <i className="fas fa-play mr-2"></i>
                Current Shows
              </TabsTrigger>
              <TabsTrigger value="upcoming" data-testid="tab-upcoming">
                <i className="fas fa-calendar-plus mr-2"></i>
                Upcoming
              </TabsTrigger>
            </TabsList>

            <TabsContent value="theaters" className="space-y-4">
              {isLoadingTheaters ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i} className="animate-pulse" data-testid={`skeleton-theater-${i}`}>
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <div className="h-5 bg-slate-200 rounded w-3/4"></div>
                            <div className="h-4 bg-slate-200 rounded"></div>
                          </div>
                          <div className="space-y-2">
                            <div className="h-3 bg-slate-200 rounded"></div>
                            <div className="h-3 bg-slate-200 rounded w-2/3"></div>
                          </div>
                          <div className="h-8 bg-slate-200 rounded w-24"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : theaters && (theaters as any[]).length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(theaters as any[]).map(renderTheaterCard)}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center" data-testid="no-theaters">
                    <i className="fas fa-theater-masks text-6xl text-slate-300 mb-4"></i>
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">No theaters found</h3>
                    <p className="text-slate-600">Check back later for theater listings in your area!</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="current-shows" className="space-y-4">
              {isLoadingShows ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i} className="animate-pulse" data-testid={`skeleton-show-${i}`}>
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <div className="h-5 bg-slate-200 rounded w-3/4"></div>
                            <div className="h-4 bg-slate-200 rounded"></div>
                          </div>
                          <div className="space-y-2">
                            <div className="h-3 bg-slate-200 rounded"></div>
                            <div className="h-3 bg-slate-200 rounded w-2/3"></div>
                          </div>
                          <div className="flex gap-2">
                            <div className="h-8 bg-slate-200 rounded w-24"></div>
                            <div className="h-8 bg-slate-200 rounded w-20"></div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : shows && (shows as any[]).length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(shows as any[]).map(renderShowCard)}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center" data-testid="no-shows">
                    <i className="fas fa-calendar text-6xl text-slate-300 mb-4"></i>
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">No current shows</h3>
                    <p className="text-slate-600">Check back soon for exciting theater performances!</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="upcoming" className="space-y-4">
              <Card>
                <CardContent className="p-12 text-center" data-testid="upcoming-placeholder">
                  <i className="fas fa-calendar-plus text-6xl text-slate-300 mb-4"></i>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">Upcoming Shows</h3>
                  <p className="text-slate-600">Stay tuned for announcements of upcoming theater productions!</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}