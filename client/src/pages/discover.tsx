import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Navigation } from "@/components/navigation";
import { UserCard } from "@/components/user-card";
import { InterestTag } from "@/components/interest-tag";

export default function Discover() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

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

  const { data: discoveredUsers, isLoading: isDiscovering, refetch: refetchUsers } = useQuery({
    queryKey: ["/api/discover", { limit: 20 }],
    enabled: isAuthenticated,
    retry: false,
  });

  const { data: interests, isLoading: isLoadingInterests } = useQuery({
    queryKey: ["/api/interests"],
    enabled: isAuthenticated,
    retry: false,
  });

  const { data: searchResults, isLoading: isSearching } = useQuery({
    queryKey: ["/api/search-users", { interests: selectedInterests }],
    enabled: isAuthenticated && selectedInterests.length > 0,
    retry: false,
  });

  const handleInterestToggle = (interestId: string) => {
    setSelectedInterests(prev => 
      prev.includes(interestId) 
        ? prev.filter(id => id !== interestId)
        : [...prev, interestId]
    );
  };

  const clearFilters = () => {
    setSelectedInterests([]);
    setSearchQuery("");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading discovery...</p>
        </div>
      </div>
    );
  }

  const displayedUsers = selectedInterests.length > 0 ? searchResults : discoveredUsers;
  const isLoadingUsers = selectedInterests.length > 0 ? isSearching : isDiscovering;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900" data-testid="discover-title">
              Discover Amazing People
            </h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto" data-testid="discover-description">
              Find people who share your interests and passions. Connect with like-minded individuals in your community.
            </p>
          </div>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Filters Sidebar */}
            <div className="lg:col-span-1">
              <Card className="sticky top-8">
                <CardHeader>
                  <CardTitle className="text-lg" data-testid="filters-title">
                    <i className="fas fa-filter mr-2"></i>
                    Filters
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Search */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Search by name
                    </label>
                    <Input
                      placeholder="Enter name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      data-testid="input-search"
                    />
                  </div>

                  {/* Interest Filters */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Filter by interests
                    </label>
                    {selectedInterests.length > 0 && (
                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-slate-500">Selected:</span>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={clearFilters}
                            data-testid="button-clear-filters"
                          >
                            Clear
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {selectedInterests.map(interestId => {
                            const interest = interests?.find((i: any) => i.id === interestId);
                            return interest ? (
                              <Badge 
                                key={interestId} 
                                variant="default" 
                                className="text-xs"
                                data-testid={`selected-interest-${interestId}`}
                              >
                                {interest.name}
                              </Badge>
                            ) : null;
                          })}
                        </div>
                      </div>
                    )}
                    
                    {isLoadingInterests ? (
                      <div className="text-center py-4" data-testid="interests-loading">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                      </div>
                    ) : interests && interests.length > 0 ? (
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {interests.map((interest: any) => (
                          <div key={interest.id} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`interest-${interest.id}`}
                              checked={selectedInterests.includes(interest.id)}
                              onChange={() => handleInterestToggle(interest.id)}
                              className="rounded border-slate-300 text-primary focus:ring-primary"
                              data-testid={`checkbox-interest-${interest.id}`}
                            />
                            <label 
                              htmlFor={`interest-${interest.id}`}
                              className="text-sm text-slate-700 cursor-pointer flex-1"
                              data-testid={`label-interest-${interest.id}`}
                            >
                              {interest.name}
                            </label>
                            <span className="text-xs text-slate-500" data-testid={`interest-count-${interest.id}`}>
                              {interest.memberCount}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500" data-testid="no-interests">No interests available</p>
                    )}
                  </div>

                  {/* Active Filters Summary */}
                  {(selectedInterests.length > 0 || searchQuery) && (
                    <div className="pt-4 border-t border-slate-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-700">Active Filters</span>
                        <Badge variant="outline" data-testid="filter-count">
                          {selectedInterests.length + (searchQuery ? 1 : 0)}
                        </Badge>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Results */}
            <div className="lg:col-span-3">
              <div className="space-y-6">
                {/* Results Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900" data-testid="results-title">
                      {selectedInterests.length > 0 ? "Search Results" : "Suggested for You"}
                    </h2>
                    <p className="text-sm text-slate-600" data-testid="results-count">
                      {isLoadingUsers 
                        ? "Loading..." 
                        : displayedUsers 
                          ? `${displayedUsers.length} people found`
                          : "No results"
                      }
                    </p>
                  </div>
                  <Button 
                    variant="outline"
                    onClick={() => refetchUsers()}
                    disabled={isLoadingUsers}
                    data-testid="button-refresh"
                  >
                    <i className="fas fa-sync-alt mr-2"></i>
                    Refresh
                  </Button>
                </div>

                {/* Results Grid */}
                {isLoadingUsers ? (
                  <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <Card key={i} className="animate-pulse" data-testid={`skeleton-card-${i}`}>
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
                ) : displayedUsers && displayedUsers.length > 0 ? (
                  <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {displayedUsers.map((user: any) => (
                      <UserCard 
                        key={user.id} 
                        user={user} 
                        showInterests={true}
                        data-testid={`user-card-${user.id}`}
                      />
                    ))}
                  </div>
                ) : (
                  <Card data-testid="no-results">
                    <CardContent className="p-12 text-center">
                      <i className="fas fa-users text-4xl text-slate-300 mb-4"></i>
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">No people found</h3>
                      <p className="text-slate-600 mb-4">
                        {selectedInterests.length > 0 
                          ? "Try adjusting your filters or add more interests to your profile"
                          : "Add interests to your profile to discover like-minded people"
                        }
                      </p>
                      {selectedInterests.length > 0 && (
                        <Button variant="outline" onClick={clearFilters} data-testid="button-clear-filters-empty">
                          Clear Filters
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
