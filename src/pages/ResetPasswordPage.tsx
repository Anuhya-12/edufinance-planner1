import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";


export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  useEffect(() => {
  const handleAuth = async () => {
    const hash = window.location.hash;

    if (hash && hash.includes("access_token")) {
      const { data, error } = await supabase.auth.getSession();

      if (error || !data.session) {
        console.error("Session error:", error?.message);
      } else {
        console.log("Session recovered ✅");
      }
    }
  };

  handleAuth();
}, []);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  const { data } = await supabase.auth.getSession();

  if (!data.session) {
    toast({
      title: "Session expired",
      description: "Please use the reset link again",
      variant: "destructive",
    });
    setLoading(false);
    return;
  }

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    toast({ title: "Error", description: error.message, variant: "destructive" });
  } else {
    toast({
      title: "Password updated!",
      description: "You can now sign in with your new password.",
    });
    navigate("/login");
  }

  setLoading(false);
};

  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-foreground mb-2">Set new password</h1>
        <p className="text-sm text-muted-foreground mb-8">Enter your new password below.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="password">New Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="mt-1.5"
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Update Password
          </Button>
        </form>
      </div>
    </div>
  );
}
