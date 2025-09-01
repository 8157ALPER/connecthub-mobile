import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  insertInterestSchema, 
  insertUserInterestSchema, 
  insertConnectionSchema, 
  insertMessageSchema,
  updateProfileSchema,
  insertHobbySchema,
  insertUserHobbySchema,
  insertHobbyGroupSchema,
  insertHobbyGroupMemberSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Get user's interests
      const interests = await storage.getInterestsByUser(userId);
      res.json({ ...user, interests });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Profile routes
  app.put('/api/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profileData = updateProfileSchema.parse(req.body);
      
      const updatedUser = await storage.updateUserProfile(userId, profileData);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Interest routes
  app.get('/api/interests', async (req, res) => {
    try {
      const interests = await storage.getAllInterests();
      res.json(interests);
    } catch (error) {
      console.error("Error fetching interests:", error);
      res.status(500).json({ message: "Failed to fetch interests" });
    }
  });

  app.post('/api/interests', isAuthenticated, async (req: any, res) => {
    try {
      const interestData = insertInterestSchema.parse(req.body);
      const interest = await storage.createInterest(interestData);
      res.json(interest);
    } catch (error) {
      console.error("Error creating interest:", error);
      res.status(500).json({ message: "Failed to create interest" });
    }
  });

  app.post('/api/user-interests', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { interestId } = req.body;
      
      const userInterest = await storage.addUserInterest({
        userId,
        interestId,
      });
      
      res.json(userInterest);
    } catch (error) {
      console.error("Error adding user interest:", error);
      res.status(500).json({ message: "Failed to add interest" });
    }
  });

  app.delete('/api/user-interests/:interestId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { interestId } = req.params;
      
      await storage.removeUserInterest(userId, interestId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error removing user interest:", error);
      res.status(500).json({ message: "Failed to remove interest" });
    }
  });

  // Discovery routes
  app.get('/api/discover', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = parseInt(req.query.limit as string) || 10;
      
      const users = await storage.getUsersWithSharedInterests(userId, limit);
      res.json(users);
    } catch (error) {
      console.error("Error discovering users:", error);
      res.status(500).json({ message: "Failed to discover users" });
    }
  });

  app.get('/api/search-users', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const interestIds = req.query.interests as string[];
      
      if (!interestIds || !Array.isArray(interestIds)) {
        return res.status(400).json({ message: "Interest IDs required" });
      }
      
      const users = await storage.searchUsersByInterests(interestIds, userId);
      res.json(users);
    } catch (error) {
      console.error("Error searching users:", error);
      res.status(500).json({ message: "Failed to search users" });
    }
  });

  // Connection routes
  app.get('/api/connections', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const status = req.query.status as string || "accepted";
      
      const connections = await storage.getUserConnections(userId, status);
      res.json(connections);
    } catch (error) {
      console.error("Error fetching connections:", error);
      res.status(500).json({ message: "Failed to fetch connections" });
    }
  });

  app.get('/api/connection-requests', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const requests = await storage.getPendingConnectionRequests(userId);
      res.json(requests);
    } catch (error) {
      console.error("Error fetching connection requests:", error);
      res.status(500).json({ message: "Failed to fetch connection requests" });
    }
  });

  app.post('/api/connections', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { receiverId } = req.body;
      
      // Check if connection already exists
      const existingConnection = await storage.getConnectionStatus(userId, receiverId);
      if (existingConnection) {
        return res.status(400).json({ message: "Connection already exists" });
      }
      
      const connection = await storage.createConnectionRequest({
        requesterId: userId,
        receiverId,
        status: "pending",
      });
      
      res.json(connection);
    } catch (error) {
      console.error("Error creating connection:", error);
      res.status(500).json({ message: "Failed to create connection" });
    }
  });

  app.put('/api/connections/:connectionId', isAuthenticated, async (req: any, res) => {
    try {
      const { connectionId } = req.params;
      const { status } = req.body;
      
      if (!["accepted", "declined"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const connection = await storage.updateConnectionStatus(connectionId, status);
      res.json(connection);
    } catch (error) {
      console.error("Error updating connection:", error);
      res.status(500).json({ message: "Failed to update connection" });
    }
  });

  // Message routes
  app.get('/api/conversations/:userId', isAuthenticated, async (req: any, res) => {
    try {
      const currentUserId = req.user.claims.sub;
      const { userId } = req.params;
      
      const conversation = await storage.getConversation(currentUserId, userId);
      
      // Mark messages as read
      await storage.markMessagesAsRead(currentUserId, userId);
      
      res.json(conversation);
    } catch (error) {
      console.error("Error fetching conversation:", error);
      res.status(500).json({ message: "Failed to fetch conversation" });
    }
  });

  app.post('/api/messages', isAuthenticated, async (req: any, res) => {
    try {
      const senderId = req.user.claims.sub;
      const messageData = insertMessageSchema.parse({
        ...req.body,
        senderId,
      });
      
      const message = await storage.createMessage(messageData);
      res.json(message);
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  // Bored functionality routes
  app.get('/api/bored-users', isAuthenticated, async (req: any, res) => {
    try {
      const currentUserId = req.user.claims.sub;
      const limit = parseInt(req.query.limit as string) || 20;
      
      // For now, return users with shared interests who might be "bored"
      // In a real implementation, you'd track bored status in the database
      const users = await storage.getUsersWithSharedInterests(currentUserId, limit);
      
      // Simulate some users being "bored" by adding a bored flag
      const boredUsers = users.map((user: any, index: number) => ({
        ...user,
        isBored: index % 3 === 0, // Every 3rd user is "bored" for demo
        boredSince: new Date(Date.now() - Math.random() * 3600000), // Random time in last hour
      })).filter((user: any) => user.isBored);
      
      res.json(boredUsers);
    } catch (error) {
      console.error("Error fetching bored users:", error);
      res.status(500).json({ message: "Failed to fetch bored users" });
    }
  });

  app.get('/api/interest-groups', isAuthenticated, async (req: any, res) => {
    try {
      const interests = await storage.getAllInterests();
      
      // Create interest groups with intersecting users
      const interestGroups = interests.map((interest: any) => ({
        id: interest.id,
        name: `${interest.name} Enthusiasts`,
        description: `Connect with other ${interest.name.toLowerCase()} lovers and discover new activities together`,
        interests: [interest],
        memberCount: parseInt(interest.memberCount) || 0,
        boredMembers: Math.floor(Math.random() * 5), // Random number of bored members
      })).filter((group: any) => group.memberCount > 0);
      
      res.json(interestGroups);
    } catch (error) {
      console.error("Error fetching interest groups:", error);
      res.status(500).json({ message: "Failed to fetch interest groups" });
    }
  });

  app.post('/api/user-bored-status', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { isBored } = req.body;
      
      // In a real implementation, you'd update the user's bored status in the database
      // For now, just return success
      res.json({ 
        success: true, 
        message: isBored ? "User marked as bored" : "User no longer bored",
        isBored 
      });
    } catch (error) {
      console.error("Error updating bored status:", error);
      res.status(500).json({ message: "Failed to update bored status" });
    }
  });

  // ============ ACTIVITY FEED ROUTES ============
  app.get("/api/activities", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const activities = await storage.getActivities(userId);
      res.json(activities);
    } catch (error) {
      console.error("Error fetching activities:", error);
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });

  // ============ EVENTS ROUTES ============
  app.get("/api/events", isAuthenticated, async (req: any, res) => {
    try {
      const events = await storage.getEvents();
      res.json(events);
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  app.get("/api/my-events", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const events = await storage.getUserEvents(userId);
      res.json(events);
    } catch (error) {
      console.error("Error fetching user events:", error);
      res.status(500).json({ message: "Failed to fetch user events" });
    }
  });

  app.post("/api/events", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const event = await storage.createEvent({ ...req.body, creatorId: userId });
      res.json(event);
    } catch (error) {
      console.error("Error creating event:", error);
      res.status(500).json({ message: "Failed to create event" });
    }
  });

  // ============ GROUPS ROUTES ============
  app.get("/api/groups", isAuthenticated, async (req: any, res) => {
    try {
      const groups = await storage.getGroups();
      res.json(groups);
    } catch (error) {
      console.error("Error fetching groups:", error);
      res.status(500).json({ message: "Failed to fetch groups" });
    }
  });

  app.get("/api/my-groups", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const groups = await storage.getUserGroups(userId);
      res.json(groups);
    } catch (error) {
      console.error("Error fetching user groups:", error);
      res.status(500).json({ message: "Failed to fetch user groups" });
    }
  });

  app.post("/api/groups", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const group = await storage.createGroup({ ...req.body, creatorId: userId });
      res.json(group);
    } catch (error) {
      console.error("Error creating group:", error);
      res.status(500).json({ message: "Failed to create group" });
    }
  });

  // ============ SKILLS ROUTES ============
  app.get("/api/skills", isAuthenticated, async (req: any, res) => {
    try {
      const skills = await storage.getSkills();
      res.json(skills);
    } catch (error) {
      console.error("Error fetching skills:", error);
      res.status(500).json({ message: "Failed to fetch skills" });
    }
  });

  app.get("/api/my-skills", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const skills = await storage.getUserSkills(userId);
      res.json(skills);
    } catch (error) {
      console.error("Error fetching user skills:", error);
      res.status(500).json({ message: "Failed to fetch user skills" });
    }
  });

  app.post("/api/skills", isAuthenticated, async (req: any, res) => {
    try {
      const skill = await storage.createSkill(req.body);
      res.json(skill);
    } catch (error) {
      console.error("Error creating skill:", error);
      res.status(500).json({ message: "Failed to create skill" });
    }
  });

  app.post("/api/user-skills", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const userSkill = await storage.addUserSkill({ ...req.body, userId });
      res.json(userSkill);
    } catch (error) {
      console.error("Error adding user skill:", error);
      res.status(500).json({ message: "Failed to add user skill" });
    }
  });

  // ============ NOTIFICATIONS ROUTES ============
  app.get("/api/notifications", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const notifications = await storage.getNotifications(userId);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  // ============ HOBBIES ROUTES ============
  app.get('/api/hobbies', async (req, res) => {
    try {
      const hobbies = await storage.getAllHobbies();
      res.json(hobbies);
    } catch (error) {
      console.error("Error fetching hobbies:", error);
      res.status(500).json({ message: "Failed to fetch hobbies" });
    }
  });

  app.post('/api/hobbies', isAuthenticated, async (req: any, res) => {
    try {
      const hobbyData = insertHobbySchema.parse(req.body);
      const hobby = await storage.createHobby(hobbyData);
      res.json(hobby);
    } catch (error) {
      console.error("Error creating hobby:", error);
      res.status(500).json({ message: "Failed to create hobby" });
    }
  });

  app.get('/api/my-hobbies', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const hobbies = await storage.getHobbiesByUser(userId);
      res.json(hobbies);
    } catch (error) {
      console.error("Error fetching user hobbies:", error);
      res.status(500).json({ message: "Failed to fetch user hobbies" });
    }
  });

  app.post('/api/user-hobbies', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { hobbyId, experienceLevel, isLookingForPartners, availableSchedule } = req.body;
      
      const userHobby = await storage.addUserHobby({
        userId,
        hobbyId,
        experienceLevel,
        isLookingForPartners,
        availableSchedule,
      });
      
      res.json(userHobby);
    } catch (error) {
      console.error("Error adding user hobby:", error);
      res.status(500).json({ message: "Failed to add hobby" });
    }
  });

  app.delete('/api/user-hobbies/:hobbyId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { hobbyId } = req.params;
      
      await storage.removeUserHobby(userId, hobbyId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error removing user hobby:", error);
      res.status(500).json({ message: "Failed to remove hobby" });
    }
  });

  app.get('/api/discover-hobby-partners', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = parseInt(req.query.limit as string) || 10;
      
      const users = await storage.getUsersWithSharedHobbies(userId, limit);
      res.json(users);
    } catch (error) {
      console.error("Error discovering hobby partners:", error);
      res.status(500).json({ message: "Failed to discover hobby partners" });
    }
  });

  app.get('/api/search-hobby-users', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const hobbyIds = req.query.hobbies as string[];
      
      if (!hobbyIds || !Array.isArray(hobbyIds)) {
        return res.status(400).json({ message: "Hobby IDs required" });
      }
      
      const users = await storage.searchUsersByHobbies(hobbyIds, userId);
      res.json(users);
    } catch (error) {
      console.error("Error searching hobby users:", error);
      res.status(500).json({ message: "Failed to search hobby users" });
    }
  });

  // ============ HOBBY GROUPS ROUTES ============
  app.get('/api/hobby-groups', async (req, res) => {
    try {
      const groups = await storage.getAllHobbyGroups();
      res.json(groups);
    } catch (error) {
      console.error("Error fetching hobby groups:", error);
      res.status(500).json({ message: "Failed to fetch hobby groups" });
    }
  });

  app.get('/api/hobby-groups/hobby/:hobbyId', async (req, res) => {
    try {
      const { hobbyId } = req.params;
      const groups = await storage.getHobbyGroupsByHobby(hobbyId);
      res.json(groups);
    } catch (error) {
      console.error("Error fetching hobby groups by hobby:", error);
      res.status(500).json({ message: "Failed to fetch hobby groups" });
    }
  });

  app.get('/api/my-hobby-groups', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const groups = await storage.getUserHobbyGroups(userId);
      res.json(groups);
    } catch (error) {
      console.error("Error fetching user hobby groups:", error);
      res.status(500).json({ message: "Failed to fetch user hobby groups" });
    }
  });

  app.post('/api/hobby-groups', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const groupData = insertHobbyGroupSchema.parse({
        ...req.body,
        creatorId: userId,
      });
      
      const group = await storage.createHobbyGroup(groupData);
      res.json(group);
    } catch (error) {
      console.error("Error creating hobby group:", error);
      res.status(500).json({ message: "Failed to create hobby group" });
    }
  });

  app.post('/api/hobby-groups/:groupId/join', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { groupId } = req.params;
      
      const membership = await storage.joinHobbyGroup({
        groupId,
        userId,
        role: 'member',
      });
      
      res.json(membership);
    } catch (error) {
      console.error("Error joining hobby group:", error);
      res.status(500).json({ message: "Failed to join hobby group" });
    }
  });

  app.delete('/api/hobby-groups/:groupId/leave', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { groupId } = req.params;
      
      await storage.leaveHobbyGroup(userId, groupId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error leaving hobby group:", error);
      res.status(500).json({ message: "Failed to leave hobby group" });
    }
  });

  app.get('/api/hobby-groups/:groupId/members', async (req, res) => {
    try {
      const { groupId } = req.params;
      const members = await storage.getHobbyGroupMembers(groupId);
      res.json(members);
    } catch (error) {
      console.error("Error fetching hobby group members:", error);
      res.status(500).json({ message: "Failed to fetch group members" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
