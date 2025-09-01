import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Navigation } from "@/components/navigation";

export default function Messages() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState("");

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

  const { data: connections, isLoading: isLoadingConnections } = useQuery({
    queryKey: ["/api/connections"],
    enabled: isAuthenticated,
    retry: false,
  });

  const { data: conversation, isLoading: isLoadingConversation } = useQuery({
    queryKey: ["/api/conversations", selectedUserId],
    enabled: isAuthenticated && !!selectedUserId,
    retry: false,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (data: { receiverId: string; content: string }) => {
      return await apiRequest("POST", "/api/messages", data);
    },
    onSuccess: () => {
      setMessageText("");
      if (selectedUserId) {
        queryClient.invalidateQueries({ queryKey: ["/api/conversations", selectedUserId] });
      }
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
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = () => {
    if (!selectedUserId || !messageText.trim()) return;

    sendMessageMutation.mutate({
      receiverId: selectedUserId,
      content: messageText.trim(),
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading messages...</p>
        </div>
      </div>
    );
  }

  const selectedUser = connections?.find((conn: any) => conn.user.id === selectedUserId)?.user;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8 h-[calc(100vh-12rem)]">
          {/* Connections List */}
          <div className="lg:col-span-1">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-lg" data-testid="connections-title">
                  <i className="fas fa-users mr-2"></i>
                  Connections
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[calc(100vh-16rem)]">
                  {isLoadingConnections ? (
                    <div className="p-4 text-center" data-testid="connections-loading">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                      <p className="mt-2 text-sm text-slate-500">Loading connections...</p>
                    </div>
                  ) : connections && connections.length > 0 ? (
                    <div className="space-y-1">
                      {connections.map((connection: any) => (
                        <div
                          key={connection.user.id}
                          onClick={() => setSelectedUserId(connection.user.id)}
                          className={`p-4 cursor-pointer hover:bg-slate-50 border-b border-slate-100 transition-colors ${
                            selectedUserId === connection.user.id ? 'bg-primary/10 border-primary/20' : ''
                          }`}
                          data-testid={`connection-item-${connection.user.id}`}
                        >
                          <div className="flex items-center space-x-3">
                            <img 
                              src={connection.user.profileImageUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=60&h=60"} 
                              alt={connection.user.displayName} 
                              className="w-12 h-12 rounded-full object-cover"
                              data-testid={`connection-image-${connection.user.id}`}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-slate-900 truncate" data-testid={`connection-name-${connection.user.id}`}>
                                {connection.user.displayName || connection.user.firstName}
                              </p>
                              <p className="text-sm text-slate-500 truncate" data-testid={`connection-location-${connection.user.id}`}>
                                {connection.user.location}
                              </p>
                            </div>
                            <div className="flex-shrink-0">
                              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center" data-testid="no-connections">
                      <i className="fas fa-user-plus text-4xl text-slate-300 mb-4"></i>
                      <h3 className="font-semibold text-slate-900 mb-2">No connections yet</h3>
                      <p className="text-sm text-slate-600 mb-4">
                        Start connecting with people to begin messaging
                      </p>
                      <Button variant="outline" size="sm" data-testid="button-discover-people">
                        <i className="fas fa-search mr-2"></i>
                        Discover People
                      </Button>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-3">
            <Card className="h-full">
              {selectedUser ? (
                <>
                  {/* Chat Header */}
                  <CardHeader className="border-b border-slate-200">
                    <div className="flex items-center space-x-4">
                      <img 
                        src={selectedUser.profileImageUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=60&h=60"} 
                        alt={selectedUser.displayName} 
                        className="w-12 h-12 rounded-full object-cover"
                        data-testid="chat-user-image"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900" data-testid="chat-user-name">
                          {selectedUser.displayName || selectedUser.firstName}
                        </h3>
                        <p className="text-sm text-slate-500" data-testid="chat-user-location">
                          {selectedUser.location}
                        </p>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                        <span className="text-sm text-slate-500">Online</span>
                      </div>
                    </div>
                  </CardHeader>

                  {/* Messages */}
                  <CardContent className="p-0 flex flex-col h-[calc(100vh-20rem)]">
                    <ScrollArea className="flex-1 p-4">
                      {isLoadingConversation ? (
                        <div className="text-center py-8" data-testid="conversation-loading">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                          <p className="mt-2 text-slate-500">Loading conversation...</p>
                        </div>
                      ) : conversation && conversation.length > 0 ? (
                        <div className="space-y-4">
                          {conversation.map((message: any) => (
                            <div
                              key={message.id}
                              className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                              data-testid={`message-${message.id}`}
                            >
                              <div
                                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                  message.senderId === user?.id
                                    ? 'bg-primary text-white'
                                    : 'bg-slate-100 text-slate-900'
                                }`}
                              >
                                <p className="text-sm" data-testid={`message-content-${message.id}`}>
                                  {message.content}
                                </p>
                                <p 
                                  className={`text-xs mt-1 ${
                                    message.senderId === user?.id ? 'text-white/70' : 'text-slate-500'
                                  }`}
                                  data-testid={`message-time-${message.id}`}
                                >
                                  {new Date(message.createdAt).toLocaleTimeString([], { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8" data-testid="no-messages">
                          <i className="fas fa-comments text-4xl text-slate-300 mb-4"></i>
                          <h3 className="font-semibold text-slate-900 mb-2">No messages yet</h3>
                          <p className="text-sm text-slate-600">
                            Start a conversation with {selectedUser.displayName || selectedUser.firstName}
                          </p>
                        </div>
                      )}
                    </ScrollArea>

                    {/* Message Input */}
                    <div className="border-t border-slate-200 p-4">
                      <div className="flex space-x-2">
                        <Textarea
                          placeholder="Type your message..."
                          value={messageText}
                          onChange={(e) => setMessageText(e.target.value)}
                          onKeyPress={handleKeyPress}
                          rows={1}
                          className="flex-1 resize-none"
                          data-testid="input-message"
                        />
                        <Button
                          onClick={handleSendMessage}
                          disabled={!messageText.trim() || sendMessageMutation.isPending}
                          data-testid="button-send-message"
                        >
                          {sendMessageMutation.isPending ? (
                            <i className="fas fa-spinner fa-spin"></i>
                          ) : (
                            <i className="fas fa-paper-plane"></i>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </>
              ) : (
                <CardContent className="flex items-center justify-center h-full">
                  <div className="text-center" data-testid="no-chat-selected">
                    <i className="fas fa-comments text-6xl text-slate-300 mb-4"></i>
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">Select a conversation</h3>
                    <p className="text-slate-600">
                      Choose a connection from the left to start messaging
                    </p>
                  </div>
                </CardContent>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
