import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  decimal,
  boolean,
  uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  subscriptionTier: varchar("subscription_tier").default("Start"), // Start, Pro, Jaar
  subscriptionStatus: varchar("subscription_status").default("active"), // active, cancelled, expired
  subscriptionExpiresAt: timestamp("subscription_expires_at"),
  mollieCustomerId: varchar("mollie_customer_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Workout programs
export const workoutPrograms = pgTable("workout_programs", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  difficulty: varchar("difficulty"), // beginner, intermediate, advanced
  type: varchar("type"), // PPL, upper_lower, full_body, strength, cut, bulk
  durationWeeks: integer("duration_weeks"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Individual exercises
export const exercises = pgTable("exercises", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  muscleGroups: text("muscle_groups").array(), // chest, back, legs, etc.
  equipment: varchar("equipment"), // barbell, dumbbell, machine, bodyweight
  instructions: text("instructions"),
  videoUrl: varchar("video_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Workout sessions
export const workoutSessions = pgTable("workout_sessions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  programId: uuid("program_id").references(() => workoutPrograms.id),
  name: varchar("name", { length: 255 }).notNull(),
  date: timestamp("date").notNull(),
  duration: integer("duration"), // in minutes
  notes: text("notes"),
  completed: boolean("completed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Individual exercise sets within a workout
export const workoutSets = pgTable("workout_sets", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: uuid("session_id").notNull().references(() => workoutSessions.id),
  exerciseId: uuid("exercise_id").notNull().references(() => exercises.id),
  setNumber: integer("set_number").notNull(),
  reps: integer("reps"),
  weight: decimal("weight", { precision: 6, scale: 2 }),
  rpe: decimal("rpe", { precision: 3, scale: 1 }), // Rate of Perceived Exertion 1-10
  restTime: integer("rest_time"), // in seconds
  tempo: varchar("tempo"), // e.g., "3-1-1-0"
  completed: boolean("completed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Nutrition recipes
export const recipes = pgTable("recipes", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  instructions: text("instructions"),
  servings: integer("servings").default(1),
  prepTime: integer("prep_time"), // in minutes
  cookTime: integer("cook_time"), // in minutes
  calories: decimal("calories", { precision: 8, scale: 2 }),
  protein: decimal("protein", { precision: 6, scale: 2 }),
  carbs: decimal("carbs", { precision: 6, scale: 2 }),
  fat: decimal("fat", { precision: 6, scale: 2 }),
  fiber: decimal("fiber", { precision: 6, scale: 2 }),
  imageUrl: varchar("image_url"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// User meal tracking
export const mealEntries = pgTable("meal_entries", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  recipeId: uuid("recipe_id").references(() => recipes.id),
  date: timestamp("date").notNull(),
  mealType: varchar("meal_type"), // breakfast, lunch, dinner, snack
  servings: decimal("servings", { precision: 4, scale: 2 }).default("1"),
  calories: decimal("calories", { precision: 8, scale: 2 }),
  protein: decimal("protein", { precision: 6, scale: 2 }),
  carbs: decimal("carbs", { precision: 6, scale: 2 }),
  fat: decimal("fat", { precision: 6, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Progress photos
export const progressPhotos = pgTable("progress_photos", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  imageUrl: varchar("image_url").notNull(),
  date: timestamp("date").notNull(),
  weight: decimal("weight", { precision: 5, scale: 2 }),
  bodyFat: decimal("body_fat", { precision: 4, scale: 1 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// User personal records
export const personalRecords = pgTable("personal_records", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  exerciseId: uuid("exercise_id").notNull().references(() => exercises.id),
  weight: decimal("weight", { precision: 6, scale: 2 }).notNull(),
  reps: integer("reps").notNull(),
  date: timestamp("date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  workoutSessions: many(workoutSessions),
  mealEntries: many(mealEntries),
  progressPhotos: many(progressPhotos),
  personalRecords: many(personalRecords),
}));

export const workoutSessionsRelations = relations(workoutSessions, ({ one, many }) => ({
  user: one(users, { fields: [workoutSessions.userId], references: [users.id] }),
  program: one(workoutPrograms, { fields: [workoutSessions.programId], references: [workoutPrograms.id] }),
  sets: many(workoutSets),
}));

export const workoutSetsRelations = relations(workoutSets, ({ one }) => ({
  session: one(workoutSessions, { fields: [workoutSets.sessionId], references: [workoutSessions.id] }),
  exercise: one(exercises, { fields: [workoutSets.exerciseId], references: [exercises.id] }),
}));

export const mealEntriesRelations = relations(mealEntries, ({ one }) => ({
  user: one(users, { fields: [mealEntries.userId], references: [users.id] }),
  recipe: one(recipes, { fields: [mealEntries.recipeId], references: [recipes.id] }),
}));

export const progressPhotosRelations = relations(progressPhotos, ({ one }) => ({
  user: one(users, { fields: [progressPhotos.userId], references: [users.id] }),
}));

export const personalRecordsRelations = relations(personalRecords, ({ one }) => ({
  user: one(users, { fields: [personalRecords.userId], references: [users.id] }),
  exercise: one(exercises, { fields: [personalRecords.exerciseId], references: [exercises.id] }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWorkoutSessionSchema = createInsertSchema(workoutSessions).omit({
  id: true,
  createdAt: true,
});

export const insertWorkoutSetSchema = createInsertSchema(workoutSets).omit({
  id: true,
  createdAt: true,
});

export const insertRecipeSchema = createInsertSchema(recipes).omit({
  id: true,
  createdAt: true,
});

export const insertMealEntrySchema = createInsertSchema(mealEntries).omit({
  id: true,
  createdAt: true,
});

export const insertProgressPhotoSchema = createInsertSchema(progressPhotos).omit({
  id: true,
  createdAt: true,
});

export const insertPersonalRecordSchema = createInsertSchema(personalRecords).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertWorkoutSession = z.infer<typeof insertWorkoutSessionSchema>;
export type WorkoutSession = typeof workoutSessions.$inferSelect;
export type InsertWorkoutSet = z.infer<typeof insertWorkoutSetSchema>;
export type WorkoutSet = typeof workoutSets.$inferSelect;
export type Exercise = typeof exercises.$inferSelect;
export type WorkoutProgram = typeof workoutPrograms.$inferSelect;
export type InsertRecipe = z.infer<typeof insertRecipeSchema>;
export type Recipe = typeof recipes.$inferSelect;
export type InsertMealEntry = z.infer<typeof insertMealEntrySchema>;
export type MealEntry = typeof mealEntries.$inferSelect;
export type InsertProgressPhoto = z.infer<typeof insertProgressPhotoSchema>;
export type ProgressPhoto = typeof progressPhotos.$inferSelect;
export type InsertPersonalRecord = z.infer<typeof insertPersonalRecordSchema>;
export type PersonalRecord = typeof personalRecords.$inferSelect;
