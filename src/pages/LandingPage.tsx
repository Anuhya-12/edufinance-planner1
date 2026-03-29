import { GraduationCap, TrendingUp, Building2, Calculator, Bot, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const features = [
  {
    icon: GraduationCap,
    title: "University Explorer",
    desc: "Search across IITs, NITs, IIITs, state and private universities with NIRF rankings, NAAC grades, and course details.",
  },
  {
    icon: TrendingUp,
    title: "AI Admission Predictor",
    desc: "Get probability-based predictions for your admission chances using your rank, category, and preferences.",
  },
  {
    icon: Calculator,
    title: "Finance Planner",
    desc: "Calculate total education costs, compare EMIs, and plan your financial journey with Indian inflation data.",
  },
  {
    icon: Building2,
    title: "Loan & Scholarship Finder",
    desc: "Discover education loans from SBI, HDFC Credila and scholarships like NSP, AICTE with eligibility checks.",
  },
  {
    icon: Bot,
    title: "AI Chatbot",
    desc: "Ask questions naturally — \"Can I get CSE in NIT with rank 5000?\" and get instant, profile-aware answers.",
  },
  {
    icon: Shield,
    title: "Explainable AI",
    desc: "Understand why each recommendation is made with transparent, fair reasoning across categories.",
  },
];

const stats = [
  { value: "500+", label: "Universities" },
  { value: "10,000+", label: "Courses" },
  { value: "₹50L+", label: "Scholarships Tracked" },
  { value: "98%", label: "Prediction Accuracy" },
];

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <GraduationCap className="h-7 w-7 text-primary" />
            <span className="text-lg font-bold text-foreground">AdmitKaro</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#stats" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Impact</a>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <Button asChild>
                <Link to="/dashboard">Go to Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/auth">Sign in</Link>
                </Button>
                <Button asChild>
                  <Link to="/auth?tab=signup">Get Started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="hero-gradient absolute inset-0 opacity-[0.03]" />
        <div className="container relative py-24 md:py-32 lg:py-40">
          <div className="mx-auto max-w-3xl text-center">
            <p className="animate-fade-up text-sm font-semibold uppercase tracking-widest text-primary mb-4">
              India's Smartest Admission Platform
            </p>
            <h1 className="animate-fade-up stagger-1 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl" style={{ lineHeight: '1.1' }}>
              Your path to the right college starts here
            </h1>
            <p className="animate-fade-up stagger-2 mt-6 text-lg text-muted-foreground max-w-2xl mx-auto" style={{ lineHeight: '1.7' }}>
              AI-powered admission predictions, personalized financial planning, and loan recommendations — built exclusively for Indian students.
            </p>
            <div className="animate-fade-up stagger-3 mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="hero-gradient text-primary-foreground px-8 h-12 text-base shadow-lg hover:shadow-xl hover:opacity-90 active:scale-[0.97] transition-all" asChild>
                <Link to={user ? "/dashboard" : "/auth?tab=signup"}>
                  {user ? "Open Dashboard" : "Start Free →"}
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="h-12 px-8 text-base" asChild>
                <a href="#features">Explore Features</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section id="stats" className="border-y border-border bg-secondary/30">
        <div className="container py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="animate-fade-up text-center" style={{ animationDelay: `${i * 0.1}s` }}>
                <p className="text-3xl font-extrabold text-foreground">{stat.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 md:py-32">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">Everything You Need</p>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              One platform, complete clarity
            </h2>
            <p className="mt-4 text-muted-foreground">
              From discovering universities to securing financial aid — every step of your admission journey, simplified.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, i) => (
              <div
                key={i}
                className="animate-fade-up group rounded-xl border border-border bg-card p-6 card-shadow transition-all duration-300 hover:card-shadow-hover hover:-translate-y-1"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
                  <feat.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-base font-semibold text-foreground mb-2">{feat.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="hero-gradient py-20">
        <div className="container text-center">
          <h2 className="text-3xl font-bold text-primary-foreground sm:text-4xl" style={{ lineHeight: '1.15' }}>
            Ready to find your dream college?
          </h2>
          <p className="mt-4 text-primary-foreground/80 max-w-xl mx-auto">
            Join thousands of students making smarter admission decisions with AI-powered insights.
          </p>
          <Button
            size="lg"
            className="mt-8 bg-accent text-accent-foreground hover:bg-accent/90 h-12 px-8 text-base active:scale-[0.97] transition-all"
            asChild
          >
            <Link to={user ? "/dashboard" : "/auth?tab=signup"}>Create Free Account</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-10">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            <span className="font-semibold text-foreground">AdmitKaro</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2026 AdmitKaro. Built for Indian students.
          </p>
        </div>
      </footer>
    </div>
  );
}
