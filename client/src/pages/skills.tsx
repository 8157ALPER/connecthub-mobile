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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Navigation } from "@/components/navigation";
import { UserCard } from "@/components/user-card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const addSkillSchema = z.object({
  skillName: z.string().min(1, "Skill name is required"),
  level: z.enum(["beginner", "intermediate", "advanced", "expert"]),
  isTeaching: z.boolean().default(false),
  isLearning: z.boolean().default(false),
});

const createSkillSchema = z.object({
  name: z.string().min(1, "Skill name is required"),
  category: z.string().optional(),
  description: z.string().optional(),
});

export default function Skills() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const addForm = useForm<z.infer<typeof addSkillSchema>>({
    resolver: zodResolver(addSkillSchema),
    defaultValues: {
      skillName: "",
      level: "beginner",
      isTeaching: false,
      isLearning: false,
    },
  });

  const createForm = useForm<z.infer<typeof createSkillSchema>>({
    resolver: zodResolver(createSkillSchema),
    defaultValues: {
      name: "",
      category: "",
      description: "",
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

  const { data: skills, isLoading: isLoadingSkills } = useQuery({
    queryKey: ["/api/skills"],
    enabled: isAuthenticated,
    retry: false,
  });

  const { data: mySkills, isLoading: isLoadingMySkills } = useQuery({
    queryKey: ["/api/my-skills"],
    enabled: isAuthenticated,
    retry: false,
  });

  const { data: teachers, isLoading: isLoadingTeachers } = useQuery({
    queryKey: ["/api/skill-teachers"],
    enabled: isAuthenticated,
    retry: false,
  });

  const { data: learners, isLoading: isLoadingLearners } = useQuery({
    queryKey: ["/api/skill-learners"],
    enabled: isAuthenticated,
    retry: false,
  });

  const addSkillMutation = useMutation({
    mutationFn: async (skillData: z.infer<typeof addSkillSchema>) => {
      return await apiRequest("POST", "/api/user-skills", skillData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Skill added successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/my-skills"] });
      queryClient.invalidateQueries({ queryKey: ["/api/skill-teachers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/skill-learners"] });
      setIsAddDialogOpen(false);
      addForm.reset();
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
        description: "Failed to add skill. Please try again.",
        variant: "destructive",
      });
    },
  });

  const createSkillMutation = useMutation({
    mutationFn: async (skillData: z.infer<typeof createSkillSchema>) => {
      return await apiRequest("POST", "/api/skills", skillData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Skill created successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/skills"] });
      setIsCreateDialogOpen(false);
      createForm.reset();
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
        description: "Failed to create skill. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onAddSubmit = (data: z.infer<typeof addSkillSchema>) => {
    addSkillMutation.mutate(data);
  };

  const onCreateSubmit = (data: z.infer<typeof createSkillSchema>) => {
    createSkillMutation.mutate(data);
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "beginner": return "bg-green-100 text-green-700";
      case "intermediate": return "bg-blue-100 text-blue-700";
      case "advanced": return "bg-purple-100 text-purple-700";
      case "expert": return "bg-orange-100 text-orange-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading skills...</p>
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
                  <CardTitle className="flex items-center space-x-2" data-testid="skills-title">
                    <i className="fas fa-graduation-cap text-primary"></i>
                    <span>Skills</span>
                  </CardTitle>
                  <p className="text-slate-600 mt-2">
                    Share your skills and learn from others in the community
                  </p>
                </div>
                <div className="flex gap-2">
                  <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" data-testid="button-add-skill">
                        <i className="fas fa-plus mr-2"></i>
                        Add Skill
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Add Skill to Profile</DialogTitle>
                      </DialogHeader>
                      <Form {...addForm}>
                        <form onSubmit={addForm.handleSubmit(onAddSubmit)} className="space-y-4">
                          <FormField
                            control={addForm.control}
                            name="skillName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Skill</FormLabel>
                                <FormControl>
                                  <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger data-testid="select-skill">
                                      <SelectValue placeholder="Select a skill" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {skills && (skills as any[]).map((skill: any) => (
                                        <SelectItem key={skill.id} value={skill.name}>
                                          {skill.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={addForm.control}
                            name="level"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Level</FormLabel>
                                <FormControl>
                                  <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger data-testid="select-level">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="beginner">Beginner</SelectItem>
                                      <SelectItem value="intermediate">Intermediate</SelectItem>
                                      <SelectItem value="advanced">Advanced</SelectItem>
                                      <SelectItem value="expert">Expert</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={addForm.control}
                            name="isTeaching"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                <div className="space-y-0.5">
                                  <FormLabel>I can teach this</FormLabel>
                                  <div className="text-sm text-slate-600">
                                    Offer to teach this skill to others
                                  </div>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    data-testid="switch-teaching"
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={addForm.control}
                            name="isLearning"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                <div className="space-y-0.5">
                                  <FormLabel>I want to learn this</FormLabel>
                                  <div className="text-sm text-slate-600">
                                    Looking for someone to teach me
                                  </div>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    data-testid="switch-learning"
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />

                          <div className="flex gap-3 pt-4">
                            <Button 
                              type="submit" 
                              disabled={addSkillMutation.isPending}
                              data-testid="button-submit-add-skill"
                            >
                              {addSkillMutation.isPending ? (
                                <>
                                  <i className="fas fa-spinner fa-spin mr-2"></i>
                                  Adding...
                                </>
                              ) : (
                                <>
                                  <i className="fas fa-plus mr-2"></i>
                                  Add Skill
                                </>
                              )}
                            </Button>
                            <Button 
                              type="button" 
                              variant="outline" 
                              onClick={() => setIsAddDialogOpen(false)}
                              data-testid="button-cancel-add-skill"
                            >
                              Cancel
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>

                  <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                      <Button data-testid="button-create-skill">
                        <i className="fas fa-lightbulb mr-2"></i>
                        Create Skill
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Create New Skill</DialogTitle>
                      </DialogHeader>
                      <Form {...createForm}>
                        <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
                          <FormField
                            control={createForm.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Skill Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g. React Development" {...field} data-testid="input-skill-name" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={createForm.control}
                            name="category"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Category (optional)</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g. Programming" {...field} data-testid="input-skill-category" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={createForm.control}
                            name="description"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Description (optional)</FormLabel>
                                <FormControl>
                                  <Textarea placeholder="Describe the skill..." {...field} data-testid="input-skill-description" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="flex gap-3 pt-4">
                            <Button 
                              type="submit" 
                              disabled={createSkillMutation.isPending}
                              data-testid="button-submit-create-skill"
                            >
                              {createSkillMutation.isPending ? (
                                <>
                                  <i className="fas fa-spinner fa-spin mr-2"></i>
                                  Creating...
                                </>
                              ) : (
                                <>
                                  <i className="fas fa-lightbulb mr-2"></i>
                                  Create Skill
                                </>
                              )}
                            </Button>
                            <Button 
                              type="button" 
                              variant="outline" 
                              onClick={() => setIsCreateDialogOpen(false)}
                              data-testid="button-cancel-create-skill"
                            >
                              Cancel
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Skills Tabs */}
          <Tabs defaultValue="browse-skills" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="browse-skills" data-testid="tab-browse-skills">
                Browse Skills
              </TabsTrigger>
              <TabsTrigger value="my-skills" data-testid="tab-my-skills">
                My Skills
                {mySkills && (mySkills as any[]).length > 0 ? (
                  <Badge variant="secondary" className="ml-2" data-testid="badge-my-skills">
                    {(mySkills as any[]).length}
                  </Badge>
                ) : null}
              </TabsTrigger>
              <TabsTrigger value="teachers" data-testid="tab-teachers">
                Teachers
                {teachers && (teachers as any[]).length > 0 ? (
                  <Badge variant="secondary" className="ml-2" data-testid="badge-teachers">
                    {(teachers as any[]).length}
                  </Badge>
                ) : null}
              </TabsTrigger>
              <TabsTrigger value="learners" data-testid="tab-learners">
                Learners
                {learners && (learners as any[]).length > 0 ? (
                  <Badge variant="secondary" className="ml-2" data-testid="badge-learners">
                    {(learners as any[]).length}
                  </Badge>
                ) : null}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="browse-skills" className="space-y-4">
              {isLoadingSkills ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <Card key={i} className="animate-pulse" data-testid={`skeleton-skill-${i}`}>
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="h-5 bg-slate-200 rounded w-3/4"></div>
                          <div className="h-4 bg-slate-200 rounded"></div>
                          <div className="h-6 bg-slate-200 rounded w-20"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : skills && (skills as any[]).length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(skills as any[]).map((skill: any) => (
                    <Card key={skill.id} className="hover:shadow-md transition-shadow" data-testid={`skill-${skill.id}`}>
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <h3 className="font-semibold text-slate-900" data-testid={`skill-name-${skill.id}`}>
                            {skill.name}
                          </h3>
                          {skill.description && (
                            <p className="text-sm text-slate-600" data-testid={`skill-description-${skill.id}`}>
                              {skill.description}
                            </p>
                          )}
                          {skill.category && (
                            <Badge variant="outline" data-testid={`skill-category-${skill.id}`}>
                              {skill.category}
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center" data-testid="no-skills">
                    <i className="fas fa-graduation-cap text-6xl text-slate-300 mb-4"></i>
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">No skills yet</h3>
                    <p className="text-slate-600 mb-6">
                      Create the first skill to start building the skill community!
                    </p>
                    <Button onClick={() => setIsCreateDialogOpen(true)} data-testid="button-create-first-skill">
                      <i className="fas fa-lightbulb mr-2"></i>
                      Create First Skill
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="my-skills" className="space-y-4">
              {isLoadingMySkills ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Card key={i} className="animate-pulse" data-testid={`skeleton-my-skill-${i}`}>
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="h-5 bg-slate-200 rounded w-3/4"></div>
                          <div className="h-6 bg-slate-200 rounded w-20"></div>
                          <div className="flex gap-2">
                            <div className="h-6 bg-slate-200 rounded w-16"></div>
                            <div className="h-6 bg-slate-200 rounded w-16"></div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : mySkills && (mySkills as any[]).length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(mySkills as any[]).map((userSkill: any) => (
                    <Card key={userSkill.id} className="hover:shadow-md transition-shadow" data-testid={`my-skill-${userSkill.id}`}>
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <h3 className="font-semibold text-slate-900" data-testid={`my-skill-name-${userSkill.id}`}>
                            {userSkill.skill?.name}
                          </h3>
                          <Badge variant="outline" className={getLevelColor(userSkill.level)} data-testid={`my-skill-level-${userSkill.id}`}>
                            {userSkill.level}
                          </Badge>
                          <div className="flex gap-2">
                            {userSkill.isTeaching && (
                              <Badge variant="default" className="bg-green-500" data-testid={`my-skill-teaching-${userSkill.id}`}>
                                <i className="fas fa-chalkboard-teacher mr-1"></i>
                                Teaching
                              </Badge>
                            )}
                            {userSkill.isLearning && (
                              <Badge variant="default" className="bg-blue-500" data-testid={`my-skill-learning-${userSkill.id}`}>
                                <i className="fas fa-student mr-1"></i>
                                Learning
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center" data-testid="no-my-skills">
                    <i className="fas fa-user-graduate text-6xl text-slate-300 mb-4"></i>
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">No skills added yet</h3>
                    <p className="text-slate-600 mb-6">
                      Add skills to your profile to share your expertise and connect with others!
                    </p>
                    <Button onClick={() => setIsAddDialogOpen(true)} data-testid="button-add-first-skill">
                      <i className="fas fa-plus mr-2"></i>
                      Add Your First Skill
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="teachers" className="space-y-4">
              {isLoadingTeachers ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i} className="animate-pulse" data-testid={`skeleton-teacher-${i}`}>
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
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : teachers && (teachers as any[]).length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(teachers as any[]).map((teacher: any) => (
                    <UserCard 
                      key={teacher.id} 
                      user={teacher} 
                      showInterests={true}
                      data-testid={`teacher-${teacher.id}`}
                    />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center" data-testid="no-teachers">
                    <i className="fas fa-chalkboard-teacher text-6xl text-slate-300 mb-4"></i>
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">No teachers available</h3>
                    <p className="text-slate-600 mb-6">
                      Be the first to offer teaching and help others learn!
                    </p>
                    <Button onClick={() => setIsAddDialogOpen(true)} data-testid="button-become-teacher">
                      <i className="fas fa-chalkboard-teacher mr-2"></i>
                      Become a Teacher
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="learners" className="space-y-4">
              {isLoadingLearners ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i} className="animate-pulse" data-testid={`skeleton-learner-${i}`}>
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
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : learners && (learners as any[]).length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(learners as any[]).map((learner: any) => (
                    <UserCard 
                      key={learner.id} 
                      user={learner} 
                      showInterests={true}
                      data-testid={`learner-${learner.id}`}
                    />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center" data-testid="no-learners">
                    <i className="fas fa-user-graduate text-6xl text-slate-300 mb-4"></i>
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">No learners found</h3>
                    <p className="text-slate-600 mb-6">
                      Start learning something new and connect with teachers!
                    </p>
                    <Button onClick={() => setIsAddDialogOpen(true)} data-testid="button-start-learning">
                      <i className="fas fa-student mr-2"></i>
                      Start Learning
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