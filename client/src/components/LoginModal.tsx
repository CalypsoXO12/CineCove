import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLoginSuccess: (userId: number, isAdmin: boolean) => void;
}

export function LoginModal({ open, onOpenChange, onLoginSuccess }: LoginModalProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.success) {
        onLoginSuccess(data.userId, data.isAdmin);
        onOpenChange(false);
        setUsername("");
        setPassword("");
        toast({
          title: "Login successful",
          description: data.isAdmin 
            ? "Welcome back, Captain! You have admin access to the cove." 
            : "Welcome to your personal cove!",
        });
      }
    } catch (error) {
      toast({
        title: "Login failed",
        description: "Invalid username or password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center text-cove-blue">
            Enter the Cove
          </DialogTitle>
          <DialogDescription className="text-center text-slate-300">
            Sign in to access your personal media collection
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleLogin} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-slate-200">
              Username
            </Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400"
              placeholder="Enter your username"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password" className="text-slate-200">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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

        <div className="mt-4 p-3 bg-slate-800/50 rounded-lg">
          <p className="text-xs text-slate-400 text-center">
            Admin access is available for authorized personnel
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}