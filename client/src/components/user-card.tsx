import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { InterestTag } from "./interest-tag";
import { Link } from "wouter";

interface UserCardProps {
  user: any;
  showInterests?: boolean;
  connectionStatus?: string;
  onConnectionUpdate?: () => void;
}

export function UserCard({ user, showInterests = false, connectionStatus, onConnectionUpdate }: UserCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isConnecting, setIsConnecting] = useState(false);

  const connectMutation = useMutation({
    mutationFn: async (receiverId: string) => {
      return await apiRequest("POST", "/api/connections", { receiverId });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Connection request sent successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/discover"] });
      queryClient.invalidateQueries({ queryKey: ["/api/connections"] });
      onConnectionUpdate?.();
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
        description: "Failed to send connection request. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await connectMutation.mutateAsync(user.id);
    } finally {
      setIsConnecting(false);
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'online' ? 'text-green-500' : 'text-yellow-500';
  };

  const getStatusText = (status: string) => {
    return status === 'online' ? 'Online now' : '2h ago';
  };

  const displayInterests = showInterests ? (user.allInterests || user.interests || []) : [];
  const sharedInterests = user.sharedInterests || [];

  return (
    <Card className="hover:shadow-lg transition-all duration-300" data-testid={`user-card-${user.id}`}>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <img 
                src={user.profileImageUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150"} 
                alt={`${user.displayName || user.firstName} profile`} 
                className="w-16 h-16 rounded-full object-cover"
                data-testid={`user-image-${user.id}`}
              />
              <div>
                <h3 className="font-semibold text-slate-900" data-testid={`user-name-${user.id}`}>
                  {user.displayName || user.firstName}
                </h3>
                <p className="text-sm text-slate-500" data-testid={`user-location-${user.id}`}>
                  {user.location}
                </p>
                <div className="flex items-center space-x-1 mt-1">
                  <span className={`text-xs ${getStatusColor('online')}`}>●</span>
                  <span className="text-xs text-slate-500" data-testid={`user-status-${user.id}`}>
                    {getStatusText('online')}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {user.bio && (
            <p className="text-slate-600 text-sm" data-testid={`user-bio-${user.id}`}>
              {user.bio}
            </p>
          )}
          
          {displayInterests.length > 0 && (
            <div className="space-y-2">
              {sharedInterests.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-slate-700 mb-1">Shared interests:</p>
                  <div className="flex flex-wrap gap-1">
                    {sharedInterests.slice(0, 3).map((interest: any) => (
                      <InterestTag 
                        key={interest.id} 
                        interest={interest} 
                        size="sm"
                        variant="primary"
                        data-testid={`shared-interest-${user.id}-${interest.id}`}
                      />
                    ))}
                    {sharedInterests.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{sharedInterests.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}
              
              {displayInterests.length > sharedInterests.length && (
                <div>
                  {sharedInterests.length > 0 && (
                    <p className="text-xs font-medium text-slate-700 mb-1">Other interests:</p>
                  )}
                  <div className="flex flex-wrap gap-1">
                    {displayInterests
                      .filter((interest: any) => !sharedInterests.some((shared: any) => shared.id === interest.id))
                      .slice(0, 3)
                      .map((interest: any) => (
                        <InterestTag 
                          key={interest.id} 
                          interest={interest} 
                          size="sm"
                          data-testid={`interest-${user.id}-${interest.id}`}
                        />
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          <div className="flex space-x-3 pt-2">
            {connectionStatus !== 'accepted' && (
              <Button 
                className="flex-1" 
                onClick={handleConnect}
                disabled={isConnecting || connectMutation.isPending || connectionStatus === 'pending'}
                data-testid={`button-connect-${user.id}`}
              >
                {connectionStatus === 'pending' ? 'Request Sent' : 
                 isConnecting || connectMutation.isPending ? 'Connecting...' : 'Connect'}
              </Button>
            )}
            
            {connectionStatus === 'accepted' ? (
              <Link href={`/messages?user=${user.id}`} className="flex-1">
                <Button variant="outline" className="w-full" data-testid={`button-message-${user.id}`}>
                  Message
                </Button>
              </Link>
            ) : (
              <Button 
                variant="outline" 
                disabled
                data-testid={`button-message-disabled-${user.id}`}
              >
                Message
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
