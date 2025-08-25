import { Link, useLocation } from "wouter";
import { Dumbbell, Home, Activity, Apple, TrendingUp, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export default function Navbar() {
  const [location] = useLocation();
  const { user } = useAuth();

  const navigation = [
    { name: "Dashboard", href: "/", icon: Home, testId: "nav-dashboard" },
    { name: "Workouts", href: "/workouts", icon: Activity, testId: "nav-workouts" },
    { name: "Voeding", href: "/nutrition", icon: Apple, testId: "nav-nutrition" },
    { name: "Voortgang", href: "/progress", icon: TrendingUp, testId: "nav-progress" },
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-black/80 border-b border-gold-500/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-gold-400 to-gold-600 rounded-xl flex items-center justify-center">
              <Dumbbell className="text-black text-lg" />
            </div>
            <span className="font-bold text-gold-400 text-lg hidden sm:block">
              Marcodonato B.V
            </span>
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  data-testid={item.testId}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-200 ${
                    isActive
                      ? "text-gold-400 bg-gold-500/10"
                      : "text-gold-300 hover:text-gold-400"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-3">
              {user?.profileImageUrl && (
                <img
                  src={user.profileImageUrl}
                  alt="Profile"
                  className="w-8 h-8 rounded-full border border-gold-500/50"
                  style={{ objectFit: "cover" }}
                  data-testid="profile-image"
                />
              )}
              <span className="text-gold-300 text-sm" data-testid="user-name">
                {user?.firstName || user?.email}
              </span>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              className="border-gold-500/50 text-gold-400 hover:bg-gold-500/10"
              onClick={() => window.location.href = "/api/logout"}
              data-testid="button-logout"
            >
              <LogOut className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">Uitloggen</span>
            </Button>
          </div>

          {/* Mobile menu button */}
          <button 
            className="md:hidden p-2 rounded-lg border border-gold-500/50 text-gold-400"
            data-testid="button-mobile-menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
