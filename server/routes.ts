import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  insertWorkoutSessionSchema,
  insertWorkoutSetSchema,
  insertMealEntrySchema,
  insertProgressPhotoSchema,
  insertPersonalRecordSchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Mollie payment routes
  app.post('/api/create-mollie-payment', isAuthenticated, async (req: any, res) => {
    try {
      const { plan } = req.body;
      const userId = req.user.claims.sub;
      
      // TODO: Integrate with actual Mollie API
      // For now, simulate successful payment URL generation
      const mollieApiKey = process.env.MOLLIE_API_KEY || "test_mollie_key";
      
      let amount: string;
      let description: string;
      
      switch (plan) {
        case 'Pro':
          amount = '14.99';
          description = 'Marcodonato Pro - Maandelijkse toegang';
          break;
        case 'Jaar':
          amount = '119.00';
          description = 'Marcodonato Jaar - Jaarlijkse toegang';
          break;
        default:
          return res.status(400).json({ message: 'Invalid plan selected' });
      }

      // In production, create actual Mollie payment here
      const mockPaymentUrl = `https://checkout.mollie.com/select-method/mock-${Date.now()}`;
      
      res.json({ url: mockPaymentUrl });
    } catch (error) {
      console.error("Mollie payment error:", error);
      res.status(500).json({ message: "Payment creation failed" });
    }
  });

  // Workout routes
  app.get('/api/workouts/programs', isAuthenticated, async (req, res) => {
    try {
      const programs = await storage.getWorkoutPrograms();
      res.json(programs);
    } catch (error) {
      console.error("Error fetching workout programs:", error);
      res.status(500).json({ message: "Failed to fetch workout programs" });
    }
  });

  app.get('/api/workouts/sessions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const sessions = await storage.getWorkoutSessions(userId);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching workout sessions:", error);
      res.status(500).json({ message: "Failed to fetch workout sessions" });
    }
  });

  app.post('/api/workouts/sessions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const sessionData = insertWorkoutSessionSchema.parse({
        ...req.body,
        userId,
      });
      
      const session = await storage.createWorkoutSession(sessionData);
      res.json(session);
    } catch (error) {
      console.error("Error creating workout session:", error);
      res.status(500).json({ message: "Failed to create workout session" });
    }
  });

  app.get('/api/workouts/sessions/:id/sets', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const sets = await storage.getWorkoutSets(id);
      res.json(sets);
    } catch (error) {
      console.error("Error fetching workout sets:", error);
      res.status(500).json({ message: "Failed to fetch workout sets" });
    }
  });

  app.post('/api/workouts/sets', isAuthenticated, async (req, res) => {
    try {
      const setData = insertWorkoutSetSchema.parse(req.body);
      const set = await storage.createWorkoutSet(setData);
      res.json(set);
    } catch (error) {
      console.error("Error creating workout set:", error);
      res.status(500).json({ message: "Failed to create workout set" });
    }
  });

  app.get('/api/exercises', isAuthenticated, async (req, res) => {
    try {
      const exercises = await storage.getExercises();
      res.json(exercises);
    } catch (error) {
      console.error("Error fetching exercises:", error);
      res.status(500).json({ message: "Failed to fetch exercises" });
    }
  });

  // Nutrition routes
  app.get('/api/nutrition/recipes', isAuthenticated, async (req, res) => {
    try {
      const recipes = await storage.getRecipes();
      res.json(recipes);
    } catch (error) {
      console.error("Error fetching recipes:", error);
      res.status(500).json({ message: "Failed to fetch recipes" });
    }
  });

  app.get('/api/nutrition/meals', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { date } = req.query;
      
      const targetDate = date ? new Date(date as string) : new Date();
      const meals = await storage.getMealEntries(userId, targetDate);
      res.json(meals);
    } catch (error) {
      console.error("Error fetching meal entries:", error);
      res.status(500).json({ message: "Failed to fetch meal entries" });
    }
  });

  app.post('/api/nutrition/meals', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const mealData = insertMealEntrySchema.parse({
        ...req.body,
        userId,
      });
      
      const meal = await storage.createMealEntry(mealData);
      res.json(meal);
    } catch (error) {
      console.error("Error creating meal entry:", error);
      res.status(500).json({ message: "Failed to create meal entry" });
    }
  });

  // Progress routes
  app.get('/api/progress/photos', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const photos = await storage.getProgressPhotos(userId);
      res.json(photos);
    } catch (error) {
      console.error("Error fetching progress photos:", error);
      res.status(500).json({ message: "Failed to fetch progress photos" });
    }
  });

  app.post('/api/progress/photos', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const photoData = insertProgressPhotoSchema.parse({
        ...req.body,
        userId,
      });
      
      const photo = await storage.createProgressPhoto(photoData);
      res.json(photo);
    } catch (error) {
      console.error("Error creating progress photo:", error);
      res.status(500).json({ message: "Failed to create progress photo" });
    }
  });

  app.get('/api/progress/records', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { exerciseId } = req.query;
      
      const records = await storage.getPersonalRecords(userId, exerciseId as string);
      res.json(records);
    } catch (error) {
      console.error("Error fetching personal records:", error);
      res.status(500).json({ message: "Failed to fetch personal records" });
    }
  });

  app.post('/api/progress/records', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const recordData = insertPersonalRecordSchema.parse({
        ...req.body,
        userId,
      });
      
      const record = await storage.createPersonalRecord(recordData);
      res.json(record);
    } catch (error) {
      console.error("Error creating personal record:", error);
      res.status(500).json({ message: "Failed to create personal record" });
    }
  });

  // Analytics routes
  app.get('/api/analytics/volume', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { weekStart } = req.query;
      
      const startDate = weekStart ? new Date(weekStart as string) : new Date();
      const volume = await storage.getWeeklyVolume(userId, startDate);
      res.json({ volume });
    } catch (error) {
      console.error("Error fetching weekly volume:", error);
      res.status(500).json({ message: "Failed to fetch weekly volume" });
    }
  });

  app.get('/api/analytics/streak', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const streak = await storage.getWorkoutStreak(userId);
      res.json({ streak });
    } catch (error) {
      console.error("Error fetching workout streak:", error);
      res.status(500).json({ message: "Failed to fetch workout streak" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
