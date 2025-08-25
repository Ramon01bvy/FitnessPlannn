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
import { 
  Activity, 
  Play, 
  Clock, 
  CheckCircle2,
  Plus,
  Dumbbell
} from "lucide-react";

export default function Workouts() {
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  const { data: workoutPrograms, isLoading: programsLoading } = useQuery({
    queryKey: ["/api/workouts/programs"],
    retry: false,
    enabled: isAuthenticated,
  });

  const { data: workoutSessions, isLoading: sessionsLoading } = useQuery({
    queryKey: ["/api/workouts/sessions"],
    retry: false,
    enabled: isAuthenticated,
  });

  const createSessionMutation = useMutation({
    mutationFn: async (sessionData: any) => {
      await apiRequest("POST", "/api/workouts/sessions", sessionData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workouts/sessions"] });
      toast({
        title: "Success",
        description: "Workout sessie aangemaakt!",
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
        description: "Kon workout sessie niet aanmaken.",
        variant: "destructive",
      });
    },
  });

  const startWorkout = (programId?: string, programName?: string) => {
    const workoutName = programName || "Custom Workout";
    const sessionData = {
      name: workoutName,
      programId,
      date: new Date().toISOString(),
      completed: false,
    };
    
    createSessionMutation.mutate(sessionData);
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-gold-400 text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-gold-400 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-gold-400" data-testid="workouts-title">
              Workouts
            </h1>
            <p className="text-gold-200 mt-2" data-testid="workouts-subtitle">
              Kies een programma of start een custom workout
            </p>
          </div>
          <Button 
            className="bg-gold-500 text-black hover:bg-gold-400"
            onClick={() => startWorkout()}
            disabled={createSessionMutation.isPending}
            data-testid="button-custom-workout"
          >
            <Plus className="mr-2 h-4 w-4" />
            Custom Workout
          </Button>
        </div>

        <Tabs defaultValue="programs" className="space-y-6">
          <TabsList className="bg-card border border-gold-500/30">
            <TabsTrigger 
              value="programs" 
              className="data-[state=active]:bg-gold-500 data-[state=active]:text-black"
              data-testid="tab-programs"
            >
              Programma's
            </TabsTrigger>
            <TabsTrigger 
              value="history" 
              className="data-[state=active]:bg-gold-500 data-[state=active]:text-black"
              data-testid="tab-history"
            >
              Geschiedenis
            </TabsTrigger>
          </TabsList>

          {/* Programs Tab */}
          <TabsContent value="programs" className="space-y-6">
            {programsLoading ? (
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
            ) : workoutPrograms?.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {workoutPrograms.map((program: any) => (
                  <Card 
                    key={program.id} 
                    className="bg-card border-gold-500/30 hover:border-gold-400/50 transition-colors"
                    data-testid={`program-${program.id}`}
                  >
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-gold-400" data-testid={`program-name-${program.id}`}>
                          {program.name}
                        </CardTitle>
                        <Badge 
                          variant="outline" 
                          className="border-gold-500/50 text-gold-400"
                          data-testid={`program-difficulty-${program.id}`}
                        >
                          {program.difficulty}
                        </Badge>
                      </div>
                      <CardDescription className="text-gold-300" data-testid={`program-description-${program.id}`}>
                        {program.description || "Geen beschrijving beschikbaar"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between text-sm text-gold-300">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span data-testid={`program-duration-${program.id}`}>
                            {program.durationWeeks} weken
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Dumbbell className="h-4 w-4" />
                          <span data-testid={`program-type-${program.id}`}>
                            {program.type}
                          </span>
                        </div>
                      </div>
                      
                      <Button 
                        className="w-full bg-gold-500 text-black hover:bg-gold-400"
                        onClick={() => startWorkout(program.id, program.name)}
                        disabled={createSessionMutation.isPending}
                        data-testid={`button-start-${program.id}`}
                      >
                        <Play className="mr-2 h-4 w-4" />
                        Start Programma
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-card border-gold-500/30" data-testid="no-programs">
                <CardContent className="text-center py-12">
                  <Dumbbell className="h-16 w-16 mx-auto mb-4 text-gold-500 opacity-50" />
                  <h3 className="text-xl font-semibold text-gold-400 mb-2">
                    Geen programma's beschikbaar
                  </h3>
                  <p className="text-gold-300 mb-6">
                    Er zijn momenteel geen workout programma's beschikbaar. Probeer een custom workout te starten.
                  </p>
                  <Button 
                    className="bg-gold-500 text-black hover:bg-gold-400"
                    onClick={() => startWorkout()}
                    disabled={createSessionMutation.isPending}
                    data-testid="button-start-custom"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Start Custom Workout
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            {sessionsLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Card key={i} className="bg-card border-gold-500/30">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-center">
                        <div className="space-y-2">
                          <Skeleton className="h-5 w-48 bg-gold-500/20" />
                          <Skeleton className="h-4 w-32 bg-gold-500/20" />
                        </div>
                        <Skeleton className="h-8 w-8 bg-gold-500/20 rounded-full" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : workoutSessions?.length > 0 ? (
              <div className="space-y-4">
                {workoutSessions.map((session: any) => (
                  <Card 
                    key={session.id} 
                    className="bg-card border-gold-500/30"
                    data-testid={`session-${session.id}`}
                  >
                    <CardContent className="p-6">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-lg font-semibold text-gold-400" data-testid={`session-name-${session.id}`}>
                            {session.name}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gold-300 mt-1">
                            <span data-testid={`session-date-${session.id}`}>
                              {new Date(session.date).toLocaleDateString('nl-NL', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </span>
                            {session.duration && (
                              <span className="flex items-center gap-1" data-testid={`session-duration-${session.id}`}>
                                <Clock className="h-4 w-4" />
                                {session.duration} min
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          {session.completed ? (
                            <CheckCircle2 className="h-6 w-6 text-green-500" data-testid={`session-completed-${session.id}`} />
                          ) : (
                            <Clock className="h-6 w-6 text-gold-500" data-testid={`session-pending-${session.id}`} />
                          )}
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="border-gold-500/50 text-gold-400 hover:bg-gold-500/10"
                            data-testid={`button-view-${session.id}`}
                          >
                            Bekijk
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-card border-gold-500/30" data-testid="no-sessions">
                <CardContent className="text-center py-12">
                  <Activity className="h-16 w-16 mx-auto mb-4 text-gold-500 opacity-50" />
                  <h3 className="text-xl font-semibold text-gold-400 mb-2">
                    Nog geen workouts gelogd
                  </h3>
                  <p className="text-gold-300 mb-6">
                    Start je eerste workout om je voortgang te beginnen tracken.
                  </p>
                  <Button 
                    className="bg-gold-500 text-black hover:bg-gold-400"
                    onClick={() => startWorkout()}
                    disabled={createSessionMutation.isPending}
                    data-testid="button-first-workout"
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Start je eerste workout
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
