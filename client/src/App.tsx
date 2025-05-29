import { Switch, Route } from "wouter";
import { useState } from "react";
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
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/admin" component={() => <AdminPanel user={user} />} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [user, setUser] = useState<{ id: number; isAdmin: boolean } | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleLoginSuccess = (userId: number, isAdmin: boolean) => {
    setUser({ id: userId, isAdmin });
  };

  const handleLogout = () => {
    setUser(null);
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
