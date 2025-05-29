import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLoginSuccess: (userId: number, isAdmin: boolean) => void;
}

export function LoginModal({ open, onOpenChange, onLoginSuccess }: LoginModalProps) {
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [registerForm, setRegisterForm] = useState({ username: "", password: "", confirmPassword: "" });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        body: JSON.stringify(loginForm),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.success) {
        onLoginSuccess(data.userId, data.isAdmin);
        onOpenChange(false);
        setLoginForm({ username: "", password: "" });
        toast({
          title: "Welcome to CineCove",
          description: data.isAdmin 
            ? "Welcome back, Captain! You have admin access to the cove." 
            : "Welcome to your personal cove!",
        });
      } else {
        toast({
          title: "Login failed",
          description: data.message || "Invalid username or password.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Login failed",
        description: "Unable to connect. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (registerForm.password !== registerForm.confirmPassword) {
      toast({
        title: "Registration failed",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        body: JSON.stringify({
          username: registerForm.username,
          password: registerForm.password,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.success) {
        onLoginSuccess(data.userId, false);
        onOpenChange(false);
        setRegisterForm({ username: "", password: "", confirmPassword: "" });
        toast({
          title: "Welcome to CineCove",
          description: "Your account has been created successfully!",
        });
      } else {
        toast({
          title: "Registration failed",
          description: data.message || "Username might already be taken.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Registration failed",
        description: "Unable to create account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px] bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center text-cove-blue">
            Enter the Cove
          </DialogTitle>
          <DialogDescription className="text-center text-slate-300">
            Sign in or create an account to access your personal media collection
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="login" className="mt-4">
          <TabsList className="grid w-full grid-cols-2 bg-slate-800">
            <TabsTrigger value="login" className="data-[state=active]:bg-cove-blue data-[state=active]:text-slate-900">
              Sign In
            </TabsTrigger>
            <TabsTrigger value="register" className="data-[state=active]:bg-cove-blue data-[state=active]:text-slate-900">
              Join Cove
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="login" className="space-y-4 mt-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-username" className="text-slate-200">
                  Username
                </Label>
                <Input
                  id="login-username"
                  type="text"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, username: e.target.value }))}
                  className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400"
                  placeholder="Enter your username"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="login-password" className="text-slate-200">
                  Password
                </Label>
                <Input
                  id="login-password"
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                  className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400"
                  placeholder="Enter your password"
                  required
                />
              </div>
              
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-cove-blue hover:bg-cove-blue/90 text-slate-900 font-semibold"
              >
                {isLoading ? "Diving In..." : "Dive Into Cove"}
              </Button>
            </form>
          </TabsContent>
          
          <TabsContent value="register" className="space-y-4 mt-4">
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="register-username" className="text-slate-200">
                  Username
                </Label>
                <Input
                  id="register-username"
                  type="text"
                  value={registerForm.username}
                  onChange={(e) => setRegisterForm(prev => ({ ...prev, username: e.target.value }))}
                  className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400"
                  placeholder="Choose a username"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="register-password" className="text-slate-200">
                  Password
                </Label>
                <Input
                  id="register-password"
                  type="password"
                  value={registerForm.password}
                  onChange={(e) => setRegisterForm(prev => ({ ...prev, password: e.target.value }))}
                  className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400"
                  placeholder="Create a password"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-slate-200">
                  Confirm Password
                </Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={registerForm.confirmPassword}
                  onChange={(e) => setRegisterForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400"
                  placeholder="Confirm your password"
                  required
                />
              </div>
              
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-lavender-pink hover:bg-lavender-pink/90 text-slate-900 font-semibold"
              >
                {isLoading ? "Creating Account..." : "Join the Cove"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <div className="mt-4 p-3 bg-slate-800/50 rounded-lg">
          <p className="text-xs text-slate-400 text-center">
            Captain access is available for authorized personnel
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}