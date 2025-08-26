import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Activity, 
  Flame, 
  Trophy, 
  Apple, 
  TrendingUp,
  Play,
  BarChart3
} from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [upgradingPlan, setUpgradingPlan] = useState<string | null>(null);

  const handleUpgrade = async (plan: string) => {
    try {
      setUpgradingPlan(plan);

      // For Start plan, just show success message (free trial)
      if (plan === "Start") {
        toast({
          title: "Proefperiode gestart!",
          description: "Je hebt nu toegang tot alle Start functies voor 7 dagen.",
        });
        // Refresh user data to show new subscription tier
        window.location.reload();
        return;
      }

      const res = await fetch("/api/create-mollie-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });

      if (res.status === 401) {
        toast({
          title: "Niet geautoriseerd",
          description: "Je sessie is verlopen. Log opnieuw in.",
          variant: "destructive",
        });
        return;
      }

      const data = await res.json();

      if (data?.url) {
        window.location.href = data.url;
      } else {
        console.error("Payment error:", data);
        toast({
          title: "Betalingsfout",
          description: data.message || "Kon geen betaal-URL ophalen. Probeer het opnieuw.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Mollie payment error", err);
      toast({
        title: "Fout",
        description: "Er ging iets mis met de betaling. Probeer het later opnieuw.",
        variant: "destructive",
      });
    } finally {
      setUpgradingPlan(null);
    }
  };

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

  const { data: workoutSessions, isLoading: sessionsLoading } = useQuery({
    queryKey: ["/api/workouts/sessions"],
    retry: false,
    enabled: isAuthenticated,
  });

  const { data: streakData, isLoading: streakLoading } = useQuery({
    queryKey: ["/api/analytics/streak"],
    retry: false,
    enabled: isAuthenticated,
  });

  const { data: volumeData, isLoading: volumeLoading } = useQuery({
    queryKey: ["/api/analytics/volume"],
    retry: false,
    enabled: isAuthenticated,
  });

  const { data: mealEntries, isLoading: mealsLoading } = useQuery({
    queryKey: ["/api/nutrition/meals"],
    retry: false,
    enabled: isAuthenticated,
  });

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-gold-400 text-xl">Loading...</div>
      </div>
    );
  }

  const todaysCalories = mealEntries?.reduce((total: number, meal: any) => total + (meal.calories || 0), 0) || 0;

  return (
    <div className="min-h-screen bg-black text-gold-400 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-gold-400" data-testid="welcome-title">
              Welkom terug, {user?.firstName || user?.email?.split('@')[0] || 'Gebruiker'}
            </h1>
            <p className="text-gold-200 mt-2" data-testid="welcome-subtitle">
              Klaar voor je volgende training? Laten we gaan!
            </p>
          </div>
          <div className="flex space-x-4">
            <Button 
              className="bg-gold-500 text-black hover:bg-gold-400"
              asChild
              data-testid="button-start-workout"
            >
              <Link href="/workouts">
                <Play className="mr-2 h-4 w-4" />
                Start Workout
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-card border-gold-500/30" data-testid="stat-streak">
            <CardHeader className="pb-2">
              <div className="flex items-center space-x-2">
                <Flame className="h-5 w-5 text-gold-500" />
                <CardTitle className="text-gold-400 text-sm font-medium">Streak</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {streakLoading ? (
                <Skeleton className="h-8 w-20 bg-gold-500/20" />
              ) : (
                <div className="text-2xl font-bold text-white" data-testid="streak-value">
                  {streakData?.streak || 0} dagen
                </div>
              )}
              <p className="text-xs text-gold-300 mt-1">Blijf consistent!</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-gold-500/30" data-testid="stat-volume">
            <CardHeader className="pb-2">
              <div className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-gold-500" />
                <CardTitle className="text-gold-400 text-sm font-medium">Volume</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {volumeLoading ? (
                <Skeleton className="h-8 w-20 bg-gold-500/20" />
              ) : (
                <div className="text-2xl font-bold text-white" data-testid="volume-value">
                  {((volumeData?.volume || 0) / 1000).toFixed(1)} ton
                </div>
              )}
              <p className="text-xs text-gold-300 mt-1">Deze week</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-gold-500/30" data-testid="stat-sessions">
            <CardHeader className="pb-2">
              <div className="flex items-center space-x-2">
                <Trophy className="h-5 w-5 text-gold-500" />
                <CardTitle className="text-gold-400 text-sm font-medium">Sessies</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {sessionsLoading ? (
                <Skeleton className="h-8 w-20 bg-gold-500/20" />
              ) : (
                <div className="text-2xl font-bold text-white" data-testid="sessions-value">
                  {workoutSessions?.length || 0}
                </div>
              )}
              <p className="text-xs text-gold-300 mt-1">Totaal</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-gold-500/30" data-testid="stat-calories">
            <CardHeader className="pb-2">
              <div className="flex items-center space-x-2">
                <Apple className="h-5 w-5 text-gold-500" />
                <CardTitle className="text-gold-400 text-sm font-medium">Calorieën</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {mealsLoading ? (
                <Skeleton className="h-8 w-20 bg-gold-500/20" />
              ) : (
                <div className="text-2xl font-bold text-white" data-testid="calories-value">
                  {Math.round(todaysCalories)}
                </div>
              )}
              <p className="text-xs text-gold-300 mt-1">Vandaag</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Workouts */}
          <Card className="bg-card border-gold-500/30" data-testid="recent-workouts">
            <CardHeader>
              <CardTitle className="text-gold-400 flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recente Workouts
              </CardTitle>
              <CardDescription className="text-gold-300">
                Je laatste trainingen
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {sessionsLoading ? (
                <>
                  <Skeleton className="h-12 w-full bg-gold-500/20" />
                  <Skeleton className="h-12 w-full bg-gold-500/20" />
                  <Skeleton className="h-12 w-full bg-gold-500/20" />
                </>
              ) : workoutSessions?.length > 0 ? (
                workoutSessions.slice(0, 3).map((session: any) => (
                  <div 
                    key={session.id} 
                    className="flex justify-between items-center py-3 border-b border-gold-500/20 last:border-b-0"
                    data-testid={`workout-${session.id}`}
                  >
                    <div>
                      <div className="text-white font-medium" data-testid={`workout-name-${session.id}`}>
                        {session.name}
                      </div>
                      <div className="text-gold-300 text-sm" data-testid={`workout-date-${session.id}`}>
                        {new Date(session.date).toLocaleDateString('nl-NL')}
                      </div>
                    </div>
                    <div className="text-gold-500">
                      {session.completed ? (
                        <Trophy className="h-5 w-5" />
                      ) : (
                        <Play className="h-5 w-5" />
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gold-300" data-testid="no-workouts">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nog geen workouts gelogd</p>
                  <Button 
                    className="mt-4 bg-gold-500 text-black hover:bg-gold-400"
                    asChild
                    data-testid="button-first-workout"
                  >
                    <Link href="/workouts">Start je eerste workout</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Progress Chart */}
          <Card className="bg-card border-gold-500/30" data-testid="progress-chart">
            <CardHeader>
              <CardTitle className="text-gold-400 flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Voortgang
              </CardTitle>
              <CardDescription className="text-gold-300">
                Je week overzicht
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gradient-to-t from-gold-900/20 via-gold-600/10 to-transparent rounded-xl flex items-end justify-around p-4">
                {/* Mock chart bars - in production this would be real data */}
                <div className="bg-gradient-to-t from-gold-600 to-gold-400 w-8 h-16 rounded-t-lg" data-testid="chart-bar-0"></div>
                <div className="bg-gradient-to-t from-gold-600 to-gold-400 w-8 h-24 rounded-t-lg" data-testid="chart-bar-1"></div>
                <div className="bg-gradient-to-t from-gold-600 to-gold-400 w-8 h-20 rounded-t-lg" data-testid="chart-bar-2"></div>
                <div className="bg-gradient-to-t from-gold-600 to-gold-400 w-8 h-32 rounded-t-lg" data-testid="chart-bar-3"></div>
                <div className="bg-gradient-to-t from-gold-600 to-gold-400 w-8 h-28 rounded-t-lg" data-testid="chart-bar-4"></div>
                <div className="bg-gradient-to-t from-gold-600 to-gold-400 w-8 h-36 rounded-t-lg" data-testid="chart-bar-5"></div>
                <div className="bg-gradient-to-t from-gold-600 to-gold-400 w-8 h-32 rounded-t-lg" data-testid="chart-bar-6"></div>
              </div>
              <div className="flex justify-between text-sm text-gold-300 mt-4">
                <span>Ma</span>
                <span>Di</span>
                <span>Wo</span>
                <span>Do</span>
                <span>Vr</span>
                <span>Za</span>
                <span>Zo</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Start Trial Section - Show if no subscription */}
        {!user?.subscriptionTier && (
          <Card className="bg-gradient-to-br from-gold-500/20 to-gold-600/10 border-2 border-gold-500/50" data-testid="start-trial">
            <CardHeader className="text-center">
              <CardTitle className="text-gold-400 text-2xl">Start je gratis proefperiode</CardTitle>
              <CardDescription className="text-gold-300">
                Probeer alle functies 7 dagen gratis, geen creditcard nodig
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="space-y-4">
                <div className="text-4xl font-bold text-white">7 dagen</div>
                <div className="text-gold-300">Volledig gratis toegang</div>
                <ul className="space-y-2 text-left max-w-md mx-auto">
                  <li className="flex items-center text-gold-200">
                    <Trophy className="h-4 w-4 mr-2 text-gold-500" />
                    Toegang tot 3 voorbeeldprogramma's
                  </li>
                  <li className="flex items-center text-gold-200">
                    <Activity className="h-4 w-4 mr-2 text-gold-500" />
                    Basistracking van workouts
                  </li>
                  <li className="flex items-center text-gold-200">
                    <Apple className="h-4 w-4 mr-2 text-gold-500" />
                    Beperkte recepten
                  </li>
                </ul>
                <Button 
                  className="w-full bg-gold-500 text-black hover:bg-gold-400 text-lg py-6"
                  onClick={() => handleUpgrade('Start')}
                  disabled={upgradingPlan === 'Start'}
                  data-testid="start-trial-button"
                >
                  {upgradingPlan === 'Start' ? 'Bezig...' : 'Start jouw gratis proefperiode'}
                </Button>
                <p className="text-xs text-gold-300">
                  Geen creditcard nodig · Annuleer wanneer je wilt
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Upgrade Plans Section */}
        {(!user?.subscriptionTier || user?.subscriptionTier === 'Start') && (
          <Card className="bg-card border-gold-500/30" data-testid="upgrade-plans">
            <CardHeader>
              <CardTitle className="text-gold-400">Upgrade je plan</CardTitle>
              <CardDescription className="text-gold-300">
                Ontgrendel alle functies met een Pro of Jaar abonnement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                {/* Start Plan */}
                <div className="bg-gradient-to-br from-gray-500/10 to-gray-600/5 border border-gray-500/30 rounded-lg p-6">
                  <div className="text-center mb-4">
                    <h3 className="text-xl font-bold text-gold-400 mb-2">Start</h3>
                    <div className="text-3xl font-bold text-white">€0</div>
                    <div className="text-gold-300 text-sm">7 dagen gratis</div>
                  </div>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center text-gold-200">
                      <Trophy className="h-4 w-4 mr-2 text-gold-500" />
                      3 voorbeeldprogramma's
                    </li>
                    <li className="flex items-center text-gold-200">
                      <Activity className="h-4 w-4 mr-2 text-gold-500" />
                      Basistracking
                    </li>
                    <li className="flex items-center text-gold-200">
                      <Apple className="h-4 w-4 mr-2 text-gold-500" />
                      Beperkte recepten
                    </li>
                  </ul>
                  <Button 
                    className="w-full bg-gray-500 text-white hover:bg-gray-400"
                    onClick={() => handleUpgrade('Start')}
                    disabled={upgradingPlan === 'Start' || user?.subscriptionTier === 'Start'}
                    data-testid="upgrade-start"
                  >
                    {user?.subscriptionTier === 'Start' ? 'Huidig plan' : upgradingPlan === 'Start' ? 'Bezig...' : 'Start gratis proefperiode'}
                  </Button>
                </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Pro Plan */}
                <div className="bg-gradient-to-br from-gold-500/10 to-gold-600/5 border border-gold-500/30 rounded-lg p-6">
                  <div className="text-center mb-4">
                    <h3 className="text-xl font-bold text-gold-400 mb-2">Pro</h3>
                    <div className="text-3xl font-bold text-white">€14,99</div>
                    <div className="text-gold-300 text-sm">per maand</div>
                  </div>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center text-gold-200">
                      <Trophy className="h-4 w-4 mr-2 text-gold-500" />
                      Alle programma's
                    </li>
                    <li className="flex items-center text-gold-200">
                      <Activity className="h-4 w-4 mr-2 text-gold-500" />
                      Slimme gewichtsadviezen
                    </li>
                    <li className="flex items-center text-gold-200">
                      <Apple className="h-4 w-4 mr-2 text-gold-500" />
                      Volledige recepten
                    </li>
                    <li className="flex items-center text-gold-200">
                      <BarChart3 className="h-4 w-4 mr-2 text-gold-500" />
                      Analytics & PR's
                    </li>
                  </ul>
                  <Button 
                    className="w-full bg-gold-500 text-black hover:bg-gold-400"
                    onClick={() => handleUpgrade('Pro')}
                    disabled={upgradingPlan === 'Pro'}
                    data-testid="upgrade-pro"
                  >
                    {upgradingPlan === 'Pro' ? 'Bezig...' : 'Upgrade naar Pro'}
                  </Button>
                </div>

                {/* Jaar Plan */}
                <div className="bg-gradient-to-br from-gold-500/20 to-gold-600/10 border-2 border-gold-500/50 rounded-lg p-6 relative">
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gold-500 text-black px-3 py-1 rounded-full text-xs font-bold">
                      BESTE DEAL
                    </span>
                  </div>
                  <div className="text-center mb-4">
                    <h3 className="text-xl font-bold text-gold-400 mb-2">Jaar</h3>
                    <div className="text-3xl font-bold text-white">€119</div>
                    <div className="text-gold-300 text-sm">per jaar</div>
                    <div className="text-xs text-gold-400 mt-1">2 maanden gratis!</div>
                  </div>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center text-gold-200">
                      <Trophy className="h-4 w-4 mr-2 text-gold-500" />
                      Alles van Pro
                    </li>
                    <li className="flex items-center text-gold-200">
                      <Activity className="h-4 w-4 mr-2 text-gold-500" />
                      2 maanden gratis
                    </li>
                    <li className="flex items-center text-gold-200">
                      <Apple className="h-4 w-4 mr-2 text-gold-500" />
                      Exclusieve challenges
                    </li>
                    <li className="flex items-center text-gold-200">
                      <BarChart3 className="h-4 w-4 mr-2 text-gold-500" />
                      Prioriteit ondersteuning
                    </li>
                  </ul>
                  <Button 
                    className="w-full bg-gold-500 text-black hover:bg-gold-400"
                    onClick={() => handleUpgrade('Jaar')}
                    disabled={upgradingPlan === 'Jaar'}
                    data-testid="upgrade-year"
                  >
                    {upgradingPlan === 'Jaar' ? 'Bezig...' : 'Upgrade naar Jaar'}
                  </Button>
                </div>
              </div>
              <p className="mt-4 text-gold-300 text-xs text-center">
                Betalingen veilig verwerkt met Mollie Payments
              </p>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Card className="bg-card border-gold-500/30" data-testid="quick-actions">
          <CardHeader>
            <CardTitle className="text-gold-400">Snelle acties</CardTitle>
            <CardDescription className="text-gold-300">
              Ga snel naar je favoriete functies
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button 
                variant="outline" 
                className="h-20 border-gold-500/50 text-gold-400 hover:bg-gold-500/10"
                asChild
                data-testid="action-workouts"
              >
                <Link href="/workouts">
                  <div className="text-center">
                    <Activity className="h-6 w-6 mx-auto mb-2" />
                    <div className="text-sm">Workouts</div>
                  </div>
                </Link>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-20 border-gold-500/50 text-gold-400 hover:bg-gold-500/10"
                asChild
                data-testid="action-nutrition"
              >
                <Link href="/nutrition">
                  <div className="text-center">
                    <Apple className="h-6 w-6 mx-auto mb-2" />
                    <div className="text-sm">Voeding</div>
                  </div>
                </Link>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-20 border-gold-500/50 text-gold-400 hover:bg-gold-500/10"
                asChild
                data-testid="action-progress"
              >
                <Link href="/progress">
                  <div className="text-center">
                    <TrendingUp className="h-6 w-6 mx-auto mb-2" />
                    <div className="text-sm">Voortgang</div>
                  </div>
                </Link>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-20 border-gold-500/50 text-gold-400 hover:bg-gold-500/10"
                data-testid="action-analytics"
              >
                <div className="text-center">
                  <BarChart3 className="h-6 w-6 mx-auto mb-2" />
                  <div className="text-sm">Analytics</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
