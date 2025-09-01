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

export default function Concerts() {
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

  const { data: concerts, isLoading: isLoadingConcerts } = useQuery({
    queryKey: ["/api/concerts"],
    enabled: isAuthenticated,
    retry: false,
  });

  const { data: favorites, isLoading: isLoadingFavorites } = useQuery({
    queryKey: ["/api/favorite-artists"],
    enabled: isAuthenticated,
    retry: false,
  });

  const addToFavoritesMutation = useMutation({
    mutationFn: async (artistId: string) => {
      return await apiRequest("POST", "/api/favorite-artists", { artistId });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Added to favorite artists!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/favorite-artists"] });
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
        description: "Failed to add to favorites. Please try again.",
        variant: "destructive",
      });
    },
  });

  const renderConcertCard = (concert: any) => (
    <Card key={concert.id} className="hover:shadow-lg transition-all duration-300" data-testid={`concert-${concert.id}`}>
      <CardContent className="p-6">
        <div className="space-y-4">
          {concert.artistImage && (
            <div className="aspect-square w-full max-w-48 mx-auto">
              <img 
                src={concert.artistImage} 
                alt={concert.artistName}
                className="w-full h-full object-cover rounded-lg"
                data-testid={`concert-image-${concert.id}`}
              />
            </div>
          )}
          
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-slate-900" data-testid={`concert-artist-${concert.id}`}>
              {concert.artistName}
            </h3>
            <p className="text-slate-600 font-medium" data-testid={`concert-title-${concert.id}`}>
              {concert.tourName || 'Live Concert'}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center text-sm text-slate-600">
              <i className="fas fa-map-marker-alt mr-2"></i>
              <span data-testid={`concert-venue-${concert.id}`}>
                {concert.venue}
              </span>
            </div>

            <div className="flex items-center text-sm text-slate-600">
              <i className="fas fa-calendar mr-2"></i>
              <span data-testid={`concert-date-${concert.id}`}>
                {format(new Date(concert.date), 'PPP p')}
              </span>
            </div>

            <div className="flex items-center text-sm text-slate-600">
              <i className="fas fa-dollar-sign mr-2"></i>
              <span data-testid={`concert-price-${concert.id}`}>
                From ${concert.minPrice}
              </span>
            </div>

            {concert.availableTickets && (
              <div className="flex items-center text-sm text-slate-600">
                <i className="fas fa-ticket-alt mr-2"></i>
                <span data-testid={`concert-tickets-${concert.id}`}>
                  {concert.availableTickets} tickets available
                </span>
              </div>
            )}
          </div>

          {concert.genres && concert.genres.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {concert.genres.map((genre: string, index: number) => (
                <Badge key={index} variant="outline" className="text-xs" data-testid={`concert-genre-${concert.id}-${index}`}>
                  {genre}
                </Badge>
              ))}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button
              size="sm"
              data-testid={`button-buy-tickets-${concert.id}`}
            >
              <i className="fas fa-shopping-cart mr-2"></i>
              Buy Tickets
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => addToFavoritesMutation.mutate(concert.artistId)}
              disabled={addToFavoritesMutation.isPending}
              data-testid={`button-favorite-${concert.id}`}
            >
              <i className="fas fa-heart mr-2"></i>
              Follow Artist
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
          <p className="mt-4 text-slate-600">Loading concerts...</p>
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
                  <CardTitle className="flex items-center space-x-2" data-testid="concerts-title">
                    <i className="fas fa-music text-primary"></i>
                    <span>Concerts</span>
                  </CardTitle>
                  <p className="text-slate-600 mt-2">
                    Discover live music events and follow your favorite artists
                  </p>
                </div>
                <div className="w-64">
                  <Input
                    placeholder="Search artists or concerts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                    data-testid="input-search-concerts"
                  />
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Concert Tabs */}
          <Tabs defaultValue="all-concerts" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all-concerts" data-testid="tab-all-concerts">
                <i className="fas fa-music mr-2"></i>
                All Concerts
              </TabsTrigger>
              <TabsTrigger value="this-week" data-testid="tab-this-week">
                <i className="fas fa-calendar-week mr-2"></i>
                This Week
              </TabsTrigger>
              <TabsTrigger value="genres" data-testid="tab-genres">
                <i className="fas fa-guitar mr-2"></i>
                By Genre
              </TabsTrigger>
              <TabsTrigger value="favorites" data-testid="tab-favorites">
                <i className="fas fa-heart mr-2"></i>
                My Artists
                {favorites && (favorites as any[]).length > 0 ? (
                  <Badge variant="secondary" className="ml-2" data-testid="badge-favorites">
                    {(favorites as any[]).length}
                  </Badge>
                ) : null}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all-concerts" className="space-y-4">
              {isLoadingConcerts ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <Card key={i} className="animate-pulse" data-testid={`skeleton-concert-${i}`}>
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <div className="aspect-square bg-slate-200 rounded-lg"></div>
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
              ) : concerts && (concerts as any[]).length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(concerts as any[]).map(renderConcertCard)}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center" data-testid="no-concerts">
                    <i className="fas fa-music text-6xl text-slate-300 mb-4"></i>
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">No concerts found</h3>
                    <p className="text-slate-600">Check back later for upcoming live music events!</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="this-week" className="space-y-4">
              <Card>
                <CardContent className="p-12 text-center" data-testid="this-week-placeholder">
                  <i className="fas fa-calendar-week text-6xl text-slate-300 mb-4"></i>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">This Week's Concerts</h3>
                  <p className="text-slate-600">Discover what's happening in music this week!</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="genres" className="space-y-4">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {['Rock', 'Pop', 'Hip-Hop', 'Electronic', 'Country', 'Jazz', 'Classical', 'Alternative'].map((genre) => (
                  <Card key={genre} className="hover:shadow-md transition-shadow cursor-pointer" data-testid={`genre-${genre.toLowerCase()}`}>
                    <CardContent className="p-6 text-center">
                      <i className="fas fa-music text-3xl text-primary mb-3"></i>
                      <h3 className="font-semibold text-slate-900">{genre}</h3>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="favorites" className="space-y-4">
              {isLoadingFavorites ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Card key={i} className="animate-pulse" data-testid={`skeleton-favorite-${i}`}>
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <div className="aspect-square bg-slate-200 rounded-lg"></div>
                          <div className="space-y-2">
                            <div className="h-5 bg-slate-200 rounded w-3/4"></div>
                            <div className="h-4 bg-slate-200 rounded"></div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : favorites && (favorites as any[]).length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(favorites as any[]).map(renderConcertCard)}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center" data-testid="no-favorites">
                    <i className="fas fa-heart text-6xl text-slate-300 mb-4"></i>
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">No favorite artists yet</h3>
                    <p className="text-slate-600 mb-6">
                      Follow your favorite artists to get notified about their concerts!
                    </p>
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