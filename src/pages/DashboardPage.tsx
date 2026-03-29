import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  GraduationCap,
  User,
  BookOpen,
  Search,
  Building2,
  Calculator,
  LogOut,
  Loader2,
  Save,
  ChevronRight,
} from "lucide-react";

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa",
  "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala",
  "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland",
  "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi", "Jammu & Kashmir", "Ladakh",
];

type Tab = "overview" | "profile" | "academic" | "history";

interface Profile {
  full_name: string | null;
  dob: string | null;
  gender: string | null;
  category: string | null;
  state: string | null;
  tenth_board: string | null;
  tenth_percentage: number | null;
  twelfth_board: string | null;
  twelfth_percentage: number | null;
  stream: string | null;
  family_income: number | null;
  savings: number | null;
  existing_loans: number | null;
}

export default function DashboardPage() {
  const { user, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tab, setTab] = useState<Tab>("overview");
  const [profile, setProfile] = useState<Profile>({
  full_name: "",
  dob: "",
  gender: "",
  category: "",
  state: "",
  tenth_board: "",
  tenth_percentage: null,
  twelfth_board: "",
  twelfth_percentage: null,
  stream: "",
  family_income: null,
  savings: null,
  existing_loans: null,
});
  const [saving, setSaving] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [universityCount, setUniversityCount] = useState(0);
  const [searchHistory, setSearchHistory] = useState<any[]>([]);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    loadProfile();
    loadStats();
  }, [user]);

  const loadProfile = async () => {
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user!.id)
    .maybeSingle();

  if (data) {
    setProfile((prev) => ({
      ...prev,
      ...data,
    }));
  }

  setLoadingProfile(false);
};

  const loadStats = async () => {
    const { count } = await supabase.from("universities").select("*", { count: "exact", head: true });
    setUniversityCount(count ?? 0);
    const { data: history } = await supabase
      .from("search_history")
      .select("*")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false })
      .limit(10);
    setSearchHistory(history ?? []);
  };

