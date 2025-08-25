import {
  users,
  workoutSessions,
  workoutSets,
  exercises,
  workoutPrograms,
  recipes,
  mealEntries,
  progressPhotos,
  personalRecords,
  type User,
  type UpsertUser,
  type InsertWorkoutSession,
  type WorkoutSession,
  type InsertWorkoutSet,
  type WorkoutSet,
  type Exercise,
  type WorkoutProgram,
  type InsertRecipe,
  type Recipe,
  type InsertMealEntry,
  type MealEntry,
  type InsertProgressPhoto,
  type ProgressPhoto,
  type InsertPersonalRecord,
  type PersonalRecord,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, gte, lte, sql } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Workout operations
  createWorkoutSession(session: InsertWorkoutSession): Promise<WorkoutSession>;
  getWorkoutSessions(userId: string, limit?: number): Promise<WorkoutSession[]>;
  getWorkoutSession(id: string): Promise<WorkoutSession | undefined>;
  updateWorkoutSession(id: string, updates: Partial<InsertWorkoutSession>): Promise<WorkoutSession>;
  
  // Workout sets operations
  createWorkoutSet(set: InsertWorkoutSet): Promise<WorkoutSet>;
  getWorkoutSets(sessionId: string): Promise<WorkoutSet[]>;
  updateWorkoutSet(id: string, updates: Partial<InsertWorkoutSet>): Promise<WorkoutSet>;
  
  // Exercise operations
  getExercises(): Promise<Exercise[]>;
  getExercise(id: string): Promise<Exercise | undefined>;
  
  // Workout program operations
  getWorkoutPrograms(): Promise<WorkoutProgram[]>;
  getWorkoutProgram(id: string): Promise<WorkoutProgram | undefined>;
  
  // Recipe operations
  getRecipes(limit?: number): Promise<Recipe[]>;
  getRecipe(id: string): Promise<Recipe | undefined>;
  
  // Meal tracking operations
  createMealEntry(entry: InsertMealEntry): Promise<MealEntry>;
  getMealEntries(userId: string, date: Date): Promise<MealEntry[]>;
  getMealEntriesRange(userId: string, startDate: Date, endDate: Date): Promise<MealEntry[]>;
  
  // Progress tracking operations
  createProgressPhoto(photo: InsertProgressPhoto): Promise<ProgressPhoto>;
  getProgressPhotos(userId: string, limit?: number): Promise<ProgressPhoto[]>;
  
  // Personal records operations
  createPersonalRecord(record: InsertPersonalRecord): Promise<PersonalRecord>;
  getPersonalRecords(userId: string, exerciseId?: string): Promise<PersonalRecord[]>;
  
  // Analytics operations
  getWeeklyVolume(userId: string, weekStart: Date): Promise<number>;
  getWorkoutStreak(userId: string): Promise<number>;
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

  // Workout operations
  async createWorkoutSession(session: InsertWorkoutSession): Promise<WorkoutSession> {
    const [workoutSession] = await db
      .insert(workoutSessions)
      .values(session)
      .returning();
    return workoutSession;
  }

  async getWorkoutSessions(userId: string, limit = 20): Promise<WorkoutSession[]> {
    return await db
      .select()
      .from(workoutSessions)
      .where(eq(workoutSessions.userId, userId))
      .orderBy(desc(workoutSessions.date))
      .limit(limit);
  }

  async getWorkoutSession(id: string): Promise<WorkoutSession | undefined> {
    const [session] = await db
      .select()
      .from(workoutSessions)
      .where(eq(workoutSessions.id, id));
    return session;
  }

  async updateWorkoutSession(id: string, updates: Partial<InsertWorkoutSession>): Promise<WorkoutSession> {
    const [session] = await db
      .update(workoutSessions)
      .set(updates)
      .where(eq(workoutSessions.id, id))
      .returning();
    return session;
  }

  // Workout sets operations
  async createWorkoutSet(set: InsertWorkoutSet): Promise<WorkoutSet> {
    const [workoutSet] = await db
      .insert(workoutSets)
      .values(set)
      .returning();
    return workoutSet;
  }

  async getWorkoutSets(sessionId: string): Promise<WorkoutSet[]> {
    return await db
      .select()
      .from(workoutSets)
      .where(eq(workoutSets.sessionId, sessionId))
      .orderBy(workoutSets.setNumber);
  }

  async updateWorkoutSet(id: string, updates: Partial<InsertWorkoutSet>): Promise<WorkoutSet> {
    const [set] = await db
      .update(workoutSets)
      .set(updates)
      .where(eq(workoutSets.id, id))
      .returning();
    return set;
  }

  // Exercise operations
  async getExercises(): Promise<Exercise[]> {
    return await db.select().from(exercises);
  }

  async getExercise(id: string): Promise<Exercise | undefined> {
    const [exercise] = await db
      .select()
      .from(exercises)
      .where(eq(exercises.id, id));
    return exercise;
  }

  // Workout program operations
  async getWorkoutPrograms(): Promise<WorkoutProgram[]> {
    return await db
      .select()
      .from(workoutPrograms)
      .where(eq(workoutPrograms.isActive, true));
  }

  async getWorkoutProgram(id: string): Promise<WorkoutProgram | undefined> {
    const [program] = await db
      .select()
      .from(workoutPrograms)
      .where(eq(workoutPrograms.id, id));
    return program;
  }

  // Recipe operations
  async getRecipes(limit = 50): Promise<Recipe[]> {
    return await db
      .select()
      .from(recipes)
      .where(eq(recipes.isActive, true))
      .limit(limit);
  }

  async getRecipe(id: string): Promise<Recipe | undefined> {
    const [recipe] = await db
      .select()
      .from(recipes)
      .where(eq(recipes.id, id));
    return recipe;
  }

  // Meal tracking operations
  async createMealEntry(entry: InsertMealEntry): Promise<MealEntry> {
    const [mealEntry] = await db
      .insert(mealEntries)
      .values(entry)
      .returning();
    return mealEntry;
  }

  async getMealEntries(userId: string, date: Date): Promise<MealEntry[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return await db
      .select()
      .from(mealEntries)
      .where(
        and(
          eq(mealEntries.userId, userId),
          gte(mealEntries.date, startOfDay),
          lte(mealEntries.date, endOfDay)
        )
      )
      .orderBy(mealEntries.date);
  }

  async getMealEntriesRange(userId: string, startDate: Date, endDate: Date): Promise<MealEntry[]> {
    return await db
      .select()
      .from(mealEntries)
      .where(
        and(
          eq(mealEntries.userId, userId),
          gte(mealEntries.date, startDate),
          lte(mealEntries.date, endDate)
        )
      )
      .orderBy(mealEntries.date);
  }

  // Progress tracking operations
  async createProgressPhoto(photo: InsertProgressPhoto): Promise<ProgressPhoto> {
    const [progressPhoto] = await db
      .insert(progressPhotos)
      .values(photo)
      .returning();
    return progressPhoto;
  }

  async getProgressPhotos(userId: string, limit = 20): Promise<ProgressPhoto[]> {
    return await db
      .select()
      .from(progressPhotos)
      .where(eq(progressPhotos.userId, userId))
      .orderBy(desc(progressPhotos.date))
      .limit(limit);
  }

  // Personal records operations
  async createPersonalRecord(record: InsertPersonalRecord): Promise<PersonalRecord> {
    const [personalRecord] = await db
      .insert(personalRecords)
      .values(record)
      .returning();
    return personalRecord;
  }

  async getPersonalRecords(userId: string, exerciseId?: string): Promise<PersonalRecord[]> {
    const conditions = [eq(personalRecords.userId, userId)];
    if (exerciseId) {
      conditions.push(eq(personalRecords.exerciseId, exerciseId));
    }

    return await db
      .select()
      .from(personalRecords)
      .where(and(...conditions))
      .orderBy(desc(personalRecords.date));
  }

  // Analytics operations
  async getWeeklyVolume(userId: string, weekStart: Date): Promise<number> {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const result = await db
      .select({
        totalVolume: sql<number>`COALESCE(SUM(${workoutSets.weight} * ${workoutSets.reps}), 0)`,
      })
      .from(workoutSets)
      .leftJoin(workoutSessions, eq(workoutSets.sessionId, workoutSessions.id))
      .where(
        and(
          eq(workoutSessions.userId, userId),
          gte(workoutSessions.date, weekStart),
          lte(workoutSessions.date, weekEnd),
          eq(workoutSets.completed, true)
        )
      );

    return result[0]?.totalVolume || 0;
  }

  async getWorkoutStreak(userId: string): Promise<number> {
    const sessions = await db
      .select({ date: workoutSessions.date })
      .from(workoutSessions)
      .where(
        and(
          eq(workoutSessions.userId, userId),
          eq(workoutSessions.completed, true)
        )
      )
      .orderBy(desc(workoutSessions.date));

    if (sessions.length === 0) return 0;

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (const session of sessions) {
      const sessionDate = new Date(session.date);
      sessionDate.setHours(0, 0, 0, 0);
      
      const daysDiff = Math.floor((currentDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === streak || (streak === 0 && daysDiff <= 1)) {
        streak++;
        currentDate = sessionDate;
      } else {
        break;
      }
    }

    return streak;
  }
}

export const storage = new DatabaseStorage();
