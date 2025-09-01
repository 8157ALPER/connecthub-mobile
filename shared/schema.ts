import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  boolean,
  uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  displayName: varchar("display_name"),
  ageGroup: varchar("age_group", { enum: ['18-25', '26-35', '36-45', '46-55', '56-65', '65+'] }),
  locationCity: varchar("location_city"),
  locationState: varchar("location_state"),
  locationCountry: varchar("location_country"),
  shareLocation: boolean("share_location").default(false),
  bio: text("bio"),
  isBored: boolean("is_bored").default(false),
  averageRating: varchar("average_rating").default("0"),
  totalRatings: varchar("total_ratings").default("0"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Interest categories
export const interests = pgTable("interests", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 100 }).notNull().unique(),
  description: text("description"),
  icon: varchar("icon", { length: 50 }),
  color: varchar("color", { length: 20 }),
  memberCount: varchar("member_count").default("0"),
  createdAt: timestamp("created_at").defaultNow(),
});

// User interests junction table
export const userInterests = pgTable("user_interests", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  interestId: uuid("interest_id").references(() => interests.id, { onDelete: "cascade" }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Connections between users
export const connections = pgTable("connections", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  requesterId: varchar("requester_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  receiverId: varchar("receiver_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  status: varchar("status", { length: 20 }).default("pending"), // pending, accepted, declined
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Messages between users
export const messages = pgTable("messages", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  senderId: varchar("sender_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  receiverId: varchar("receiver_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  content: text("content").notNull(),
  isRead: boolean("is_read").default(false),
  photoUrl: varchar("photo_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Feature 1: Activity Feed
export const activities = pgTable("activities", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  type: varchar("type", { length: 50 }).notNull(), // connection, interest, event, etc.
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  metadata: jsonb("metadata"), // flexible data for different activity types
  isPublic: boolean("is_public").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Feature 2: Events
export const events = pgTable("events", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  creatorId: varchar("creator_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  location: varchar("location"),
  isVirtual: boolean("is_virtual").default(false),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  maxAttendees: varchar("max_attendees"),
  tags: text("tags").array(), // event tags/categories
  imageUrl: varchar("image_url"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const eventAttendees = pgTable("event_attendees", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: uuid("event_id").references(() => events.id, { onDelete: "cascade" }).notNull(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  status: varchar("status", { length: 20 }).default("going"), // going, maybe, not_going
  joinedAt: timestamp("joined_at").defaultNow(),
});

// Feature 3: Interest-Based Groups
export const groups = pgTable("groups", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  imageUrl: varchar("image_url"),
  creatorId: varchar("creator_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  isPrivate: boolean("is_private").default(false),
  memberCount: varchar("member_count").default("0"),
  tags: text("tags").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const groupMembers = pgTable("group_members", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  groupId: uuid("group_id").references(() => groups.id, { onDelete: "cascade" }).notNull(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  role: varchar("role", { length: 20 }).default("member"), // admin, moderator, member
  joinedAt: timestamp("joined_at").defaultNow(),
});

// Feature 4: User Status & Mood
export const userStatus = pgTable("user_status", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  mood: varchar("mood", { length: 50 }), // happy, bored, excited, etc.
  activity: varchar("activity", { length: 100 }), // what they're doing
  location: varchar("location"),
  isAvailable: boolean("is_available").default(true),
  customMessage: text("custom_message"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Feature 5: Skills (Skill Sharing)
export const skills = pgTable("skills", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 100 }).notNull().unique(),
  category: varchar("category", { length: 50 }),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userSkills = pgTable("user_skills", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  skillId: uuid("skill_id").references(() => skills.id, { onDelete: "cascade" }).notNull(),
  level: varchar("level", { length: 20 }).default("beginner"), // beginner, intermediate, advanced, expert
  isTeaching: boolean("is_teaching").default(false),
  isLearning: boolean("is_learning").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Feature 6: Notifications
export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  message: text("message"),
  relatedId: uuid("related_id"), // ID of related entity (event, user, etc.)
  relatedType: varchar("related_type", { length: 50 }), // event, user, group, etc.
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  userInterests: many(userInterests),
  userHobbies: many(userHobbies),
  sentConnections: many(connections, { relationName: "sentConnections" }),
  receivedConnections: many(connections, { relationName: "receivedConnections" }),
  sentMessages: many(messages, { relationName: "sentMessages" }),
  receivedMessages: many(messages, { relationName: "receivedMessages" }),
  activities: many(activities),
  createdEvents: many(events),
  eventAttendances: many(eventAttendees),
  createdGroups: many(groups),
  groupMemberships: many(groupMembers),
  createdHobbyGroups: many(hobbyGroups),
  hobbyGroupMemberships: many(hobbyGroupMembers),
  currentStatus: one(userStatus),
  userSkills: many(userSkills),
  notifications: many(notifications),
}));

export const interestsRelations = relations(interests, ({ many }) => ({
  userInterests: many(userInterests),
}));

export const userInterestsRelations = relations(userInterests, ({ one }) => ({
  user: one(users, {
    fields: [userInterests.userId],
    references: [users.id],
  }),
  interest: one(interests, {
    fields: [userInterests.interestId],
    references: [interests.id],
  }),
}));

export const connectionsRelations = relations(connections, ({ one }) => ({
  requester: one(users, {
    fields: [connections.requesterId],
    references: [users.id],
    relationName: "sentConnections",
  }),
  receiver: one(users, {
    fields: [connections.receiverId],
    references: [users.id],
    relationName: "receivedConnections",
  }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
    relationName: "sentMessages",
  }),
  receiver: one(users, {
    fields: [messages.receiverId],
    references: [users.id],
    relationName: "receivedMessages",
  }),
}));

// New relations for the 9 features
export const activitiesRelations = relations(activities, ({ one }) => ({
  user: one(users, {
    fields: [activities.userId],
    references: [users.id],
  }),
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
  creator: one(users, {
    fields: [events.creatorId],
    references: [users.id],
  }),
  attendees: many(eventAttendees),
}));

export const eventAttendeesRelations = relations(eventAttendees, ({ one }) => ({
  event: one(events, {
    fields: [eventAttendees.eventId],
    references: [events.id],
  }),
  user: one(users, {
    fields: [eventAttendees.userId],
    references: [users.id],
  }),
}));

export const groupsRelations = relations(groups, ({ one, many }) => ({
  creator: one(users, {
    fields: [groups.creatorId],
    references: [users.id],
  }),
  members: many(groupMembers),
}));

export const groupMembersRelations = relations(groupMembers, ({ one }) => ({
  group: one(groups, {
    fields: [groupMembers.groupId],
    references: [groups.id],
  }),
  user: one(users, {
    fields: [groupMembers.userId],
    references: [users.id],
  }),
}));

export const userStatusRelations = relations(userStatus, ({ one }) => ({
  user: one(users, {
    fields: [userStatus.userId],
    references: [users.id],
  }),
}));

export const skillsRelations = relations(skills, ({ many }) => ({
  userSkills: many(userSkills),
}));

export const userSkillsRelations = relations(userSkills, ({ one }) => ({
  user: one(users, {
    fields: [userSkills.userId],
    references: [users.id],
  }),
  skill: one(skills, {
    fields: [userSkills.skillId],
    references: [skills.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));


// User ratings table for security/experience ratings
export const userRatings = pgTable("user_ratings", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  raterId: varchar("rater_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  ratedUserId: varchar("rated_user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  rating: varchar("rating", { enum: ['1', '2', '3', '4', '5'] }).notNull(),
  experienceType: varchar("experience_type", { enum: ['event_attendance', 'reliability', 'communication', 'safety'] }).notNull(),
  comment: text("comment"),
  activityContext: varchar("activity_context"), // What activity/event this rating is for
  createdAt: timestamp("created_at").defaultNow(),
});

// Sports teams and activities
export const sportsTeams = pgTable("sports_teams", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 100 }).notNull(),
  sport: varchar("sport", { length: 50 }).notNull(),
  description: text("description"),
  location: jsonb("location").$type<{
    city: string;
    state?: string;
    coordinates?: { lat: number; lng: number };
  }>(),
  maxMembers: varchar("max_members").default("11"),
  currentMembers: varchar("current_members").default("1"),
  creatorId: varchar("creator_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  ageGroupPreference: varchar("age_group_preference", { enum: ['18-25', '26-35', '36-45', '46-55', '56-65', '65+', 'mixed'] }),
  skillLevel: varchar("skill_level", { enum: ['beginner', 'intermediate', 'advanced', 'mixed'] }).default('mixed'),
  meetingSchedule: jsonb("meeting_schedule").$type<{
    days: string[];
    times: string[];
    frequency: string;
  }>(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Team memberships
export const teamMemberships = pgTable("team_memberships", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  teamId: uuid("team_id").references(() => sportsTeams.id, { onDelete: "cascade" }).notNull(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  role: varchar("role", { enum: ['member', 'captain', 'co-captain'] }).default('member'),
  joinedAt: timestamp("joined_at").defaultNow(),
});

// Company advertisements
export const advertisements = pgTable("advertisements", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  companyName: varchar("company_name", { length: 100 }).notNull(),
  productName: varchar("product_name", { length: 100 }).notNull(),
  category: varchar("category", { enum: ['sports_equipment', 'movie_tickets', 'concert_tickets', 'theater_shows', 'general'] }).notNull(),
  description: text("description"),
  imageUrl: varchar("image_url"),
  targetAudience: jsonb("target_audience").$type<{
    ageGroups?: string[];
    interests?: string[];
    sports?: string[];
    location?: string;
  }>(),
  ctaText: varchar("cta_text").default('Learn More'),
  ctaUrl: varchar("cta_url"),
  isActive: boolean("is_active").default(true),
  impressions: varchar("impressions").default("0"),
  clicks: varchar("clicks").default("0"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Hobbies - for connecting people through shared activities
export const hobbies = pgTable("hobbies", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 100 }).notNull().unique(),
  description: text("description"),
  category: varchar("category", { length: 50 }), // e.g., "creative", "physical", "social", "intellectual"
  icon: varchar("icon", { length: 50 }),
  color: varchar("color", { length: 20 }),
  isElderlyFriendly: boolean("is_elderly_friendly").default(true),
  difficultyLevel: varchar("difficulty_level", { enum: ['easy', 'moderate', 'challenging'] }).default('easy'),
  memberCount: varchar("member_count").default("0"),
  createdAt: timestamp("created_at").defaultNow(),
});

// User hobbies junction table
export const userHobbies = pgTable("user_hobbies", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  hobbyId: uuid("hobby_id").references(() => hobbies.id, { onDelete: "cascade" }).notNull(),
  experienceLevel: varchar("experience_level", { enum: ['beginner', 'intermediate', 'advanced'] }).default('beginner'),
  isLookingForPartners: boolean("is_looking_for_partners").default(true),
  availableSchedule: jsonb("available_schedule").$type<{
    days: string[];
    timePreference: string; // "morning", "afternoon", "evening"
  }>(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Hobby groups for organizing meetups and activities
export const hobbyGroups = pgTable("hobby_groups", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 150 }).notNull(),
  description: text("description"),
  hobbyId: uuid("hobby_id").references(() => hobbies.id, { onDelete: "cascade" }).notNull(),
  creatorId: varchar("creator_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  location: jsonb("location").$type<{
    city: string;
    state?: string;
    address?: string;
    isVirtual: boolean;
  }>(),
  maxMembers: varchar("max_members").default("10"),
  currentMembers: varchar("current_members").default("1"),
  targetAgeGroup: varchar("target_age_group", { enum: ['18-25', '26-35', '36-45', '46-55', '56-65', '65+', 'mixed'] }),
  meetingSchedule: jsonb("meeting_schedule").$type<{
    frequency: string; // "weekly", "biweekly", "monthly"
    dayOfWeek: string;
    time: string;
  }>(),
  isActive: boolean("is_active").default(true),
  imageUrl: varchar("image_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Hobby group memberships
export const hobbyGroupMembers = pgTable("hobby_group_members", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  groupId: uuid("group_id").references(() => hobbyGroups.id, { onDelete: "cascade" }).notNull(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  role: varchar("role", { enum: ['member', 'organizer', 'co-organizer'] }).default('member'),
  joinedAt: timestamp("joined_at").defaultNow(),
});

// Insert schemas
export const hobbiesRelations = relations(hobbies, ({ many }) => ({
  userHobbies: many(userHobbies),
  hobbyGroups: many(hobbyGroups),
}));

export const userHobbiesRelations = relations(userHobbies, ({ one }) => ({
  user: one(users, {
    fields: [userHobbies.userId],
    references: [users.id],
  }),
  hobby: one(hobbies, {
    fields: [userHobbies.hobbyId],
    references: [hobbies.id],
  }),
}));

export const hobbyGroupsRelations = relations(hobbyGroups, ({ one, many }) => ({
  hobby: one(hobbies, {
    fields: [hobbyGroups.hobbyId],
    references: [hobbies.id],
  }),
  creator: one(users, {
    fields: [hobbyGroups.creatorId],
    references: [users.id],
  }),
  members: many(hobbyGroupMembers),
}));

export const hobbyGroupMembersRelations = relations(hobbyGroupMembers, ({ one }) => ({
  group: one(hobbyGroups, {
    fields: [hobbyGroupMembers.groupId],
    references: [hobbyGroups.id],
  }),
  user: one(users, {
    fields: [hobbyGroupMembers.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const upsertUserSchema = createInsertSchema(users).pick({
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
});

export const insertInterestSchema = createInsertSchema(interests).omit({
  id: true,
  createdAt: true,
});

export const insertUserInterestSchema = createInsertSchema(userInterests).omit({
  id: true,
  createdAt: true,
});

export const insertConnectionSchema = createInsertSchema(connections).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export const updateProfileSchema = insertUserSchema.extend({
  displayName: z.string().min(1, "Display name is required"),
  location: z.string().optional(),
  bio: z.string().optional(),
});

// Insert schemas for new features
export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
  createdAt: true,
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  createdAt: true,
});

export const insertEventAttendeeSchema = createInsertSchema(eventAttendees).omit({
  id: true,
  joinedAt: true,
});

export const insertGroupSchema = createInsertSchema(groups).omit({
  id: true,
  createdAt: true,
});

export const insertGroupMemberSchema = createInsertSchema(groupMembers).omit({
  id: true,
  joinedAt: true,
});

export const insertUserStatusSchema = createInsertSchema(userStatus).omit({
  id: true,
  createdAt: true,
});

export const insertSkillSchema = createInsertSchema(skills).omit({
  id: true,
  createdAt: true,
});

export const insertUserSkillSchema = createInsertSchema(userSkills).omit({
  id: true,
  createdAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export const insertHobbySchema = createInsertSchema(hobbies).omit({
  id: true,
  createdAt: true,
});

export const insertUserHobbySchema = createInsertSchema(userHobbies).omit({
  id: true,
  createdAt: true,
});

export const insertHobbyGroupSchema = createInsertSchema(hobbyGroups).omit({
  id: true,
  createdAt: true,
});

export const insertHobbyGroupMemberSchema = createInsertSchema(hobbyGroupMembers).omit({
  id: true,
  joinedAt: true,
});

// Types
export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type User = typeof users.$inferSelect;
export type Interest = typeof interests.$inferSelect;
export type UserInterest = typeof userInterests.$inferSelect;
export type Connection = typeof connections.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type Activity = typeof activities.$inferSelect;
export type Event = typeof events.$inferSelect;
export type EventAttendee = typeof eventAttendees.$inferSelect;
export type Group = typeof groups.$inferSelect;
export type GroupMember = typeof groupMembers.$inferSelect;
export type UserStatus = typeof userStatus.$inferSelect;
export type Skill = typeof skills.$inferSelect;
export type UserSkill = typeof userSkills.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type UserRating = typeof userRatings.$inferSelect;
export type SportsTeam = typeof sportsTeams.$inferSelect;
export type TeamMembership = typeof teamMemberships.$inferSelect;
export type Advertisement = typeof advertisements.$inferSelect;

export type InsertInterest = z.infer<typeof insertInterestSchema>;
export type InsertUserInterest = z.infer<typeof insertUserInterestSchema>;
export type InsertConnection = z.infer<typeof insertConnectionSchema>;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type InsertEventAttendee = z.infer<typeof insertEventAttendeeSchema>;
export type InsertGroup = z.infer<typeof insertGroupSchema>;
export type InsertGroupMember = z.infer<typeof insertGroupMemberSchema>;
export type InsertUserStatus = z.infer<typeof insertUserStatusSchema>;
export type InsertSkill = z.infer<typeof insertSkillSchema>;
export type InsertUserSkill = z.infer<typeof insertUserSkillSchema>;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type UpdateProfile = z.infer<typeof updateProfileSchema>;

export type Hobby = typeof hobbies.$inferSelect;
export type UserHobby = typeof userHobbies.$inferSelect;
export type HobbyGroup = typeof hobbyGroups.$inferSelect;
export type HobbyGroupMember = typeof hobbyGroupMembers.$inferSelect;

export type InsertHobby = z.infer<typeof insertHobbySchema>;
export type InsertUserHobby = z.infer<typeof insertUserHobbySchema>;
export type InsertHobbyGroup = z.infer<typeof insertHobbyGroupSchema>;
export type InsertHobbyGroupMember = z.infer<typeof insertHobbyGroupMemberSchema>;
