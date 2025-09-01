import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Navigation } from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export default function Hobbies() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("browse");
  const [newHobbyOpen, setNewHobbyOpen] = useState(false);
  const [newGroupOpen, setNewGroupOpen] = useState(false);

  // Fetch all hobbies
  const { data: hobbies = [] } = useQuery<any[]>({
    queryKey: ["/api/hobbies"],
  });

  // Fetch user's hobbies
  const { data: myHobbies = [] } = useQuery<any[]>({
    queryKey: ["/api/my-hobbies"],
  });

  // Fetch hobby groups
  const { data: hobbyGroups = [] } = useQuery<any[]>({
    queryKey: ["/api/hobby-groups"],
  });

  // Fetch hobby partners
  const { data: hobbyPartners = [] } = useQuery<any[]>({
    queryKey: ["/api/discover-hobby-partners"],
  });

  // Add hobby mutation
  const addHobbyMutation = useMutation({
    mutationFn: (hobbyData: any) => apiRequest("/api/user-hobbies", "POST", hobbyData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my-hobbies"] });
      queryClient.invalidateQueries({ queryKey: ["/api/discover-hobby-partners"] });
      toast({ title: "Hobby added successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to add hobby", variant: "destructive" });
    },
  });

  // Remove hobby mutation
  const removeHobbyMutation = useMutation({
    mutationFn: (hobbyId: string) => apiRequest(`/api/user-hobbies/${hobbyId}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my-hobbies"] });
      queryClient.invalidateQueries({ queryKey: ["/api/discover-hobby-partners"] });
      toast({ title: "Hobby removed successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to remove hobby", variant: "destructive" });
    },
  });

  // Create hobby mutation
  const createHobbyMutation = useMutation({
    mutationFn: (hobbyData: any) => apiRequest("/api/hobbies", "POST", hobbyData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hobbies"] });
      setNewHobbyOpen(false);
      toast({ title: "New hobby created successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to create hobby", variant: "destructive" });
    },
  });

  // Join hobby group mutation
  const joinGroupMutation = useMutation({
    mutationFn: (groupId: string) => apiRequest(`/api/hobby-groups/${groupId}/join`, "POST"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hobby-groups"] });
      toast({ title: "Successfully joined hobby group!" });
    },
    onError: () => {
      toast({ title: "Failed to join group", variant: "destructive" });
    },
  });

  const handleAddHobby = (hobby: any, experienceLevel: string = "beginner") => {
    addHobbyMutation.mutate({
      hobbyId: hobby.id,
      experienceLevel,
      isLookingForPartners: true,
      availableSchedule: {
        days: ["saturday", "sunday"],
        timePreference: "afternoon"
      }
    });
  };

  const handleRemoveHobby = (hobbyId: string) => {
    removeHobbyMutation.mutate(hobbyId);
  };

  const isHobbyAdded = (hobbyId: string) => {
    return myHobbies.some((h: any) => h.id === hobbyId);
  };

  const getExperienceColor = (level: string) => {
    switch (level) {
      case "beginner": return "bg-green-100 text-green-800 border-green-200";
      case "intermediate": return "bg-blue-100 text-blue-800 border-blue-200";
      case "advanced": return "bg-purple-100 text-purple-800 border-purple-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getDifficultyIcon = (level: string) => {
    switch (level) {
      case "easy": return "⭐";
      case "moderate": return "⭐⭐";
      case "challenging": return "⭐⭐⭐";
      default: return "⭐";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🎨 Discover Your Hobbies & Connect
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Find people who share your hobbies and interests. Join groups, make new friends, 
            and explore activities together. Perfect for staying active and social!
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-2 shadow-lg w-full max-w-4xl">
            <div className="grid grid-cols-2 md:flex md:space-x-2 gap-2 md:gap-0">
              {[
                { id: "browse", label: "Browse Hobbies", icon: "🔍" },
                { id: "my-hobbies", label: "My Hobbies", icon: "💝" },
                { id: "groups", label: "Hobby Groups", icon: "👥" },
                { id: "partners", label: "Find Partners", icon: "🤝" }
              ].map((tab) => (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? "default" : "ghost"}
                  size="lg"
                  onClick={() => setActiveTab(tab.id)}
                  className={`text-base md:text-lg px-4 md:px-6 py-4 md:py-3 h-auto min-h-[60px] md:min-h-[48px] flex-col md:flex-row whitespace-normal text-center ${
                    activeTab === tab.id 
                      ? "bg-blue-600 text-white shadow-md" 
                      : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                  }`}
                  data-testid={`tab-${tab.id}`}
                >
                  <span className="text-2xl md:text-xl md:mr-2">{tab.icon}</span>
                  <span className="text-sm md:text-lg font-medium">{tab.label}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Browse Hobbies Tab */}
        {activeTab === "browse" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">Available Hobbies</h2>
              <Dialog open={newHobbyOpen} onOpenChange={setNewHobbyOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" className="text-lg px-6 py-3" data-testid="button-suggest-hobby">
                    <span className="mr-2">💡</span>
                    Suggest New Hobby
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-xl">Suggest a New Hobby</DialogTitle>
                    <DialogDescription className="text-base">
                      Help expand our community by suggesting a new hobby others might enjoy!
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target as HTMLFormElement);
                    createHobbyMutation.mutate({
                      name: formData.get("name"),
                      description: formData.get("description"),
                      category: formData.get("category"),
                      difficultyLevel: formData.get("difficulty"),
                      isElderlyFriendly: true,
                    });
                  }}>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="name" className="text-base">Hobby Name</Label>
                        <Input name="name" id="name" placeholder="e.g., Gardening" required className="text-base h-12" />
                      </div>
                      <div>
                        <Label htmlFor="description" className="text-base">Description</Label>
                        <Textarea name="description" id="description" placeholder="What makes this hobby special?" className="text-base" />
                      </div>
                      <div>
                        <Label htmlFor="category" className="text-base">Category</Label>
                        <Select name="category">
                          <SelectTrigger className="h-12 text-base">
                            <SelectValue placeholder="Choose category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="creative">🎨 Creative</SelectItem>
                            <SelectItem value="physical">🏃 Physical</SelectItem>
                            <SelectItem value="social">👥 Social</SelectItem>
                            <SelectItem value="intellectual">🧠 Intellectual</SelectItem>
                            <SelectItem value="outdoor">🌳 Outdoor</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="difficulty" className="text-base">Difficulty Level</Label>
                        <Select name="difficulty">
                          <SelectTrigger className="h-12 text-base">
                            <SelectValue placeholder="Choose difficulty" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="easy">⭐ Easy - Perfect for beginners</SelectItem>
                            <SelectItem value="moderate">⭐⭐ Moderate - Some experience helpful</SelectItem>
                            <SelectItem value="challenging">⭐⭐⭐ Challenging - Requires dedication</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex gap-3 mt-6">
                      <Button type="button" variant="outline" onClick={() => setNewHobbyOpen(false)} className="flex-1 h-12 text-base">
                        Cancel
                      </Button>
                      <Button type="submit" className="flex-1 h-12 text-base" data-testid="button-create-hobby">
                        Create Hobby
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
              {hobbies.map((hobby: any) => (
                <Card key={hobby.id} className="hover:shadow-lg transition-shadow border-2 hover:border-blue-200 touch-manipulation">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl text-gray-900">{hobby.name}</CardTitle>
                      <span className="text-2xl">{getDifficultyIcon(hobby.difficultyLevel)}</span>
                    </div>
                    <CardDescription className="text-base text-gray-600 leading-relaxed">
                      {hobby.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {hobby.category && (
                        <Badge variant="secondary" className="text-sm px-3 py-1">
                          {hobby.category}
                        </Badge>
                      )}
                      {hobby.isElderlyFriendly && (
                        <Badge className="bg-green-100 text-green-800 text-sm px-3 py-1">
                          Senior Friendly
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-sm px-3 py-1">
                        {hobby.memberCount} members
                      </Badge>
                    </div>
                    
                    <Button
                      onClick={() => isHobbyAdded(hobby.id) ? handleRemoveHobby(hobby.id) : handleAddHobby(hobby)}
                      variant={isHobbyAdded(hobby.id) ? "destructive" : "default"}
                      className="w-full h-14 md:h-12 text-lg md:text-base font-medium touch-manipulation"
                      data-testid={`button-hobby-${hobby.id}`}
                    >
                      {isHobbyAdded(hobby.id) ? (
                        <>❌ Remove from My Hobbies</>
                      ) : (
                        <>➕ Add to My Hobbies</>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* My Hobbies Tab */}
        {activeTab === "my-hobbies" && (
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">My Hobbies</h2>
            {myHobbies.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <div className="text-6xl mb-4">🎯</div>
                  <h3 className="text-xl font-semibold mb-2">No hobbies yet!</h3>
                  <p className="text-gray-600 mb-6 text-lg">
                    Browse available hobbies and add the ones you enjoy or want to try.
                  </p>
                  <Button onClick={() => setActiveTab("browse")} size="lg" className="text-xl md:text-lg px-8 py-4 md:py-3 h-auto touch-manipulation">
                    Browse Hobbies
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                {myHobbies.map((hobby: any) => (
                  <Card key={hobby.id} className="border-2 border-blue-200">
                    <CardHeader>
                      <CardTitle className="text-xl">{hobby.name}</CardTitle>
                      <CardDescription className="text-base">
                        {hobby.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2 mb-4">
                        <Badge className={getExperienceColor(hobby.userHobby.experienceLevel)}>
                          {hobby.userHobby.experienceLevel}
                        </Badge>
                        {hobby.userHobby.isLookingForPartners && (
                          <Badge className="bg-blue-100 text-blue-800">
                            Looking for partners
                          </Badge>
                        )}
                      </div>
                      <Button
                        onClick={() => handleRemoveHobby(hobby.id)}
                        variant="outline"
                        className="w-full h-14 md:h-12 text-lg md:text-base touch-manipulation"
                        data-testid={`button-remove-hobby-${hobby.id}`}
                      >
                        Remove Hobby
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Hobby Groups Tab */}
        {activeTab === "groups" && (
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Hobby Groups</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
              {hobbyGroups.map((group: any) => (
                <Card key={group.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-xl">{group.name}</CardTitle>
                    <CardDescription className="text-base">
                      {group.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 mb-4 text-base">
                      <p><strong>Hobby:</strong> {group.hobby?.name}</p>
                      <p><strong>Members:</strong> {group.memberCount}/{group.maxMembers}</p>
                      <p><strong>Created by:</strong> {group.creator?.firstName} {group.creator?.lastName}</p>
                      {group.targetAgeGroup && (
                        <p><strong>Age Group:</strong> {group.targetAgeGroup}</p>
                      )}
                    </div>
                    <Button
                      onClick={() => joinGroupMutation.mutate(group.id)}
                      className="w-full h-14 md:h-12 text-lg md:text-base touch-manipulation"
                      data-testid={`button-join-group-${group.id}`}
                    >
                      Join Group
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Find Partners Tab */}
        {activeTab === "partners" && (
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Find Hobby Partners</h2>
            {hobbyPartners.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <div className="text-6xl mb-4">🤝</div>
                  <h3 className="text-xl font-semibold mb-2">No hobby partners found</h3>
                  <p className="text-gray-600 mb-6 text-lg">
                    Add some hobbies first, and we'll help you find people with shared interests!
                  </p>
                  <Button onClick={() => setActiveTab("browse")} size="lg" className="text-xl md:text-lg px-8 py-4 md:py-3 h-auto touch-manipulation">
                    Add Hobbies
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                {hobbyPartners.map((partner: any) => (
                  <Card key={partner.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center space-x-3">
                        <img
                          src={partner.profileImageUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=60&h=60"}
                          alt={`${partner.firstName}'s profile`}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div>
                          <CardTitle className="text-xl">{partner.firstName} {partner.lastName}</CardTitle>
                          <CardDescription className="text-base">
                            {partner.sharedHobbies?.length} shared hobbies
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 mb-4">
                        <div>
                          <p className="font-medium text-base">Shared Hobbies:</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {partner.sharedHobbies?.map((hobby: any) => (
                              <Badge key={hobby.id} variant="secondary" className="text-sm">
                                {hobby.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        {partner.bio && (
                          <p className="text-gray-600 text-base">{partner.bio}</p>
                        )}
                      </div>
                      <Button className="w-full h-14 md:h-12 text-lg md:text-base touch-manipulation" data-testid={`button-connect-${partner.id}`}>
                        Connect
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}