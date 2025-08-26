import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import Workouts from "@/pages/workouts";
import Nutrition from "@/pages/nutrition";
import Progress from "@/pages/progress";
import NotFound from "@/pages/not-found";
import Navbar from "@/components/ui/navbar";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-gold-400 text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/">
        {isAuthenticated ? (
          <>
            <Navbar />
            <Home />
          </>
        ) : (
          <Landing />
        )}
      </Route>
      {isAuthenticated && (
        <>
          <Route path="/workouts">
            <Navbar />
            <Workouts />
          </Route>
          <Route path="/nutrition">
            <Navbar />
            <Nutrition />
          </Route>
          <Route path="/progress">
            <Navbar />
            <Progress />
          </Route>
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
