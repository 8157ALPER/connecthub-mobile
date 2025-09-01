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

export default function Movies() {
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

  const { data: movies, isLoading: isLoadingMovies } = useQuery({
    queryKey: ["/api/movies"],
    enabled: isAuthenticated,
    retry: false,
  });

  const { data: watchlist, isLoading: isLoadingWatchlist } = useQuery({
    queryKey: ["/api/watchlist"],
    enabled: isAuthenticated,
    retry: false,
  });

  const addToWatchlistMutation = useMutation({
    mutationFn: async (movieId: string) => {
      return await apiRequest("POST", "/api/watchlist", { movieId });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Added to watchlist!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/watchlist"] });
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
        description: "Failed to add to watchlist. Please try again.",
        variant: "destructive",
      });
    },
  });

  const renderMovieCard = (movie: any) => (
    <Card key={movie.id} className="hover:shadow-lg transition-all duration-300" data-testid={`movie-${movie.id}`}>
      <CardContent className="p-6">
        <div className="space-y-4">
          {movie.posterUrl && (
            <div className="aspect-[2/3] w-full max-w-48 mx-auto">
              <img 
                src={movie.posterUrl} 
                alt={movie.title}
                className="w-full h-full object-cover rounded-lg"
                data-testid={`movie-poster-${movie.id}`}
              />
            </div>
          )}
          
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-slate-900" data-testid={`movie-title-${movie.id}`}>
              {movie.title}
            </h3>
            {movie.description && (
              <p className="text-slate-600 text-sm line-clamp-3" data-testid={`movie-description-${movie.id}`}>
                {movie.description}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-slate-600">
              <span data-testid={`movie-year-${movie.id}`}>
                <i className="fas fa-calendar mr-1"></i>
                {movie.releaseYear}
              </span>
              {movie.rating && (
                <span data-testid={`movie-rating-${movie.id}`}>
                  <i className="fas fa-star text-yellow-500 mr-1"></i>
                  {movie.rating}/10
                </span>
              )}
            </div>

            {movie.runtime && (
              <div className="text-sm text-slate-600">
                <i className="fas fa-clock mr-1"></i>
                <span data-testid={`movie-runtime-${movie.id}`}>{movie.runtime} mins</span>
              </div>
            )}
          </div>

          {movie.genres && movie.genres.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {movie.genres.map((genre: string, index: number) => (
                <Badge key={index} variant="outline" className="text-xs" data-testid={`movie-genre-${movie.id}-${index}`}>
                  {genre}
                </Badge>
              ))}
            </div>
          )}

          <div className="pt-2">
            <Button
              size="sm"
              onClick={() => addToWatchlistMutation.mutate(movie.id)}
              disabled={addToWatchlistMutation.isPending}
              data-testid={`button-watchlist-${movie.id}`}
            >
              <i className="fas fa-plus mr-2"></i>
              Add to Watchlist
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
          <p className="mt-4 text-slate-600">Loading movies...</p>
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
                  <CardTitle className="flex items-center space-x-2" data-testid="movies-title">
                    <i className="fas fa-film text-primary"></i>
                    <span>Movies</span>
                  </CardTitle>
                  <p className="text-slate-600 mt-2">
                    Discover trending movies and build your watchlist
                  </p>
                </div>
                <div className="w-64">
                  <Input
                    placeholder="Search movies..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                    data-testid="input-search-movies"
                  />
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Movie Tabs */}
          <Tabs defaultValue="trending" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="trending" data-testid="tab-trending">
                <i className="fas fa-fire mr-2"></i>
                Trending
              </TabsTrigger>
              <TabsTrigger value="new-releases" data-testid="tab-new-releases">
                <i className="fas fa-sparkles mr-2"></i>
                New Releases
              </TabsTrigger>
              <TabsTrigger value="top-rated" data-testid="tab-top-rated">
                <i className="fas fa-star mr-2"></i>
                Top Rated
              </TabsTrigger>
              <TabsTrigger value="watchlist" data-testid="tab-watchlist">
                <i className="fas fa-bookmark mr-2"></i>
                My Watchlist
                {watchlist && (watchlist as any[]).length > 0 ? (
                  <Badge variant="secondary" className="ml-2" data-testid="badge-watchlist">
                    {(watchlist as any[]).length}
                  </Badge>
                ) : null}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="trending" className="space-y-4">
              {isLoadingMovies ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <Card key={i} className="animate-pulse" data-testid={`skeleton-movie-${i}`}>
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <div className="aspect-[2/3] bg-slate-200 rounded-lg"></div>
                          <div className="space-y-2">
                            <div className="h-5 bg-slate-200 rounded w-3/4"></div>
                            <div className="h-4 bg-slate-200 rounded"></div>
                            <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : movies && (movies as any[]).length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {(movies as any[]).map(renderMovieCard)}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center" data-testid="no-movies">
                    <i className="fas fa-film text-6xl text-slate-300 mb-4"></i>
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">No movies found</h3>
                    <p className="text-slate-600 mb-6">
                      Check back later for the latest movie recommendations!
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="new-releases" className="space-y-4">
              <Card>
                <CardContent className="p-12 text-center" data-testid="new-releases-placeholder">
                  <i className="fas fa-sparkles text-6xl text-slate-300 mb-4"></i>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">New Releases Coming Soon</h3>
                  <p className="text-slate-600">Stay tuned for the latest movie releases!</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="top-rated" className="space-y-4">
              <Card>
                <CardContent className="p-12 text-center" data-testid="top-rated-placeholder">
                  <i className="fas fa-star text-6xl text-slate-300 mb-4"></i>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">Top Rated Movies</h3>
                  <p className="text-slate-600">Discover the highest rated movies of all time!</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="watchlist" className="space-y-4">
              {isLoadingWatchlist ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i} className="animate-pulse" data-testid={`skeleton-watchlist-${i}`}>
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <div className="aspect-[2/3] bg-slate-200 rounded-lg"></div>
                          <div className="space-y-2">
                            <div className="h-5 bg-slate-200 rounded w-3/4"></div>
                            <div className="h-4 bg-slate-200 rounded"></div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : watchlist && (watchlist as any[]).length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {(watchlist as any[]).map(renderMovieCard)}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center" data-testid="empty-watchlist">
                    <i className="fas fa-bookmark text-6xl text-slate-300 mb-4"></i>
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">Your watchlist is empty</h3>
                    <p className="text-slate-600 mb-6">
                      Add movies to your watchlist to keep track of what you want to watch!
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