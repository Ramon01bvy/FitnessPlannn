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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  TrendingUp, 
  Camera, 
  Trophy,
  Calendar,
  Upload,
  Plus,
  Scale,
  Target,
  BarChart3,
  Zap
} from "lucide-react";

export default function Progress() {
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showPhotoForm, setShowPhotoForm] = useState(false);
  const [photoFormData, setPhotoFormData] = useState({
    weight: "",
    bodyFat: "",
    notes: "",
    imageUrl: "",
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

  const { data: progressPhotos, isLoading: photosLoading } = useQuery({
    queryKey: ["/api/progress/photos"],
    retry: false,
    enabled: isAuthenticated,
  });

  const { data: personalRecords, isLoading: recordsLoading } = useQuery({
    queryKey: ["/api/progress/records"],
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

  const addPhotoMutation = useMutation({
    mutationFn: async (photoData: any) => {
      await apiRequest("POST", "/api/progress/photos", photoData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/progress/photos"] });
      setShowPhotoForm(false);
      setPhotoFormData({ weight: "", bodyFat: "", notes: "", imageUrl: "" });
      toast({
        title: "Success",
        description: "Voortgangsfoto toegevoegd!",
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
        description: "Kon voortgangsfoto niet toevoegen.",
        variant: "destructive",
      });
    },
  });

  const handlePhotoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const photoData = {
      date: new Date().toISOString(),
      weight: photoFormData.weight ? parseFloat(photoFormData.weight) : undefined,
      bodyFat: photoFormData.bodyFat ? parseFloat(photoFormData.bodyFat) : undefined,
      notes: photoFormData.notes || undefined,
      imageUrl: photoFormData.imageUrl || `https://via.placeholder.com/400x600/333/gold?text=Progress+Photo`,
    };
    
    addPhotoMutation.mutate(photoData);
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-gold-400 text-xl">Loading...</div>
      </div>
    );
  }

  // Calculate progress metrics
  const latestPhoto = progressPhotos?.[0];
  const oldestPhoto = progressPhotos?.[progressPhotos.length - 1];
  const weightChange = latestPhoto?.weight && oldestPhoto?.weight ? 
    latestPhoto.weight - oldestPhoto.weight : 0;

  return (
    <div className="min-h-screen bg-black text-gold-400 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-gold-400" data-testid="progress-title">
              Voortgang & Analytics
            </h1>
            <p className="text-gold-200 mt-2" data-testid="progress-subtitle">
              Volg je transformatie en prestaties
            </p>
          </div>
          <Button 
            className="bg-gold-500 text-black hover:bg-gold-400"
            onClick={() => setShowPhotoForm(true)}
            data-testid="button-add-photo"
          >
            <Camera className="mr-2 h-4 w-4" />
            Voeg Foto Toe
          </Button>
        </div>

        {/* Progress Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-card border-gold-500/30" data-testid="stat-streak">
            <CardHeader className="pb-2">
              <div className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-gold-500" />
                <CardTitle className="text-gold-400 text-sm font-medium">Workout Streak</CardTitle>
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
                <BarChart3 className="h-5 w-5 text-gold-500" />
                <CardTitle className="text-gold-400 text-sm font-medium">Week Volume</CardTitle>
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

          <Card className="bg-card border-gold-500/30" data-testid="stat-weight">
            <CardHeader className="pb-2">
              <div className="flex items-center space-x-2">
                <Scale className="h-5 w-5 text-gold-500" />
                <CardTitle className="text-gold-400 text-sm font-medium">Gewicht</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white" data-testid="weight-value">
                {latestPhoto?.weight ? `${latestPhoto.weight} kg` : "Niet gelogd"}
              </div>
              {weightChange !== 0 && (
                <p className={`text-xs mt-1 ${weightChange > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {weightChange > 0 ? '+' : ''}{weightChange.toFixed(1)} kg
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card border-gold-500/30" data-testid="stat-records">
            <CardHeader className="pb-2">
              <div className="flex items-center space-x-2">
                <Trophy className="h-5 w-5 text-gold-500" />
                <CardTitle className="text-gold-400 text-sm font-medium">PR's</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white" data-testid="records-value">
                {personalRecords?.length || 0}
              </div>
              <p className="text-xs text-gold-300 mt-1">Personal records</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="photos" className="space-y-6">
          <TabsList className="bg-card border border-gold-500/30">
            <TabsTrigger 
              value="photos" 
              className="data-[state=active]:bg-gold-500 data-[state=active]:text-black"
              data-testid="tab-photos"
            >
              Foto's
            </TabsTrigger>
            <TabsTrigger 
              value="records" 
              className="data-[state=active]:bg-gold-500 data-[state=active]:text-black"
              data-testid="tab-records"
            >
              Personal Records
            </TabsTrigger>
            <TabsTrigger 
              value="analytics" 
              className="data-[state=active]:bg-gold-500 data-[state=active]:text-black"
              data-testid="tab-analytics"
            >
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Photos Tab */}
          <TabsContent value="photos" className="space-y-6">
            {/* Add Photo Form */}
            {showPhotoForm && (
              <Card className="bg-card border-gold-500/30" data-testid="photo-form">
                <CardHeader>
                  <CardTitle className="text-gold-400">Voeg Voortgangsfoto Toe</CardTitle>
                  <CardDescription className="text-gold-300">
                    Log je voortgang met een foto en metingen
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePhotoSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="weight" className="text-gold-400">Gewicht (kg)</Label>
                        <Input
                          id="weight"
                          type="number"
                          step="0.1"
                          placeholder="75.5"
                          value={photoFormData.weight}
                          onChange={(e) => setPhotoFormData(prev => ({ ...prev, weight: e.target.value }))}
                          className="bg-card border-gold-500/50 text-gold-400"
                          data-testid="input-weight"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bodyFat" className="text-gold-400">Vetpercentage (%)</Label>
                        <Input
                          id="bodyFat"
                          type="number"
                          step="0.1"
                          placeholder="15.5"
                          value={photoFormData.bodyFat}
                          onChange={(e) => setPhotoFormData(prev => ({ ...prev, bodyFat: e.target.value }))}
                          className="bg-card border-gold-500/50 text-gold-400"
                          data-testid="input-body-fat"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="imageUrl" className="text-gold-400">Foto URL</Label>
                      <Input
                        id="imageUrl"
                        type="url"
                        placeholder="https://example.com/photo.jpg"
                        value={photoFormData.imageUrl}
                        onChange={(e) => setPhotoFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                        className="bg-card border-gold-500/50 text-gold-400"
                        data-testid="input-image-url"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="notes" className="text-gold-400">Notities</Label>
                      <Textarea
                        id="notes"
                        placeholder="Hoe voel je je vandaag? Wat zijn je doelen?"
                        value={photoFormData.notes}
                        onChange={(e) => setPhotoFormData(prev => ({ ...prev, notes: e.target.value }))}
                        className="bg-card border-gold-500/50 text-gold-400"
                        data-testid="input-notes"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        type="submit" 
                        className="bg-gold-500 text-black hover:bg-gold-400"
                        disabled={addPhotoMutation.isPending}
                        data-testid="button-save-photo"
                      >
                        {addPhotoMutation.isPending ? "Opslaan..." : "Opslaan"}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline"
                        className="border-gold-500/50 text-gold-400 hover:bg-gold-500/10"
                        onClick={() => setShowPhotoForm(false)}
                        data-testid="button-cancel-photo"
                      >
                        Annuleren
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Photos Grid */}
            {photosLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="bg-card border-gold-500/30">
                    <Skeleton className="h-64 w-full bg-gold-500/20" />
                    <CardContent className="p-4">
                      <Skeleton className="h-4 w-3/4 bg-gold-500/20 mb-2" />
                      <Skeleton className="h-4 w-1/2 bg-gold-500/20" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : progressPhotos?.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {progressPhotos.map((photo: any) => (
                  <Card 
                    key={photo.id} 
                    className="bg-card border-gold-500/30 overflow-hidden"
                    data-testid={`photo-${photo.id}`}
                  >
                    <div className="aspect-[3/4] bg-gray-900">
                      <img
                        src={photo.imageUrl}
                        alt="Progress photo"
                        className="w-full h-full object-cover"
                        data-testid={`photo-image-${photo.id}`}
                      />
                    </div>
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-gold-400 font-medium" data-testid={`photo-date-${photo.id}`}>
                            {new Date(photo.date).toLocaleDateString('nl-NL')}
                          </span>
                          <Badge variant="outline" className="border-gold-500/50 text-gold-400">
                            <Calendar className="h-3 w-3 mr-1" />
                            {Math.abs(Math.floor((new Date().getTime() - new Date(photo.date).getTime()) / (1000 * 60 * 60 * 24)))} dagen geleden
                          </Badge>
                        </div>
                        
                        {(photo.weight || photo.bodyFat) && (
                          <div className="flex gap-4 text-sm">
                            {photo.weight && (
                              <div className="text-gold-300" data-testid={`photo-weight-${photo.id}`}>
                                <Scale className="h-3 w-3 inline mr-1" />
                                {photo.weight} kg
                              </div>
                            )}
                            {photo.bodyFat && (
                              <div className="text-gold-300" data-testid={`photo-body-fat-${photo.id}`}>
                                <Target className="h-3 w-3 inline mr-1" />
                                {photo.bodyFat}%
                              </div>
                            )}
                          </div>
                        )}
                        
                        {photo.notes && (
                          <p className="text-gold-300 text-sm" data-testid={`photo-notes-${photo.id}`}>
                            {photo.notes}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-card border-gold-500/30" data-testid="no-photos">
                <CardContent className="text-center py-12">
                  <Camera className="h-16 w-16 mx-auto mb-4 text-gold-500 opacity-50" />
                  <h3 className="text-xl font-semibold text-gold-400 mb-2">
                    Nog geen voortgangsfoto's
                  </h3>
                  <p className="text-gold-300 mb-6">
                    Begin met het documenteren van je transformatie door je eerste foto toe te voegen.
                  </p>
                  <Button 
                    className="bg-gold-500 text-black hover:bg-gold-400"
                    onClick={() => setShowPhotoForm(true)}
                    data-testid="button-first-photo"
                  >
                    <Camera className="mr-2 h-4 w-4" />
                    Voeg Eerste Foto Toe
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Records Tab */}
          <TabsContent value="records" className="space-y-6">
            {recordsLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
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
            ) : personalRecords?.length > 0 ? (
              <div className="space-y-4">
                {personalRecords.map((record: any) => (
                  <Card 
                    key={record.id} 
                    className="bg-card border-gold-500/30"
                    data-testid={`record-${record.id}`}
                  >
                    <CardContent className="p-6">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-lg font-semibold text-gold-400" data-testid={`record-exercise-${record.id}`}>
                            {record.exercise?.name || "Onbekende oefening"}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gold-300 mt-1">
                            <span data-testid={`record-weight-${record.id}`}>
                              {record.weight} kg
                            </span>
                            <span data-testid={`record-reps-${record.id}`}>
                              {record.reps} reps
                            </span>
                            <span data-testid={`record-date-${record.id}`}>
                              {new Date(record.date).toLocaleDateString('nl-NL')}
                            </span>
                          </div>
                        </div>
                        <Trophy className="h-6 w-6 text-gold-500" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-card border-gold-500/30" data-testid="no-records">
                <CardContent className="text-center py-12">
                  <Trophy className="h-16 w-16 mx-auto mb-4 text-gold-500 opacity-50" />
                  <h3 className="text-xl font-semibold text-gold-400 mb-2">
                    Nog geen personal records
                  </h3>
                  <p className="text-gold-300 mb-6">
                    Personal records worden automatisch geregistreerd wanneer je je workouts logt.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Volume Chart */}
              <Card className="bg-card border-gold-500/30" data-testid="volume-chart">
                <CardHeader>
                  <CardTitle className="text-gold-400 flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Volume Trend
                  </CardTitle>
                  <CardDescription className="text-gold-300">
                    Je week overzicht van trainingsvolume
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-gradient-to-t from-gold-900/20 via-gold-600/10 to-transparent rounded-xl flex items-end justify-around p-4">
                    {/* Mock chart bars - in production this would be real data */}
                    <div className="bg-gradient-to-t from-gold-600 to-gold-400 w-8 h-16 rounded-t-lg" data-testid="volume-bar-0"></div>
                    <div className="bg-gradient-to-t from-gold-600 to-gold-400 w-8 h-24 rounded-t-lg" data-testid="volume-bar-1"></div>
                    <div className="bg-gradient-to-t from-gold-600 to-gold-400 w-8 h-20 rounded-t-lg" data-testid="volume-bar-2"></div>
                    <div className="bg-gradient-to-t from-gold-600 to-gold-400 w-8 h-32 rounded-t-lg" data-testid="volume-bar-3"></div>
                    <div className="bg-gradient-to-t from-gold-600 to-gold-400 w-8 h-28 rounded-t-lg" data-testid="volume-bar-4"></div>
                    <div className="bg-gradient-to-t from-gold-600 to-gold-400 w-8 h-36 rounded-t-lg" data-testid="volume-bar-5"></div>
                    <div className="bg-gradient-to-t from-gold-600 to-gold-400 w-8 h-32 rounded-t-lg" data-testid="volume-bar-6"></div>
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

              {/* Progress Summary */}
              <Card className="bg-card border-gold-500/30" data-testid="progress-summary">
                <CardHeader>
                  <CardTitle className="text-gold-400 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Voortgang Samenvatting
                  </CardTitle>
                  <CardDescription className="text-gold-300">
                    Jouw transformatie in cijfers
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gold-300">Foto's gelogd</span>
                      <span className="text-white font-semibold" data-testid="summary-photos">
                        {progressPhotos?.length || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gold-300">Personal Records</span>
                      <span className="text-white font-semibold" data-testid="summary-records">
                        {personalRecords?.length || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gold-300">Workout Streak</span>
                      <span className="text-white font-semibold" data-testid="summary-streak">
                        {streakData?.streak || 0} dagen
                      </span>
                    </div>
                    {weightChange !== 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-gold-300">Gewichtsverandering</span>
                        <span className={`font-semibold ${weightChange > 0 ? 'text-green-400' : 'text-red-400'}`} data-testid="summary-weight-change">
                          {weightChange > 0 ? '+' : ''}{weightChange.toFixed(1)} kg
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="pt-4 border-t border-gold-500/30">
                    <p className="text-gold-300 text-sm">
                      Je bent al {streakData?.streak || 0} dagen bezig met je fitness journey. Blijf doorgaan!
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
