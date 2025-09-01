import {
  users,
  interests,
  userInterests,
  connections,
  messages,
  activities,
  events,
  eventAttendees,
  groups,
  groupMembers,
  skills,
  userSkills,
  notifications,
  hobbies,
  userHobbies,
  hobbyGroups,
  hobbyGroupMembers,
  type User,
  type UpsertUser,
  type Interest,
  type UserInterest,
  type Connection,
  type Message,
  type Activity,
  type Event,
  type Group,
  type Skill,
  type Notification,
  type Hobby,
  type UserHobby,
  type HobbyGroup,
  type HobbyGroupMember,
  type InsertInterest,
  type InsertUserInterest,
  type InsertConnection,
  type InsertMessage,
  type InsertActivity,
  type InsertEvent,
  type InsertGroup,
  type InsertSkill,
  type InsertNotification,
  type InsertHobby,
  type InsertUserHobby,
  type InsertHobbyGroup,
  type InsertHobbyGroupMember,
  type UpdateProfile,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, ne, sql, desc, asc } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserProfile(userId: string, profile: UpdateProfile): Promise<User>;
  getUsersWithSharedInterests(userId: string, limit?: number): Promise<Array<User & { sharedInterests: Interest[]; allInterests: Interest[] }>>;
  searchUsersByInterests(interestIds: string[], excludeUserId?: string): Promise<Array<User & { interests: Interest[] }>>;
  
  // Interest operations
  getAllInterests(): Promise<Interest[]>;
  getInterestsByUser(userId: string): Promise<Interest[]>;
  createInterest(interest: InsertInterest): Promise<Interest>;
  addUserInterest(userInterest: InsertUserInterest): Promise<UserInterest>;
  removeUserInterest(userId: string, interestId: string): Promise<void>;
  updateInterestMemberCount(interestId: string): Promise<void>;
  
  // Connection operations
  getConnectionStatus(userId1: string, userId2: string): Promise<Connection | undefined>;
  createConnectionRequest(connection: InsertConnection): Promise<Connection>;
  updateConnectionStatus(connectionId: string, status: string): Promise<Connection>;
  getUserConnections(userId: string, status?: string): Promise<Array<Connection & { user: User }>>;
  getPendingConnectionRequests(userId: string): Promise<Array<Connection & { requester: User }>>;
  
  // Message operations
  createMessage(message: InsertMessage): Promise<Message>;
  getConversation(userId1: string, userId2: string): Promise<Array<Message & { sender: User; receiver: User }>>;
  getUserConversations(userId: string): Promise<Array<{ user: User; lastMessage: Message; unreadCount: number }>>;
  markMessagesAsRead(userId: string, senderId: string): Promise<void>;

  // Bored functionality
  updateBoredStatus(userId: string, status: boolean): Promise<User>;
  getBoredUsers(excludeUserId: string): Promise<User[]>;

  // Activity Feed
  getActivities(userId: string): Promise<any[]>;
  createActivity(activityData: any): Promise<any>;

  // Events
  getEvents(): Promise<any[]>;
  getUserEvents(userId: string): Promise<any[]>;
  createEvent(eventData: any): Promise<any>;
  joinEvent(attendeeData: any): Promise<any>;

  // Groups
  getGroups(): Promise<any[]>;
  getUserGroups(userId: string): Promise<any[]>;
  createGroup(groupData: any): Promise<any>;
  joinGroup(memberData: any): Promise<any>;

  // Skills
  getSkills(): Promise<any[]>;
  getUserSkills(userId: string): Promise<any[]>;
  getSkillTeachers(): Promise<any[]>;
  getSkillLearners(): Promise<any[]>;
  createSkill(skillData: any): Promise<any>;
  addUserSkill(userSkillData: any): Promise<any>;

  // Notifications
  getNotifications(userId: string): Promise<any[]>;
  createNotification(notificationData: any): Promise<any>;
  markNotificationAsRead(notificationId: string, userId: string): Promise<void>;
  markAllNotificationsAsRead(userId: string): Promise<void>;

  // Hobbies operations
  getAllHobbies(): Promise<Hobby[]>;
  getHobbiesByUser(userId: string): Promise<Array<Hobby & { userHobby: UserHobby }>>;
  createHobby(hobby: InsertHobby): Promise<Hobby>;
  addUserHobby(userHobby: InsertUserHobby): Promise<UserHobby>;
  removeUserHobby(userId: string, hobbyId: string): Promise<void>;
  updateHobbyMemberCount(hobbyId: string): Promise<void>;
  getUsersWithSharedHobbies(userId: string, limit?: number): Promise<Array<User & { sharedHobbies: Hobby[]; allHobbies: Hobby[] }>>;
  searchUsersByHobbies(hobbyIds: string[], excludeUserId?: string): Promise<Array<User & { hobbies: Hobby[] }>>;

  // Hobby Groups operations
  getAllHobbyGroups(): Promise<Array<HobbyGroup & { hobby: Hobby; creator: User; memberCount: number }>>;
  getHobbyGroupsByHobby(hobbyId: string): Promise<Array<HobbyGroup & { creator: User; memberCount: number }>>;
  getUserHobbyGroups(userId: string): Promise<Array<HobbyGroup & { hobby: Hobby; role: string }>>;
  createHobbyGroup(hobbyGroup: InsertHobbyGroup): Promise<HobbyGroup>;
  joinHobbyGroup(membership: InsertHobbyGroupMember): Promise<HobbyGroupMember>;
  leaveHobbyGroup(userId: string, groupId: string): Promise<void>;
  getHobbyGroupMembers(groupId: string): Promise<Array<HobbyGroupMember & { user: User }>>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserProfile(userId: string, profile: UpdateProfile): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        ...profile,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async getUsersWithSharedInterests(userId: string, limit = 10): Promise<Array<User & { sharedInterests: Interest[]; allInterests: Interest[] }>> {
    // Get user's interests
    const userInterestIds = await db
      .select({ interestId: userInterests.interestId })
      .from(userInterests)
      .where(eq(userInterests.userId, userId));

    if (userInterestIds.length === 0) {
      return [];
    }

    const interestIds = userInterestIds.map(ui => ui.interestId);

    // Find users with shared interests
    const usersWithSharedInterests = await db
      .select({
        user: users,
        interest: interests,
      })
      .from(users)
      .innerJoin(userInterests, eq(users.id, userInterests.userId))
      .innerJoin(interests, eq(userInterests.interestId, interests.id))
      .where(
        and(
          ne(users.id, userId),
          sql`${userInterests.interestId} = ANY(${interestIds})`
        )
      )
      .limit(limit * 10); // Get more to process

    // Group by user and aggregate interests
    const userMap = new Map<string, User & { sharedInterests: Interest[]; allInterests: Interest[] }>();
    
    for (const row of usersWithSharedInterests) {
      const userId = row.user.id;
      if (!userMap.has(userId)) {
        userMap.set(userId, {
          ...row.user,
          sharedInterests: [],
          allInterests: [],
        });
      }
      
      const user = userMap.get(userId)!;
      if (interestIds.includes(row.interest.id)) {
        user.sharedInterests.push(row.interest);
      }
      user.allInterests.push(row.interest);
    }

    return Array.from(userMap.values())
      .filter(user => user.sharedInterests.length > 0)
      .sort((a, b) => b.sharedInterests.length - a.sharedInterests.length)
      .slice(0, limit);
  }

  async searchUsersByInterests(interestIds: string[], excludeUserId?: string): Promise<Array<User & { interests: Interest[] }>> {
    const query = db
      .select({
        user: users,
        interest: interests,
      })
      .from(users)
      .innerJoin(userInterests, eq(users.id, userInterests.userId))
      .innerJoin(interests, eq(userInterests.interestId, interests.id))
      .where(
        and(
          sql`${userInterests.interestId} = ANY(${interestIds})`,
          excludeUserId ? ne(users.id, excludeUserId) : undefined
        )
      );

    const results = await query;

    // Group by user
    const userMap = new Map<string, User & { interests: Interest[] }>();
    for (const row of results) {
      const userId = row.user.id;
      if (!userMap.has(userId)) {
        userMap.set(userId, {
          ...row.user,
          interests: [],
        });
      }
      userMap.get(userId)!.interests.push(row.interest);
    }

    return Array.from(userMap.values());
  }

  // Interest operations
  async getAllInterests(): Promise<Interest[]> {
    return await db.select().from(interests).orderBy(asc(interests.name));
  }

  async getInterestsByUser(userId: string): Promise<Interest[]> {
    const result = await db
      .select({ interest: interests })
      .from(userInterests)
      .innerJoin(interests, eq(userInterests.interestId, interests.id))
      .where(eq(userInterests.userId, userId));
    
    return result.map(r => r.interest);
  }

  async createInterest(interest: InsertInterest): Promise<Interest> {
    const [newInterest] = await db.insert(interests).values(interest).returning();
    return newInterest;
  }

  async addUserInterest(userInterest: InsertUserInterest): Promise<UserInterest> {
    const [newUserInterest] = await db
      .insert(userInterests)
      .values(userInterest)
      .onConflictDoNothing()
      .returning();
    
    // Update member count
    await this.updateInterestMemberCount(userInterest.interestId);
    
    return newUserInterest;
  }

  async removeUserInterest(userId: string, interestId: string): Promise<void> {
    await db
      .delete(userInterests)
      .where(
        and(
          eq(userInterests.userId, userId),
          eq(userInterests.interestId, interestId)
        )
      );
    
    // Update member count
    await this.updateInterestMemberCount(interestId);
  }

  async updateInterestMemberCount(interestId: string): Promise<void> {
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(userInterests)
      .where(eq(userInterests.interestId, interestId));
    
    await db
      .update(interests)
      .set({ memberCount: count.toString() })
      .where(eq(interests.id, interestId));
  }

  // Connection operations
  async getConnectionStatus(userId1: string, userId2: string): Promise<Connection | undefined> {
    const [connection] = await db
      .select()
      .from(connections)
      .where(
        or(
          and(eq(connections.requesterId, userId1), eq(connections.receiverId, userId2)),
          and(eq(connections.requesterId, userId2), eq(connections.receiverId, userId1))
        )
      );
    return connection;
  }

  async createConnectionRequest(connection: InsertConnection): Promise<Connection> {
    const [newConnection] = await db.insert(connections).values(connection).returning();
    return newConnection;
  }

  async updateConnectionStatus(connectionId: string, status: string): Promise<Connection> {
    const [connection] = await db
      .update(connections)
      .set({ status, updatedAt: new Date() })
      .where(eq(connections.id, connectionId))
      .returning();
    return connection;
  }

  async getUserConnections(userId: string, status = "accepted"): Promise<Array<Connection & { user: User }>> {
    const result = await db
      .select({
        connection: connections,
        user: users,
      })
      .from(connections)
      .innerJoin(
        users,
        or(
          and(eq(connections.requesterId, userId), eq(users.id, connections.receiverId)),
          and(eq(connections.receiverId, userId), eq(users.id, connections.requesterId))
        )
      )
      .where(
        and(
          or(eq(connections.requesterId, userId), eq(connections.receiverId, userId)),
          eq(connections.status, status)
        )
      );

    return result.map(r => ({ ...r.connection, user: r.user }));
  }

  async getPendingConnectionRequests(userId: string): Promise<Array<Connection & { requester: User }>> {
    const result = await db
      .select({
        connection: connections,
        requester: users,
      })
      .from(connections)
      .innerJoin(users, eq(connections.requesterId, users.id))
      .where(
        and(
          eq(connections.receiverId, userId),
          eq(connections.status, "pending")
        )
      )
      .orderBy(desc(connections.createdAt));

    return result.map(r => ({ ...r.connection, requester: r.requester }));
  }

  // Message operations
  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db.insert(messages).values(message).returning();
    return newMessage;
  }

  async getConversation(userId1: string, userId2: string): Promise<Array<Message & { sender: User; receiver: User }>> {
    const result = await db
      .select({
        message: messages,
        sender: { id: users.id, displayName: users.displayName, profileImageUrl: users.profileImageUrl },
        receiver: { id: users.id, displayName: users.displayName, profileImageUrl: users.profileImageUrl },
      })
      .from(messages)
      .innerJoin(users, eq(messages.senderId, users.id))
      .where(
        or(
          and(eq(messages.senderId, userId1), eq(messages.receiverId, userId2)),
          and(eq(messages.senderId, userId2), eq(messages.receiverId, userId1))
        )
      )
      .orderBy(asc(messages.createdAt));

    return result.map(r => ({ 
      ...r.message, 
      sender: r.sender as User, 
      receiver: r.receiver as User 
    }));
  }

  async getUserConversations(userId: string): Promise<Array<{ user: User; lastMessage: Message; unreadCount: number }>> {
    // This is a complex query - for now return empty array
    // In a production app, you'd want to optimize this with proper indexing
    return [];
  }

  async markMessagesAsRead(userId: string, senderId: string): Promise<void> {
    await db
      .update(messages)
      .set({ isRead: true })
      .where(
        and(
          eq(messages.receiverId, userId),
          eq(messages.senderId, senderId),
          eq(messages.isRead, false)
        )
      );
  }

  // Bored functionality
  async updateBoredStatus(userId: string, status: boolean): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ isBored: status })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async getBoredUsers(excludeUserId: string): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .where(and(eq(users.isBored, true), ne(users.id, excludeUserId)));
  }

  // Activity Feed
  async getActivities(userId: string): Promise<any[]> {
    const result = await db
      .select({
        activity: activities,
        user: users,
      })
      .from(activities)
      .leftJoin(users, eq(activities.userId, users.id))
      .orderBy(desc(activities.createdAt))
      .limit(50);

    return result.map(r => ({ ...r.activity, user: r.user }));
  }

  async createActivity(activityData: InsertActivity): Promise<Activity> {
    const [activity] = await db.insert(activities).values(activityData).returning();
    return activity;
  }

  // Events
  async getEvents(): Promise<any[]> {
    const result = await db
      .select({
        event: events,
        creator: users,
      })
      .from(events)
      .leftJoin(users, eq(events.creatorId, users.id))
      .orderBy(desc(events.startDate));

    return result.map(r => ({ ...r.event, creator: r.creator }));
  }

  async getUserEvents(userId: string): Promise<any[]> {
    const result = await db
      .select({
        event: events,
        creator: users,
      })
      .from(events)
      .leftJoin(users, eq(events.creatorId, users.id))
      .where(eq(events.creatorId, userId))
      .orderBy(desc(events.startDate));

    return result.map(r => ({ ...r.event, creator: r.creator }));
  }

  async createEvent(eventData: InsertEvent): Promise<Event> {
    const [event] = await db.insert(events).values(eventData).returning();
    return event;
  }

  async joinEvent(attendeeData: any): Promise<any> {
    const [attendee] = await db.insert(eventAttendees).values(attendeeData).returning();
    return attendee;
  }

  // Groups
  async getGroups(): Promise<any[]> {
    const result = await db
      .select({
        group: groups,
        creator: users,
      })
      .from(groups)
      .leftJoin(users, eq(groups.creatorId, users.id))
      .orderBy(desc(groups.createdAt));

    return result.map(r => ({ ...r.group, creator: r.creator }));
  }

  async getUserGroups(userId: string): Promise<any[]> {
    const result = await db
      .select({
        group: groups,
        creator: users,
      })
      .from(groupMembers)
      .leftJoin(groups, eq(groupMembers.groupId, groups.id))
      .leftJoin(users, eq(groups.creatorId, users.id))
      .where(eq(groupMembers.userId, userId));

    return result.map(r => ({ ...r.group, creator: r.creator }));
  }

  async createGroup(groupData: InsertGroup): Promise<Group> {
    const [group] = await db.insert(groups).values(groupData).returning();
    return group;
  }

  async joinGroup(memberData: any): Promise<any> {
    const [member] = await db.insert(groupMembers).values(memberData).returning();
    return member;
  }

  // Skills
  async getSkills(): Promise<Skill[]> {
    return await db.select().from(skills).orderBy(skills.name);
  }

  async getUserSkills(userId: string): Promise<any[]> {
    const result = await db
      .select({
        userSkill: userSkills,
        skill: skills,
      })
      .from(userSkills)
      .leftJoin(skills, eq(userSkills.skillId, skills.id))
      .where(eq(userSkills.userId, userId));

    return result.map(r => ({ ...r.userSkill, skill: r.skill }));
  }

  async getSkillTeachers(): Promise<any[]> {
    const result = await db
      .select({
        user: users,
        userSkill: userSkills,
        skill: skills,
      })
      .from(userSkills)
      .leftJoin(users, eq(userSkills.userId, users.id))
      .leftJoin(skills, eq(userSkills.skillId, skills.id))
      .where(eq(userSkills.isTeaching, true));

    return result.map(r => ({ ...r.user, userSkill: r.userSkill, skill: r.skill }));
  }

  async getSkillLearners(): Promise<any[]> {
    const result = await db
      .select({
        user: users,
        userSkill: userSkills,
        skill: skills,
      })
      .from(userSkills)
      .leftJoin(users, eq(userSkills.userId, users.id))
      .leftJoin(skills, eq(userSkills.skillId, skills.id))
      .where(eq(userSkills.isLearning, true));

    return result.map(r => ({ ...r.user, userSkill: r.userSkill, skill: r.skill }));
  }

  async createSkill(skillData: InsertSkill): Promise<Skill> {
    const [skill] = await db.insert(skills).values(skillData).returning();
    return skill;
  }

  async addUserSkill(userSkillData: any): Promise<any> {
    const [userSkill] = await db.insert(userSkills).values(userSkillData).returning();
    return userSkill;
  }

  // Notifications
  async getNotifications(userId: string): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async createNotification(notificationData: InsertNotification): Promise<Notification> {
    const [notification] = await db.insert(notifications).values(notificationData).returning();
    return notification;
  }

  async markNotificationAsRead(notificationId: string, userId: string): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(and(eq(notifications.id, notificationId), eq(notifications.userId, userId)));
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
  }

  // Hobbies operations
  async getAllHobbies(): Promise<Hobby[]> {
    return await db
      .select()
      .from(hobbies)
      .orderBy(asc(hobbies.name));
  }

  async getHobbiesByUser(userId: string): Promise<Array<Hobby & { userHobby: UserHobby }>> {
    const result = await db
      .select({
        hobby: hobbies,
        userHobby: userHobbies,
      })
      .from(userHobbies)
      .leftJoin(hobbies, eq(userHobbies.hobbyId, hobbies.id))
      .where(eq(userHobbies.userId, userId));

    return result.map(r => ({ ...r.hobby!, userHobby: r.userHobby }));
  }

  async createHobby(hobbyData: InsertHobby): Promise<Hobby> {
    const [hobby] = await db.insert(hobbies).values(hobbyData).returning();
    return hobby;
  }

  async addUserHobby(userHobbyData: InsertUserHobby): Promise<UserHobby> {
    const [userHobby] = await db.insert(userHobbies).values(userHobbyData as any).returning();
    
    // Update hobby member count
    await this.updateHobbyMemberCount(userHobbyData.hobbyId);
    
    return userHobby;
  }

  async removeUserHobby(userId: string, hobbyId: string): Promise<void> {
    await db
      .delete(userHobbies)
      .where(and(eq(userHobbies.userId, userId), eq(userHobbies.hobbyId, hobbyId)));
    
    // Update hobby member count
    await this.updateHobbyMemberCount(hobbyId);
  }

  async updateHobbyMemberCount(hobbyId: string): Promise<void> {
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(userHobbies)
      .where(eq(userHobbies.hobbyId, hobbyId));
    
    await db
      .update(hobbies)
      .set({ memberCount: count.toString() })
      .where(eq(hobbies.id, hobbyId));
  }

  async getUsersWithSharedHobbies(userId: string, limit = 10): Promise<Array<User & { sharedHobbies: Hobby[]; allHobbies: Hobby[] }>> {
    // Get current user's hobbies
    const currentUserHobbies = await db
      .select({ hobbyId: userHobbies.hobbyId })
      .from(userHobbies)
      .where(eq(userHobbies.userId, userId));

    if (currentUserHobbies.length === 0) {
      return [];
    }

    const currentUserHobbyIds = currentUserHobbies.map(h => h.hobbyId);

    // Find users with shared hobbies
    const usersWithSharedHobbies = await db
      .select({
        user: users,
        hobby: hobbies,
      })
      .from(userHobbies)
      .leftJoin(users, eq(userHobbies.userId, users.id))
      .leftJoin(hobbies, eq(userHobbies.hobbyId, hobbies.id))
      .where(and(
        ne(userHobbies.userId, userId),
        sql`${userHobbies.hobbyId} = ANY(${currentUserHobbyIds})`
      ))
      .limit(limit * 3); // Get more to account for duplicates

    // Group by user and collect their hobbies
    const userMap = new Map();
    
    for (const row of usersWithSharedHobbies) {
      if (!row.user) continue;
      
      const userId = row.user.id;
      if (!userMap.has(userId)) {
        userMap.set(userId, {
          ...row.user,
          sharedHobbies: [],
          allHobbies: [],
        });
      }
      
      if (row.hobby) {
        const user = userMap.get(userId);
        user.allHobbies.push(row.hobby);
        if (currentUserHobbyIds.includes(row.hobby.id)) {
          user.sharedHobbies.push(row.hobby);
        }
      }
    }

    return Array.from(userMap.values())
      .filter(user => user.sharedHobbies.length > 0)
      .slice(0, limit);
  }

  async searchUsersByHobbies(hobbyIds: string[], excludeUserId?: string): Promise<Array<User & { hobbies: Hobby[] }>> {
    let whereConditions = sql`${userHobbies.hobbyId} = ANY(${hobbyIds})`;
    
    if (excludeUserId) {
      whereConditions = and(
        whereConditions,
        ne(userHobbies.userId, excludeUserId)
      )!;
    }

    const results = await db
      .select({
        user: users,
        hobby: hobbies,
      })
      .from(userHobbies)
      .leftJoin(users, eq(userHobbies.userId, users.id))
      .leftJoin(hobbies, eq(userHobbies.hobbyId, hobbies.id))
      .where(whereConditions);

    // Group by user
    const userMap = new Map();
    
    for (const row of results) {
      if (!row.user) continue;
      
      const userId = row.user.id;
      if (!userMap.has(userId)) {
        userMap.set(userId, {
          ...row.user,
          hobbies: [],
        });
      }
      
      if (row.hobby) {
        userMap.get(userId).hobbies.push(row.hobby);
      }
    }

    return Array.from(userMap.values());
  }

  // Hobby Groups operations
  async getAllHobbyGroups(): Promise<Array<HobbyGroup & { hobby: Hobby; creator: User; memberCount: number }>> {
    const result = await db
      .select({
        group: hobbyGroups,
        hobby: hobbies,
        creator: users,
        memberCount: sql<number>`CAST(${hobbyGroups.currentMembers} AS INTEGER)`,
      })
      .from(hobbyGroups)
      .leftJoin(hobbies, eq(hobbyGroups.hobbyId, hobbies.id))
      .leftJoin(users, eq(hobbyGroups.creatorId, users.id))
      .where(eq(hobbyGroups.isActive, true))
      .orderBy(desc(hobbyGroups.createdAt));

    return result.map(r => ({
      ...r.group,
      hobby: r.hobby!,
      creator: r.creator!,
      memberCount: r.memberCount,
    }));
  }

  async getHobbyGroupsByHobby(hobbyId: string): Promise<Array<HobbyGroup & { creator: User; memberCount: number }>> {
    const result = await db
      .select({
        group: hobbyGroups,
        creator: users,
        memberCount: sql<number>`CAST(${hobbyGroups.currentMembers} AS INTEGER)`,
      })
      .from(hobbyGroups)
      .leftJoin(users, eq(hobbyGroups.creatorId, users.id))
      .where(and(eq(hobbyGroups.hobbyId, hobbyId), eq(hobbyGroups.isActive, true)))
      .orderBy(desc(hobbyGroups.createdAt));

    return result.map(r => ({
      ...r.group,
      creator: r.creator!,
      memberCount: r.memberCount,
    }));
  }

  async getUserHobbyGroups(userId: string): Promise<Array<HobbyGroup & { hobby: Hobby; role: string }>> {
    const result = await db
      .select({
        group: hobbyGroups,
        hobby: hobbies,
        membership: hobbyGroupMembers,
      })
      .from(hobbyGroupMembers)
      .leftJoin(hobbyGroups, eq(hobbyGroupMembers.groupId, hobbyGroups.id))
      .leftJoin(hobbies, eq(hobbyGroups.hobbyId, hobbies.id))
      .where(eq(hobbyGroupMembers.userId, userId));

    return result.map(r => ({
      ...r.group!,
      hobby: r.hobby!,
      role: r.membership.role || 'member',
    }));
  }

  async createHobbyGroup(hobbyGroupData: InsertHobbyGroup): Promise<HobbyGroup> {
    const [group] = await db.insert(hobbyGroups).values(hobbyGroupData as any).returning();
    
    // Auto-join the creator as an organizer
    await db.insert(hobbyGroupMembers).values({
      groupId: group.id,
      userId: hobbyGroupData.creatorId,
      role: 'organizer',
    });
    
    return group;
  }

  async joinHobbyGroup(membershipData: InsertHobbyGroupMember): Promise<HobbyGroupMember> {
    const [membership] = await db.insert(hobbyGroupMembers).values(membershipData).returning();
    
    // Update group member count
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(hobbyGroupMembers)
      .where(eq(hobbyGroupMembers.groupId, membershipData.groupId));
    
    await db
      .update(hobbyGroups)
      .set({ currentMembers: count.toString() })
      .where(eq(hobbyGroups.id, membershipData.groupId));
    
    return membership;
  }

  async leaveHobbyGroup(userId: string, groupId: string): Promise<void> {
    await db
      .delete(hobbyGroupMembers)
      .where(and(eq(hobbyGroupMembers.userId, userId), eq(hobbyGroupMembers.groupId, groupId)));
    
    // Update group member count
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(hobbyGroupMembers)
      .where(eq(hobbyGroupMembers.groupId, groupId));
    
    await db
      .update(hobbyGroups)
      .set({ currentMembers: count.toString() })
      .where(eq(hobbyGroups.id, groupId));
  }

  async getHobbyGroupMembers(groupId: string): Promise<Array<HobbyGroupMember & { user: User }>> {
    const result = await db
      .select({
        membership: hobbyGroupMembers,
        user: users,
      })
      .from(hobbyGroupMembers)
      .leftJoin(users, eq(hobbyGroupMembers.userId, users.id))
      .where(eq(hobbyGroupMembers.groupId, groupId));

    return result.map(r => ({
      ...r.membership,
      user: r.user!,
    }));
  }
}

export const storage = new DatabaseStorage();
