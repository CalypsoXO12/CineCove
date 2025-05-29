import { Switch, Route } from "wouter";
import { useState, useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LoginModal } from "@/components/LoginModal";
import { Navigation } from "@/components/Navigation";
import Home from "@/pages/home";
import Dashboard from "@/pages/dashboard";
import AdminPanel from "@/pages/admin";
import NotFound from "@/pages/not-found";

function Router({ user }: { user: { id: number; isAdmin: boolean } | null }) {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/dashboard" component={() => <Dashboard user={user} />} />
      <Route path="/admin" component={() => <AdminPanel user={user} />} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [user, setUser] = useState<{ id: number; isAdmin: boolean } | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Load user from localStorage on app start
  useEffect(() => {
    const savedUser = localStorage.getItem('cinecove_user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
      } catch (error) {
        localStorage.removeItem('cinecove_user');
      }
    }
  }, []);

  const handleLoginSuccess = (userId: number, isAdmin: boolean) => {
    const userData = { id: userId, isAdmin };
    setUser(userData);
    localStorage.setItem('cinecove_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('cinecove_user');
  };

  const handleShowLogin = () => {
    setShowLoginModal(true);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="dark">
          <Toaster />
          <Navigation 
            user={user} 
            onLogin={handleShowLogin}
            onLogout={handleLogout}
          />
          <Router user={user} />
          <LoginModal 
            open={showLoginModal} 
            onOpenChange={setShowLoginModal}
            onLoginSuccess={handleLoginSuccess}
          />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
