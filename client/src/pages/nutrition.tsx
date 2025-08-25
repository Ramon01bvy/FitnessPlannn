import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Utensils, 
  Plus, 
  Search,
  Apple,
  Calculator,
  ShoppingCart,
  Clock,
  Target
} from "lucide-react";

export default function Nutrition() {
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

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

  const { data: recipes, isLoading: recipesLoading } = useQuery({
    queryKey: ["/api/nutrition/recipes"],
    retry: false,
    enabled: isAuthenticated,
  });

  const { data: mealEntries, isLoading: mealsLoading } = useQuery({
    queryKey: ["/api/nutrition/meals", selectedDate],
    queryFn: async () => {
      const response = await fetch(`/api/nutrition/meals?date=${selectedDate}`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error(`${response.status}: ${response.statusText}`);
      return response.json();
    },
    retry: false,
    enabled: isAuthenticated && !!selectedDate,
  });

  const addMealMutation = useMutation({
    mutationFn: async (mealData: any) => {
      await apiRequest("POST", "/api/nutrition/meals", mealData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/nutrition/meals"] });
      toast({
        title: "Success",
        description: "Maaltijd toegevoegd!",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
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
        title: "Fout",
        description: "Kon maaltijd niet toevoegen.",
        variant: "destructive",
      });
    },
  });

  const addMeal = (recipe: any, servings: number = 1, mealType: string = "lunch") => {
    const mealData = {
      recipeId: recipe.id,
      date: new Date(selectedDate).toISOString(),
      mealType,
      servings,
      calories: (recipe.calories || 0) * servings,
      protein: (recipe.protein || 0) * servings,
      carbs: (recipe.carbs || 0) * servings,
      fat: (recipe.fat || 0) * servings,
    };
    
    addMealMutation.mutate(mealData);
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-gold-400 text-xl">Loading...</div>
      </div>
    );
  }

  // Calculate daily totals
  const dailyTotals = mealEntries?.reduce((totals: any, meal: any) => ({
    calories: totals.calories + (meal.calories || 0),
    protein: totals.protein + (meal.protein || 0),
    carbs: totals.carbs + (meal.carbs || 0),
    fat: totals.fat + (meal.fat || 0),
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 }) || { calories: 0, protein: 0, carbs: 0, fat: 0 };

  // Daily targets (these could be user-configurable)
  const dailyTargets = {
    calories: 2600,
    protein: 150,
    carbs: 300,
    fat: 85,
  };

  const filteredRecipes = recipes?.filter((recipe: any) =>
    recipe.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="min-h-screen bg-black text-gold-400 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-gold-400" data-testid="nutrition-title">
              Voeding & Recepten
            </h1>
            <p className="text-gold-200 mt-2" data-testid="nutrition-subtitle">
              Track je macro's en ontdek nieuwe recepten
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-card border-gold-500/50 text-gold-400"
              data-testid="input-date"
            />
          </div>
        </div>

        {/* Daily Overview */}
        <Card className="bg-card border-gold-500/30" data-testid="daily-overview">
          <CardHeader>
            <CardTitle className="text-gold-400 flex items-center gap-2">
              <Target className="h-5 w-5" />
              Dagelijkse Voeding
            </CardTitle>
            <CardDescription className="text-gold-300">
              {new Date(selectedDate).toLocaleDateString('nl-NL', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Calories */}
              <div className="space-y-2" data-testid="macro-calories">
                <div className="flex justify-between items-center">
                  <span className="text-gold-400 font-medium">Calorieën</span>
                  <span className="text-white font-bold" data-testid="calories-value">
                    {Math.round(dailyTotals.calories)} / {dailyTargets.calories}
                  </span>
                </div>
                <Progress 
                  value={(dailyTotals.calories / dailyTargets.calories) * 100} 
                  className="h-3"
                />
                <div className="text-xs text-gold-300">
                  {Math.round(((dailyTotals.calories / dailyTargets.calories) * 100))}% van doel
                </div>
              </div>

              {/* Protein */}
              <div className="space-y-2" data-testid="macro-protein">
                <div className="flex justify-between items-center">
                  <span className="text-gold-400 font-medium">Eiwit</span>
                  <span className="text-white font-bold" data-testid="protein-value">
                    {Math.round(dailyTotals.protein)}g / {dailyTargets.protein}g
                  </span>
                </div>
                <Progress 
                  value={(dailyTotals.protein / dailyTargets.protein) * 100} 
                  className="h-3"
                />
                <div className="text-xs text-gold-300">
                  {Math.round(((dailyTotals.protein / dailyTargets.protein) * 100))}% van doel
                </div>
              </div>

              {/* Carbs */}
              <div className="space-y-2" data-testid="macro-carbs">
                <div className="flex justify-between items-center">
                  <span className="text-gold-400 font-medium">Koolhydraten</span>
                  <span className="text-white font-bold" data-testid="carbs-value">
                    {Math.round(dailyTotals.carbs)}g / {dailyTargets.carbs}g
                  </span>
                </div>
                <Progress 
                  value={(dailyTotals.carbs / dailyTargets.carbs) * 100} 
                  className="h-3"
                />
                <div className="text-xs text-gold-300">
                  {Math.round(((dailyTotals.carbs / dailyTargets.carbs) * 100))}% van doel
                </div>
              </div>

              {/* Fat */}
              <div className="space-y-2" data-testid="macro-fat">
                <div className="flex justify-between items-center">
                  <span className="text-gold-400 font-medium">Vet</span>
                  <span className="text-white font-bold" data-testid="fat-value">
                    {Math.round(dailyTotals.fat)}g / {dailyTargets.fat}g
                  </span>
                </div>
                <Progress 
                  value={(dailyTotals.fat / dailyTargets.fat) * 100} 
                  className="h-3"
                />
                <div className="text-xs text-gold-300">
                  {Math.round(((dailyTotals.fat / dailyTargets.fat) * 100))}% van doel
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="meals" className="space-y-6">
          <TabsList className="bg-card border border-gold-500/30">
            <TabsTrigger 
              value="meals" 
              className="data-[state=active]:bg-gold-500 data-[state=active]:text-black"
              data-testid="tab-meals"
            >
              Maaltijden
            </TabsTrigger>
            <TabsTrigger 
              value="recipes" 
              className="data-[state=active]:bg-gold-500 data-[state=active]:text-black"
              data-testid="tab-recipes"
            >
              Recepten
            </TabsTrigger>
          </TabsList>

          {/* Meals Tab */}
          <TabsContent value="meals" className="space-y-6">
            {mealsLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="bg-card border-gold-500/30">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-center">
                        <div className="space-y-2">
                          <Skeleton className="h-5 w-48 bg-gold-500/20" />
                          <Skeleton className="h-4 w-32 bg-gold-500/20" />
                        </div>
                        <Skeleton className="h-8 w-16 bg-gold-500/20" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : mealEntries?.length > 0 ? (
              <div className="space-y-4">
                {mealEntries.map((meal: any) => (
                  <Card 
                    key={meal.id} 
                    className="bg-card border-gold-500/30"
                    data-testid={`meal-${meal.id}`}
                  >
                    <CardContent className="p-6">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-lg font-semibold text-gold-400" data-testid={`meal-name-${meal.id}`}>
                            {meal.recipe?.name || "Custom Entry"}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gold-300 mt-1">
                            <Badge 
                              variant="outline" 
                              className="border-gold-500/50 text-gold-400"
                              data-testid={`meal-type-${meal.id}`}
                            >
                              {meal.mealType}
                            </Badge>
                            <span data-testid={`meal-servings-${meal.id}`}>
                              {meal.servings} portie(s)
                            </span>
                            <span data-testid={`meal-calories-${meal.id}`}>
                              {Math.round(meal.calories || 0)} kcal
                            </span>
                          </div>
                          <div className="text-xs text-gold-300 mt-1" data-testid={`meal-macros-${meal.id}`}>
                            {Math.round(meal.protein || 0)}P / {Math.round(meal.carbs || 0)}C / {Math.round(meal.fat || 0)}F
                          </div>
                        </div>
                        <div className="text-gold-300 text-sm">
                          {new Date(meal.date).toLocaleTimeString('nl-NL', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-card border-gold-500/30" data-testid="no-meals">
                <CardContent className="text-center py-12">
                  <Utensils className="h-16 w-16 mx-auto mb-4 text-gold-500 opacity-50" />
                  <h3 className="text-xl font-semibold text-gold-400 mb-2">
                    Nog geen maaltijden gelogd
                  </h3>
                  <p className="text-gold-300 mb-6">
                    Voeg je eerste maaltijd toe om je voeding te beginnen tracken.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Recipes Tab */}
          <TabsContent value="recipes" className="space-y-6">
            {/* Search */}
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gold-500 h-4 w-4" />
                <Input
                  placeholder="Zoek recepten..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-card border-gold-500/50 text-gold-400"
                  data-testid="input-search-recipes"
                />
              </div>
            </div>

            {recipesLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="bg-card border-gold-500/30">
                    <CardHeader>
                      <Skeleton className="h-6 w-3/4 bg-gold-500/20" />
                      <Skeleton className="h-4 w-full bg-gold-500/20" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-20 w-full bg-gold-500/20" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredRecipes.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRecipes.map((recipe: any) => (
                  <Card 
                    key={recipe.id} 
                    className="bg-card border-gold-500/30 hover:border-gold-400/50 transition-colors"
                    data-testid={`recipe-${recipe.id}`}
                  >
                    <CardHeader>
                      <CardTitle className="text-gold-400" data-testid={`recipe-name-${recipe.id}`}>
                        {recipe.name}
                      </CardTitle>
                      <CardDescription className="text-gold-300" data-testid={`recipe-description-${recipe.id}`}>
                        {recipe.description || "Geen beschrijving beschikbaar"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="space-y-1">
                          <div className="text-gold-300">Calorieën</div>
                          <div className="text-white font-semibold" data-testid={`recipe-calories-${recipe.id}`}>
                            {Math.round(recipe.calories || 0)} kcal
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-gold-300">Porties</div>
                          <div className="text-white font-semibold" data-testid={`recipe-servings-${recipe.id}`}>
                            {recipe.servings || 1}
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="text-center p-2 bg-black/50 rounded">
                          <div className="text-gold-300">Eiwit</div>
                          <div className="text-white font-semibold" data-testid={`recipe-protein-${recipe.id}`}>
                            {Math.round(recipe.protein || 0)}g
                          </div>
                        </div>
                        <div className="text-center p-2 bg-black/50 rounded">
                          <div className="text-gold-300">Koolhydraten</div>
                          <div className="text-white font-semibold" data-testid={`recipe-carbs-${recipe.id}`}>
                            {Math.round(recipe.carbs || 0)}g
                          </div>
                        </div>
                        <div className="text-center p-2 bg-black/50 rounded">
                          <div className="text-gold-300">Vet</div>
                          <div className="text-white font-semibold" data-testid={`recipe-fat-${recipe.id}`}>
                            {Math.round(recipe.fat || 0)}g
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Select defaultValue="lunch" onValueChange={(mealType) => addMeal(recipe, 1, mealType)}>
                          <SelectTrigger className="flex-1 bg-card border-gold-500/50 text-gold-400">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="breakfast">Ontbijt</SelectItem>
                            <SelectItem value="lunch">Lunch</SelectItem>
                            <SelectItem value="dinner">Diner</SelectItem>
                            <SelectItem value="snack">Snack</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button 
                          size="sm"
                          className="bg-gold-500 text-black hover:bg-gold-400"
                          onClick={() => addMeal(recipe)}
                          disabled={addMealMutation.isPending}
                          data-testid={`button-add-${recipe.id}`}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-card border-gold-500/30" data-testid="no-recipes">
                <CardContent className="text-center py-12">
                  <Utensils className="h-16 w-16 mx-auto mb-4 text-gold-500 opacity-50" />
                  <h3 className="text-xl font-semibold text-gold-400 mb-2">
                    Geen recepten gevonden
                  </h3>
                  <p className="text-gold-300">
                    {searchTerm ? `Geen recepten gevonden voor "${searchTerm}"` : "Er zijn momenteel geen recepten beschikbaar."}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