const saveProfile = async () => {
  if (!profile.stream) {
    toast({
      title: "Select Stream",
      description: "Please select your stream",
      variant: "destructive",
    });
    return;
  }

  setSaving(true);

  const { error } = await supabase
    .from("profiles")
    .upsert(
      {
        ...profile,
        user_id: user.id,
        stream: profile.stream || null,
      },
      {
        onConflict: "user_id", // 🔥 THIS FIXES YOUR ERROR
      }
    );

  if (error) {
    console.error(error);
    toast({
      title: "Error",
      description: error.message,
      variant: "destructive",
    });
  } else {
    toast({
      title: "Profile saved",
      description: "Your information has been updated.",
    });
  }

  setSaving(false);
};

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (authLoading || loadingProfile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const updateField = (key: keyof Profile, value: any) => {
  setProfile((prev) => ({
    ...prev,
    [key]: value,
  }));
};

  const sidebarItems = [
    { id: "overview" as Tab, icon: Building2, label: "Overview" },
    { id: "profile" as Tab, icon: User, label: "Personal Info" },
    { id: "academic" as Tab, icon: BookOpen, label: "Academics" },
    { id: "history" as Tab, icon: Search, label: "Search History" },
  ];

  const completionPct = profile
    ? Math.round(
        ([
          profile.full_name,
          profile.dob,
          profile.gender,
          profile.category,
          profile.state,
          profile.tenth_percentage,
          profile.twelfth_percentage,
          profile.stream,
        ].filter(Boolean).length /
          8) *
          100,
      )
    : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Top Nav */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
        <div className="container flex h-14 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-primary" />
            <span className="font-bold text-foreground">AdmitKaro</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:inline">{user?.email}</span>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-1" />
              Sign out
            </Button>
          </div>
        </div>
      </nav>

      <div className="container py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-56 shrink-0">
            <nav className="flex lg:flex-col gap-1">
              {sidebarItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setTab(item.id)}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors w-full text-left ${
                    tab === item.id
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </button>
              ))}
            </nav>
          </aside>

          {/* Content */}
          <main className="flex-1 min-w-0">
            {tab === "overview" && (
              <div className="animate-fade-in space-y-6">
                <div>
                  <h1 className="text-2xl font-bold text-foreground">
                    Welcome{profile?.full_name ? `, ${profile.full_name}` : ""}!
                  </h1>
                  <p className="text-muted-foreground mt-1">Here's your admission journey at a glance.</p>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <DashCard
                    title="Profile Completion"
                    value={`${completionPct}%`}
                    subtitle="Complete your profile for better predictions"
                    action={completionPct < 100 ? () => setTab("profile") : undefined}
                    actionLabel="Complete Now"
                  />
                  <DashCard
                    title="Universities Available"
                    value={universityCount.toString()}
                    subtitle="IITs, NITs, State & Private"
                  />
                  <DashCard
                    title="Recent Searches"
                    value={searchHistory.length.toString()}
                    subtitle="Your search history"
                    action={() => setTab("history")}
                    actionLabel="View All"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { icon: GraduationCap, title: "Explore Universities", desc: "Browse courses, seats & cut-offs", to: "/universities" },
                    { icon: Calculator, title: "Financial Planner", desc: "Loans, scholarships & EMI calculator", to: "/finance" },
                  ].map((item) => (
                    <Link
                      key={item.title}
                      to={item.to}
                      className="group flex items-center gap-4 rounded-xl border border-border bg-card p-5 card-shadow transition-all duration-300 hover:card-shadow-hover hover:-translate-y-0.5"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <item.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-foreground">{item.title}</p>
                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {tab === "profile" && (
              <div className="animate-fade-in space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-foreground">Personal Information</h2>
                    <p className="text-sm text-muted-foreground">This data is used for admission predictions.</p>
                  </div>
                  <Button onClick={saveProfile} disabled={saving}>
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    <span className="ml-1">Save</span>
                  </Button>
                </div>
                <div className="grid sm:grid-cols-2 gap-4 rounded-xl border border-border bg-card p-6">
                  <FormField label="Full Name" value={profile?.full_name ?? ""} onChange={(v) => updateField("full_name", v)} />
                  <FormField label="Date of Birth" type="date" value={profile?.dob ?? ""} onChange={(v) => updateField("dob", v)} />
                  <div>
  <Label htmlFor="gender">Gender</Label>
  <Select
    value={profile?.gender ?? ""}
    onValueChange={(v) => updateField("gender", v)}
  >
    <SelectTrigger id="gender" className="mt-1.5">
      <SelectValue placeholder="Select" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="male">Male</SelectItem>
      <SelectItem value="female">Female</SelectItem>
      <SelectItem value="other">Other</SelectItem>
    </SelectContent>
  </Select>
</div>
                  <div>
  <Label htmlFor="category">Category</Label>
  <Select
    value={profile?.category ?? ""}
    onValueChange={(v) => updateField("category", v)}
  >
    <SelectTrigger id="category" className="mt-1.5">
      <SelectValue placeholder="Select" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="general">General</SelectItem>
      <SelectItem value="obc">OBC</SelectItem>
      <SelectItem value="sc">SC</SelectItem>
      <SelectItem value="st">ST</SelectItem>
      <SelectItem value="ews">EWS</SelectItem>
    </SelectContent>
  </Select>
</div>
                  <div className="sm:col-span-2">
  <Label htmlFor="state">State</Label>
  <Select
    value={profile?.state ?? ""}
    onValueChange={(v) => updateField("state", v)}
  >
    <SelectTrigger id="state" className="mt-1.5">
      <SelectValue placeholder="Select state" />
    </SelectTrigger>
    <SelectContent>
      {INDIAN_STATES.map((s) => (
        <SelectItem key={s} value={s}>
          {s}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
</div>
                  <FormField label="Family Annual Income (₹)" type="number" value={profile?.family_income?.toString() ?? ""} onChange={(v) => updateField("family_income", v ? Number(v) : null)} />
                  <FormField label="Savings (₹)" type="number" value={profile?.savings?.toString() ?? ""} onChange={(v) => updateField("savings", v ? Number(v) : null)} />
                </div>
              </div>
            )}

            {tab === "academic" && (
              <div className="animate-fade-in space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-foreground">Academic Information</h2>
                    <p className="text-sm text-muted-foreground">Your board exam scores and stream.</p>
                  </div>
                  <Button onClick={saveProfile} disabled={saving}>
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    <span className="ml-1">Save</span>
                  </Button>
                </div>
                <div className="grid sm:grid-cols-2 gap-4 rounded-xl border border-border bg-card p-6">
                  <FormField label="10th Board" value={profile?.tenth_board ?? ""} onChange={(v) => updateField("tenth_board", v)} placeholder="e.g. CBSE, ICSE" />
                  <FormField label="10th Percentage" type="number" value={profile?.tenth_percentage?.toString() ?? ""} onChange={(v) => updateField("tenth_percentage", v ? Number(v) : null)} placeholder="0-100" />
                  <FormField label="12th Board" value={profile?.twelfth_board ?? ""} onChange={(v) => updateField("twelfth_board", v)} placeholder="e.g. CBSE, State Board" />
                  <FormField label="12th Percentage" type="number" value={profile?.twelfth_percentage?.toString() ?? ""} onChange={(v) => updateField("twelfth_percentage", v ? Number(v) : null)} placeholder="0-100" />
                  <div className="sm:col-span-2">
  <Label htmlFor="stream">Stream</Label>
  <Select
    value={profile?.stream ?? ""}
    onValueChange={(v) => updateField("stream", v)}
  >
    <SelectTrigger id="stream" className="mt-1.5">
      <SelectValue placeholder="Select stream" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="mpc">MPC (Maths, Physics, Chemistry)</SelectItem>
      <SelectItem value="bipc">BiPC (Biology, Physics, Chemistry)</SelectItem>
      <SelectItem value="mec">MEC (Maths, Economics, Commerce)</SelectItem>
      <SelectItem value="cec">CEC (Civics, Economics, Commerce)</SelectItem>
      <SelectItem value="hec">HEC (History, Economics, Civics)</SelectItem>
    </SelectContent>
  </Select>
</div>
                </div>
              </div>
            )}

            {tab === "history" && (
              <div className="animate-fade-in space-y-6">
                <h2 className="text-xl font-bold text-foreground">Search History</h2>
                {searchHistory.length === 0 ? (
                  <div className="rounded-xl border border-border bg-card p-12 text-center">
                    <Search className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                    <p className="font-medium text-foreground">No searches yet</p>
                    <p className="text-sm text-muted-foreground mt-1">Your university and financial searches will appear here.</p>
                    <Button variant="outline" className="mt-4" asChild>
                      <Link to="/universities">Explore Universities</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {searchHistory.map((item) => (
                      <div key={item.id} className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
                        <div>
                          <p className="text-sm font-medium text-foreground">{item.search_query}</p>
                          <p className="text-xs text-muted-foreground">{item.search_type} · {new Date(item.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

function DashCard({
  title,
  value,
  subtitle,
  action,
  actionLabel,
}: {
  title: string;
  value: string;
  subtitle: string;
  action?: () => void;
  actionLabel?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 card-shadow">
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
      {action && actionLabel && (
        <button onClick={action} className="mt-3 text-sm text-primary hover:underline font-medium">
          {actionLabel} →
        </button>
      )}
    </div>
  );
}

function FormField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  const id = label.toLowerCase().replace(/\s+/g, "_"); // unique id

  return (
    <div>
      <Label htmlFor={id}>{label}</Label> {/* ✅ linked */}
      <Input
        id={id} // ✅ important
        name={id} // ✅ important
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1.5"
      />
    </div>
  );

  return (
    <div>
      <Label>{label}</Label>
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1.5"
      />
    </div>
  );
}
