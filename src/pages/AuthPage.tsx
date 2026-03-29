import { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap, Loader2, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AuthPage() {
  const [searchParams] = useSearchParams();
  const [isSignup, setIsSignup] = useState(searchParams.get("tab") === "signup");
  const [showForgot, setShowForgot] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, resetPassword } = useAuth();
  const { toast } = useToast();
  const [cooldown, setCooldown] = useState(0);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || (!showForgot && !password.trim())) return;
    setLoading(true);

    try {
      if (showForgot) {
  if (cooldown > 0) {
    toast({
      title: "Wait",
      description: `Please wait ${cooldown}s before retrying`,
    });
    return;
  }

  const { error } = await resetPassword(email);
  if (error) throw error;

  toast({
    title: "Check your email",
    description: "We sent a password reset link.",
  });

  // ✅ start cooldown
  setCooldown(60);

  const interval = setInterval(() => {
    setCooldown((prev) => {
      if (prev <= 1) {
        clearInterval(interval);
        return 0;
      }
      return prev - 1;
    });
  }, 1000);

  setShowForgot(false);
} else if (isSignup) {
        const { error } = await signUp(email, password);
        if (error) throw error;
        toast({ title: "Account created!", description: "Check your email to confirm your account." });
      } else {
        const { error } = await signIn(email, password);
        if (error) throw error;
        navigate("/dashboard");
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 hero-gradient items-center justify-center p-12">
        <div className="max-w-md text-primary-foreground">
          <GraduationCap className="h-12 w-12 mb-6 opacity-90" />
          <h2 className="text-3xl font-bold mb-4" style={{ lineHeight: '1.15' }}>
            Make informed admission decisions
          </h2>
          <p className="text-primary-foreground/80 leading-relaxed">
            AI-powered predictions, financial planning, and personalized recommendations for Indian universities.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-4 text-sm">
            {["500+ Universities", "AI Predictions", "Loan Finder", "Scholarship Match"].map((item) => (
              <div key={item} className="flex items-center gap-2 text-primary-foreground/90">
                <div className="h-1.5 w-1.5 rounded-full bg-accent" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <Link to="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <GraduationCap className="h-7 w-7 text-primary" />
            <span className="text-lg font-bold">AdmitKaro</span>
          </Link>

          <h1 className="text-2xl font-bold text-foreground mb-1">
            {showForgot ? "Reset password" : isSignup ? "Create your account" : "Welcome back"}
          </h1>
          <p className="text-sm text-muted-foreground mb-8">
            {showForgot
              ? "Enter your email and we'll send a reset link."
              : isSignup
              ? "Start your admission journey today."
              : "Sign in to access your dashboard."}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1.5"
              />
            </div>
            {!showForgot && (
              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative mt-1.5">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Min 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}

            {!isSignup && !showForgot && (
              <button
                type="button"
                onClick={() => setShowForgot(true)}
                className="text-sm text-primary hover:underline"
              >
                Forgot password?
              </button>
            )}

            <Button type="submit" className="w-full h-11" disabled={loading || (showForgot && cooldown > 0)}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {showForgot
  ? cooldown > 0
    ? `Wait ${cooldown}s`
    : "Send Reset Link"
  : isSignup
  ? "Create Account"
  : "Sign In"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {showForgot ? (
              <button onClick={() => setShowForgot(false)} className="text-primary hover:underline">
                Back to sign in
              </button>
            ) : isSignup ? (
              <>
                Already have an account?{" "}
                <button onClick={() => setIsSignup(false)} className="text-primary hover:underline">
                  Sign in
                </button>
              </>
            ) : (
              <>
                Don't have an account?{" "}
                <button onClick={() => setIsSignup(true)} className="text-primary hover:underline">
                  Sign up
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
