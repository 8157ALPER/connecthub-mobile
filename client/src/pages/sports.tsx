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

export default function Sports() {
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

  const { data: games, isLoading: isLoadingGames } = useQuery({
    queryKey: ["/api/sports-games"],
    enabled: isAuthenticated,
    retry: false,
  });

  const { data: teams, isLoading: isLoadingTeams } = useQuery({
    queryKey: ["/api/favorite-teams"],
    enabled: isAuthenticated,
    retry: false,
  });

  const renderGameCard = (game: any) => (
    <Card key={game.id} className="hover:shadow-lg transition-all duration-300" data-testid={`game-${game.id}`}>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Teams */}
          <div className="flex items-center justify-center space-x-6">
            <div className="text-center flex-1">
              {game.homeTeam.logo && (
                <img 
                  src={game.homeTeam.logo} 
                  alt={game.homeTeam.name}
                  className="w-16 h-16 mx-auto mb-2 object-contain"
                  data-testid={`home-logo-${game.id}`}
                />
              )}
              <h3 className="font-semibold text-slate-900" data-testid={`home-team-${game.id}`}>
                {game.homeTeam.name}
              </h3>
              <p className="text-sm text-slate-600">{game.homeTeam.record}</p>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-400">VS</div>
              {game.status === 'completed' && game.score && (
                <div className="text-lg font-semibold mt-2" data-testid={`score-${game.id}`}>
                  {game.score.home} - {game.score.away}
                </div>
              )}
            </div>
            
            <div className="text-center flex-1">
              {game.awayTeam.logo && (
                <img 
                  src={game.awayTeam.logo} 
                  alt={game.awayTeam.name}
                  className="w-16 h-16 mx-auto mb-2 object-contain"
                  data-testid={`away-logo-${game.id}`}
                />
              )}
              <h3 className="font-semibold text-slate-900" data-testid={`away-team-${game.id}`}>
                {game.awayTeam.name}
              </h3>
              <p className="text-sm text-slate-600">{game.awayTeam.record}</p>
            </div>
          </div>

          {/* Game Info */}
          <div className="space-y-2 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between text-sm text-slate-600">
              <div className="flex items-center">
                <i className="fas fa-calendar mr-2"></i>
                <span data-testid={`game-date-${game.id}`}>
                  {format(new Date(game.gameTime), 'MMM d, yyyy')}
                </span>
              </div>
              <div className="flex items-center">
                <i className="fas fa-clock mr-2"></i>
                <span data-testid={`game-time-${game.id}`}>
                  {format(new Date(game.gameTime), 'h:mm a')}
                </span>
              </div>
            </div>

            <div className="flex items-center text-sm text-slate-600">
              <i className="fas fa-map-marker-alt mr-2"></i>
              <span data-testid={`game-venue-${game.id}`}>
                {game.venue}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <Badge 
                variant={game.status === 'live' ? 'destructive' : game.status === 'upcoming' ? 'secondary' : 'outline'}
                data-testid={`game-status-${game.id}`}
              >
                {game.status === 'live' && <i className="fas fa-circle text-red-500 mr-1 animate-pulse"></i>}
                {game.status.toUpperCase()}
              </Badge>
              
              <Badge variant="outline" data-testid={`game-sport-${game.id}`}>
                {game.sport}
              </Badge>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            {game.ticketUrl && (
              <Button
                size="sm"
                data-testid={`button-tickets-${game.id}`}
              >
                <i className="fas fa-ticket-alt mr-2"></i>
                Buy Tickets
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              data-testid={`button-details-${game.id}`}
            >
              <i className="fas fa-info-circle mr-2"></i>
              View Details
            </Button>
          </div>

          {/* Sponsored Content Placeholder */}
          {game.sponsored && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Badge variant="secondary" className="text-xs">Sponsored</Badge>
                  <span className="ml-2 text-sm font-medium text-blue-900">
                    Special Offer Available
                  </span>
                </div>
                <Button size="sm" variant="outline" className="text-blue-700 border-blue-300">
                  Learn More
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderSportCategory = (sport: string, icon: string) => (
    <Card key={sport} className="hover:shadow-md transition-shadow cursor-pointer" data-testid={`sport-${sport.toLowerCase()}`}>
      <CardContent className="p-6 text-center">
        <i className={`${icon} text-3xl text-primary mb-3`}></i>
        <h3 className="font-semibold text-slate-900">{sport}</h3>
        <p className="text-sm text-slate-600 mt-1">View games & tickets</p>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading sports...</p>
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
                  <CardTitle className="flex items-center space-x-2" data-testid="sports-title">
                    <i className="fas fa-football-ball text-primary"></i>
                    <span>Sports</span>
                  </CardTitle>
                  <p className="text-slate-600 mt-2">
                    Follow your favorite teams and get tickets to live games
                  </p>
                </div>
                <div className="w-64">
                  <Input
                    placeholder="Search teams or games..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                    data-testid="input-search-sports"
                  />
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Sports Tabs */}
          <Tabs defaultValue="all-games" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all-games" data-testid="tab-all-games">
                <i className="fas fa-trophy mr-2"></i>
                All Games
              </TabsTrigger>
              <TabsTrigger value="live-now" data-testid="tab-live-now">
                <i className="fas fa-circle text-red-500 mr-2"></i>
                Live Now
              </TabsTrigger>
              <TabsTrigger value="by-sport" data-testid="tab-by-sport">
                <i className="fas fa-list mr-2"></i>
                By Sport
              </TabsTrigger>
              <TabsTrigger value="my-teams" data-testid="tab-my-teams">
                <i className="fas fa-heart mr-2"></i>
                My Teams
                {teams && (teams as any[]).length > 0 ? (
                  <Badge variant="secondary" className="ml-2" data-testid="badge-my-teams">
                    {(teams as any[]).length}
                  </Badge>
                ) : null}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all-games" className="space-y-4">
              {/* Featured Sponsor Banner */}
              <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold mb-2">🏈 Super Bowl LVIII Tickets</h3>
                      <p className="text-blue-100">Get your tickets now! Limited availability for the biggest game of the year.</p>
                    </div>
                    <Button variant="secondary" size="lg" data-testid="button-sponsor-cta">
                      Get Tickets
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {isLoadingGames ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i} className="animate-pulse" data-testid={`skeleton-game-${i}`}>
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <div className="flex items-center justify-center space-x-6">
                            <div className="text-center flex-1">
                              <div className="w-16 h-16 bg-slate-200 rounded mx-auto mb-2"></div>
                              <div className="h-4 bg-slate-200 rounded w-20 mx-auto"></div>
                            </div>
                            <div className="text-2xl text-slate-300">VS</div>
                            <div className="text-center flex-1">
                              <div className="w-16 h-16 bg-slate-200 rounded mx-auto mb-2"></div>
                              <div className="h-4 bg-slate-200 rounded w-20 mx-auto"></div>
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
              ) : games && (games as any[]).length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
                  {(games as any[]).map(renderGameCard)}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center" data-testid="no-games">
                    <i className="fas fa-football-ball text-6xl text-slate-300 mb-4"></i>
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">No games scheduled</h3>
                    <p className="text-slate-600">Check back later for upcoming sports events!</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="live-now" className="space-y-4">
              <Card>
                <CardContent className="p-12 text-center" data-testid="live-games-placeholder">
                  <i className="fas fa-circle text-6xl text-red-500 mb-4 animate-pulse"></i>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">No Live Games</h3>
                  <p className="text-slate-600">Check back during game times for live updates!</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="by-sport" className="space-y-4">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {renderSportCategory('Football', 'fas fa-football-ball')}
                {renderSportCategory('Basketball', 'fas fa-basketball-ball')}
                {renderSportCategory('Baseball', 'fas fa-baseball-ball')}
                {renderSportCategory('Hockey', 'fas fa-hockey-puck')}
                {renderSportCategory('Soccer', 'fas fa-futbol')}
                {renderSportCategory('Tennis', 'fas fa-table-tennis')}
                {renderSportCategory('Golf', 'fas fa-golf-ball')}
                {renderSportCategory('Racing', 'fas fa-flag-checkered')}
              </div>
            </TabsContent>

            <TabsContent value="my-teams" className="space-y-4">
              <Card>
                <CardContent className="p-12 text-center" data-testid="no-favorite-teams">
                  <i className="fas fa-heart text-6xl text-slate-300 mb-4"></i>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">No favorite teams yet</h3>
                  <p className="text-slate-600 mb-6">
                    Follow your favorite teams to get personalized game updates and ticket offers!
                  </p>
                  <Button data-testid="button-browse-teams">
                    <i className="fas fa-search mr-2"></i>
                    Browse Teams
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