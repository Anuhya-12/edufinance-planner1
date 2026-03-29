import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  GraduationCap, ArrowLeft, Loader2, Building2, IndianRupee,
  Calculator, ArrowLeftRight, Award, ExternalLink, FileText, CheckCircle2, XCircle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface Loan {
  id: string;
  bank_name: string;
  loan_name: string | null;
  interest_rate: number | null;
  max_amount: number | null;
  min_tenure_years: number | null;
  max_tenure_years: number | null;
  moratorium_months: number | null;
  processing_fee: string | null;
  official_link: string | null;
  required_documents: string[] | null;
}

interface Scholarship {
  id: string;
  name: string;
  provider: string;
  type?: string;
  eligibility?: string;

  amount?: number;

  min_income?: number;   // ✅ ADD
  max_income?: number;   // ✅ ADD

  deadline?: string;

  required_documents?: string[];

  official_link?: string;

  categories?: string[];
}

function formatINR(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
}

function calcEMI(principal: number, annualRate: number, tenureYears: number) {
  const r = annualRate / 100 / 12;
  const n = tenureYears * 12;
  if (r === 0) return principal / n;
  return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

export default function FinancePage() {
  const { user } = useAuth();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [recommendedLoan, setRecommendedLoan] = useState<any>(null);
  const [featureImportance, setFeatureImportance] = useState<any>(null);
  // EMI Calculator state
  const [loanAmount, setLoanAmount] = useState(1000000);
  const [interestRate, setInterestRate] = useState(8.5);
  const [tenure, setTenure] = useState(5);
  const [moratorium, setMoratorium] = useState(12);

  // What-if simulator
  const [uniA, setUniA] = useState({ name: "IIT (Government)", fee: 250000, duration: 4, hostel: 25000 });
  const [uniB, setUniB] = useState({ name: "VIT (Private)", fee: 350000, duration: 4, hostel: 150000 });
  const [simTenure, setSimTenure] = useState(5);
  const [simRate, setSimRate] = useState(8.5);
  const [expectedSalary, setExpectedSalary] = useState(1200000);
  const [scholarshipAmount, setScholarshipAmount] = useState(0);
  const [autoScholarship, setAutoScholarship] = useState(0);
  const [manualScholarship, setManualScholarship] = useState<number | null>(null);
  

  useEffect(() => {
    loadData();
  }, [user]);
useEffect(() => {
  if (!profile?.family_income) return;

  fetch(`${import.meta.env.VITE_BACKEND_URL}/recommend-loans/${profile.family_income}`)
    .then(res => res.json())
    .then((data) => {
      console.log("Filtered ML Loans:", data);

      // ✅ NEW CORRECT LOGIC
      if (data?.loans && data.loans.length > 0) {
        setLoans(data.loans);
        setRecommendedLoan(data.loans[0]);
        setFeatureImportance(data.feature_importance);
      } else {
        console.log("No ML data received");
      }
    });
}, [profile]);
useEffect(() => {
  if (!recommendedLoan) return;

  setLoanAmount(recommendedLoan.max_amount || 1000000);
  setInterestRate(recommendedLoan.interest_rate || 8.5);

  if (
    recommendedLoan.min_tenure_years &&
    recommendedLoan.max_tenure_years
  ) {
    const avgTenure =
      (recommendedLoan.min_tenure_years +
        recommendedLoan.max_tenure_years) / 2;

    setTenure(avgTenure);
  }

  setMoratorium(recommendedLoan.moratorium_months || 12);

}, [recommendedLoan]);
useEffect(() => {
  if (!profile?.family_income || !profile?.category) return;

  fetch(`${import.meta.env.VITE_BACKEND_URL}/recommend-scholarships/${profile.family_income}/${profile.category}`)
    .then(res => res.json())
    .then(data => {
      console.log("Scholarships:", data);
      setScholarships(data.recommended_scholarships || []);
      setScholarshipAmount(data.total_scholarship_amount || 0);
      setAutoScholarship(data.total_scholarship_amount || 0);  
    });
}, [profile]);

  const loadData = async () => {
  setLoading(true);

  let userProfile = null;

  if (user) {
    const { data: p } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    userProfile = p;
    setProfile(p);
  }

  let loanQuery = supabase.from("loans").select("*");

  if (userProfile?.family_income) {
    loanQuery = loanQuery
      .lte("min_income", userProfile.family_income)
      .gte("max_income", userProfile.family_income);
  }

  const [{ data: l }, { data: s }] = await Promise.all([
    loanQuery.order("interest_rate"),
    supabase.from("scholarships").select("*").order("amount", { ascending: false }),
  ]);

  setLoans(l ?? []);
  setScholarships(s ?? []);

  setLoading(false);
};

  const emi = calcEMI(loanAmount, interestRate, tenure);
  const totalPayment = emi * tenure * 12;
  const totalInterest = totalPayment - loanAmount;

  const totalCostA = (uniA.fee + uniA.hostel) * uniA.duration;
  const totalCostB = (uniB.fee + uniB.hostel) * uniB.duration;
  // ✅ Apply scholarship
  const finalScholarship =
  manualScholarship !== null ? manualScholarship : autoScholarship;

  const adjustedA = Math.max(totalCostA - finalScholarship, 0);
  const adjustedB = Math.max(totalCostB - finalScholarship, 0);
  const emiA = calcEMI(totalCostA, simRate, simTenure);
  const emiB = calcEMI(totalCostB, simRate, simTenure);
  const burdenA = ((emiA * 12) / expectedSalary) * 100;
  const burdenB = ((emiB * 12) / expectedSalary) * 100;

  const userCategory = profile?.category?.toLowerCase() ?? "";
  const userIncome = profile?.family_income ?? Infinity;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  const chartData = featureImportance
  ? Object.entries(featureImportance).map(([key, value]) => {
      const numValue = Number(value); // ✅ FIX

      return {
        name: key.replace("_", " "),
        value: Number((numValue * 100).toFixed(2)),
      };
    })
  : [];

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
        <div className="container flex h-14 items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/dashboard"><ArrowLeft className="h-4 w-4 mr-1" />Dashboard</Link>
          </Button>
          <div className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            <span className="font-bold text-foreground">Finance Planner</span>
          </div>
        </div>
      </nav>

      <div className="container py-8">
        <Tabs defaultValue="loans" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 max-w-2xl">
            <TabsTrigger value="loans"><Building2 className="h-4 w-4 mr-1 hidden sm:inline" />Loans</TabsTrigger>
            <TabsTrigger value="emi"><IndianRupee className="h-4 w-4 mr-1 hidden sm:inline" />EMI Calc</TabsTrigger>
            <TabsTrigger value="whatif"><ArrowLeftRight className="h-4 w-4 mr-1 hidden sm:inline" />What-If</TabsTrigger>
            <TabsTrigger value="scholarships"><Award className="h-4 w-4 mr-1 hidden sm:inline" />Scholarships</TabsTrigger>
          </TabsList>
          {recommendedLoan && (
  <div className="rounded-xl border border-primary/30 bg-primary/5 p-5 mb-4">
    <h3 className="text-lg font-semibold text-primary mb-2">
      ✨ Recommended for You
    </h3>
    

    <div className="space-y-1">
      <p className="font-medium text-foreground">
        {recommendedLoan.bank_name}
      </p>

      <p className="text-sm text-muted-foreground">
        Interest Rate: {recommendedLoan.interest_rate}%
      </p>

      <p className="text-sm text-muted-foreground">
        Max Amount: ₹{recommendedLoan.max_amount?.toLocaleString()}
      </p>

      <p className="text-xs text-muted-foreground mt-2">
  💡 {recommendedLoan?.reason || "Best match based on your profile"}
</p>
    </div>
  </div>
)}
          {/* LOAN COMPARISON */}
          <TabsContent value="loans" className="animate-fade-in space-y-4">
            {featureImportance && (
  <div className="rounded-xl border p-5 mt-4 bg-card shadow-sm">
    <h3 className="text-lg font-semibold mb-4">
      📊 What influenced this recommendation?
    </h3>

    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={chartData} layout="vertical">
        <XAxis type="number" />
        <YAxis type="category" dataKey="name" />
        <Tooltip formatter={(value) => `${value}%`} />
        <Bar dataKey="value" />
      </BarChart>
    </ResponsiveContainer>
  </div>
)}
            <div>
              <h2 className="text-xl font-bold text-foreground">Education Loan Comparison</h2>
              <p className="text-sm text-muted-foreground">Compare interest rates, tenures, and documents across major banks.</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {loans.map((loan) => (
                <div key={loan.id} className="rounded-xl border border-border bg-card p-5 card-shadow space-y-3">
                  <div>
                    <h3 className="font-semibold text-foreground">{loan.bank_name}</h3>
                    {loan.loan_name && <p className="text-xs text-muted-foreground">{loan.loan_name}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs">Interest Rate</p>
                      <p className="font-semibold text-foreground">{loan.interest_rate}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Max Amount</p>
                      <p className="font-semibold text-foreground">{loan.max_amount ? formatINR(loan.max_amount) : "—"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Tenure</p>
                      <p className="font-semibold text-foreground">{loan.min_tenure_years}–{loan.max_tenure_years} yrs</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Moratorium</p>
                      <p className="font-semibold text-foreground">{loan.moratorium_months ?? "—"} months</p>
                    </div>
                  </div>
                  {loan.processing_fee && (
                    <p className="text-xs text-muted-foreground">Processing Fee: {loan.processing_fee}</p>
                  )}
                  {loan.required_documents && loan.required_documents.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-foreground mb-1">Required Documents</p>
                      <div className="flex flex-wrap gap-1">
                        {loan.required_documents.map((doc, i) => (
                          <Badge key={i} variant="secondary" className="text-[10px]">
                            <FileText className="h-2.5 w-2.5 mr-0.5" />{doc}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {loan.official_link && (
                    <a href={loan.official_link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                      <ExternalLink className="h-3 w-3" />Apply Now
                    </a>
                  )}
                  <p className="text-xs text-muted-foreground">
  ⚠️ Data is indicative. Please verify on official bank website.
</p>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* EMI CALCULATOR */}
          <TabsContent value="emi" className="animate-fade-in space-y-6">
            <div>
              <h2 className="text-xl font-bold text-foreground">EMI Calculator</h2>
              <p className="text-sm text-muted-foreground">Calculate monthly EMI for your education loan.</p>
            </div>
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="rounded-xl border border-border bg-card p-6 space-y-5">
                <div>
                  <Label>Loan Amount: {formatINR(loanAmount)}</Label>
                  <Slider className="mt-2" min={100000} max={5000000} step={50000} value={[loanAmount]} onValueChange={([v]) => setLoanAmount(v)} />
                </div>
                <div>
                  <Label>Interest Rate: {interestRate}%</Label>
                  <Slider className="mt-2" min={5} max={16} step={0.1} value={[interestRate]} onValueChange={([v]) => setInterestRate(v)} />
                </div>
                <div>
                  <Label>Tenure: {tenure} years</Label>
                  <Slider className="mt-2" min={1} max={15} step={1} value={[tenure]} onValueChange={([v]) => setTenure(v)} />
                </div>
                <div>
                  <Label>Moratorium Period: {moratorium} months</Label>
                  <Slider className="mt-2" min={0} max={48} step={6} value={[moratorium]} onValueChange={([v]) => setMoratorium(v)} />
                </div>
              </div>
              <div className="rounded-xl border border-border bg-card p-6 space-y-4">
                <h3 className="font-semibold text-foreground">EMI Breakdown</h3>
                <Button
  size="sm"
  variant="outline"
  onClick={() => setRecommendedLoan(null)}
>
  Reset EMI
</Button>
                <div className="space-y-3">
                  <ResultRow label="Monthly EMI" value={formatINR(emi)} highlight />
                  <ResultRow label="Total Interest" value={formatINR(totalInterest)} />
                  <ResultRow label="Total Payment" value={formatINR(totalPayment)} />
                  <ResultRow label="Moratorium Interest" value={formatINR(loanAmount * (interestRate / 100 / 12) * moratorium)} />
                </div>
                <div className="mt-4 rounded-lg bg-primary/5 p-3">
                  <p className="text-xs text-muted-foreground">
                    💡 During the moratorium period of {moratorium} months, only interest accrues. EMI payments start after course completion.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* WHAT-IF SIMULATOR */}
          <TabsContent value="whatif" className="animate-fade-in space-y-6">
            <div>
              <h2 className="text-xl font-bold text-foreground">What-If Financial Simulator</h2>
              <p className="text-sm text-muted-foreground">Compare total costs and EMI burden between two universities.</p>
            </div>
            <div className="grid lg:grid-cols-2 gap-4">
              <UniCard label="University A" uni={uniA} setUni={setUniA} />
              <UniCard label="University B" uni={uniB} setUni={setUniB} />
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              {/* 🎓 Scholarship Input */}
<div className="space-y-2">
  <Label>🎓 Scholarship Amount (₹)</Label>

  <Input
    type="number"
    placeholder={`Auto detected: ₹${autoScholarship.toLocaleString()}`}
    value={manualScholarship ?? ""}
    onChange={(e) =>
      setManualScholarship(
        e.target.value ? Number(e.target.value) : null
      )
    }
  />

  {manualScholarship !== null && (
    <button
      className="text-xs text-primary underline"
      onClick={() => setManualScholarship(null)}
    >
      Reset to Auto
    </button>
  )}
</div>
              <div>
                <Label>Loan Tenure: {simTenure} years</Label>
                <Slider className="mt-2" min={1} max={15} step={1} value={[simTenure]} onValueChange={([v]) => setSimTenure(v)} />
              </div>
              <div>
                <Label>Interest Rate: {simRate}%</Label>
                <Slider className="mt-2" min={5} max={16} step={0.1} value={[simRate]} onValueChange={([v]) => setSimRate(v)} />
              </div>
              <div>
                <Label>Expected Annual Salary (₹)</Label>
                <Input type="number" className="mt-2" value={expectedSalary} onChange={(e) => setExpectedSalary(Number(e.target.value))} />
              </div>
            </div>
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="font-semibold text-foreground mb-4">Comparison Results</h3>
              <div className="grid sm:grid-cols-2 gap-6">
                <CompareCol 
  name={uniA.name}
  totalCost={totalCostA}
  emi={emiA}
  burden={burdenA}
  totalRepayment={emiA * simTenure * 12}
  scholarship={finalScholarship}
  adjustedLoan={adjustedA}
/>

<CompareCol 
  name={uniB.name}
  totalCost={totalCostB}
  emi={emiB}
  burden={burdenB}
  totalRepayment={emiB * simTenure * 12}
  scholarship={finalScholarship}
  adjustedLoan={adjustedB}
/>
              </div>
              <div className="mt-4 rounded-lg bg-primary/5 p-3">
                <p className="text-xs text-muted-foreground">
                  💡 Financial experts recommend keeping EMI burden below 30% of monthly income. {burdenA < burdenB ? uniA.name : uniB.name} has a lower EMI-to-salary ratio at {Math.min(burdenA, burdenB).toFixed(1)}%.
                </p>
              </div>
            </div>
          </TabsContent>

          {/* SCHOLARSHIP ELIGIBILITY */}
          <TabsContent value="scholarships" className="animate-fade-in space-y-4">
  <div>
    <h2 className="text-xl font-bold text-foreground">
      Scholarship Eligibility Checker
    </h2>
    <p className="text-sm text-muted-foreground">
      {user
        ? "Based on your profile, here's your eligibility."
        : "Sign in to see personalized eligibility."}
    </p>
  </div>

  <div className="grid md:grid-cols-2 gap-4">

    {/* ✅ EMPTY STATE */}
    {(!Array.isArray(scholarships) || scholarships.length === 0) && (
      <p className="text-sm text-muted-foreground text-center py-6 col-span-2">
        No scholarships available for your profile.
      </p>
    )}

    {/* ✅ SAFE MAP */}
    {Array.isArray(scholarships) &&
      scholarships.map((s) => {
        const userCat = userCategory?.toLowerCase() || "general";

        const catMatch =
          !s.categories ||
          s.categories.length === 0 ||
          s.categories.some(
            (c: string) =>
              c.toLowerCase() === userCat ||
              c.toLowerCase() === "general" ||
              c.toLowerCase() === "all"
          );

        const incomeMatch =
          userIncome &&
          (!s.min_income || userIncome >= s.min_income) &&
          (!s.max_income || userIncome <= s.max_income);

        const eligible =
          user && profile ? catMatch && incomeMatch : null;

        return (
          <div
            key={s.id}
            className={`rounded-xl border bg-card p-5 card-shadow space-y-3 ${
              eligible === false
                ? "border-destructive/20 opacity-70"
                : "border-border"
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-foreground">
                  {s.name}
                </h3>
                {s.provider && (
                  <p className="text-xs text-muted-foreground">
                    {s.provider}
                  </p>
                )}
              </div>

              {eligible !== null &&
                (eligible ? (
                  <Badge className="bg-success/10 text-success border-0">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Eligible
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-destructive">
                    <XCircle className="h-3 w-3 mr-1" />
                    Not Eligible
                  </Badge>
                ))}
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-muted-foreground text-xs">Amount</p>
                <p className="font-semibold text-foreground">
                  {s.amount
                    ? `₹${Number(s.amount).toLocaleString()}`
                    : "Varies"}
                </p>
              </div>

              <div>
                <p className="text-muted-foreground text-xs">
                  Income Limit
                </p>
                <p className="font-semibold text-foreground">
                  {s.min_income || s.max_income
                    ? `₹${(s.min_income ?? 0).toLocaleString()} - ₹${(
                        s.max_income ?? 0
                      ).toLocaleString()}`
                    : "No limit"}
                </p>
              </div>

              <div>
                <p className="text-muted-foreground text-xs">Deadline</p>
                <p className="font-semibold text-foreground">
                  {s.deadline ?? "Ongoing"}
                </p>
              </div>

              <div>
                <p className="text-muted-foreground text-xs">
                  Categories
                </p>
                <p className="font-semibold text-foreground">
                  {s.categories?.join(", ") ?? "All"}
                </p>
              </div>
            </div>

            {s.eligibility && (
              <p className="text-xs text-muted-foreground">
                {s.eligibility}
              </p>
            )}

            {s.required_documents &&
              s.required_documents.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {s.required_documents.map((doc, i) => (
                    <Badge
                      key={i}
                      variant="secondary"
                      className="text-[10px]"
                    >
                      <FileText className="h-2.5 w-2.5 mr-0.5" />
                      {doc}
                    </Badge>
                  ))}
                </div>
              )}

            {s.official_link && (
              <a
                href={s.official_link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
              >
                <ExternalLink className="h-3 w-3" />
                Apply Now
              </a>
            )}
          </div>
        );
      })}
  </div>
</TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function ResultRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={`font-semibold ${highlight ? "text-primary text-lg" : "text-foreground"}`}>{value}</p>
    </div>
  );
}

function UniCard({ label, uni, setUni }: { label: string; uni: any; setUni: (u: any) => void }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-3">
      <h3 className="font-semibold text-foreground text-sm">{label}</h3>
      <div className="space-y-2">
        <div>
          <Label className="text-xs">Name</Label>
          <Input className="mt-1" value={uni.name} onChange={(e) => setUni({ ...uni, name: e.target.value })} />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <Label className="text-xs">Annual Fee (₹)</Label>
            <Input className="mt-1" type="number" value={uni.fee} onChange={(e) => setUni({ ...uni, fee: Number(e.target.value) })} />
          </div>
          <div>
            <Label className="text-xs">Hostel Fee (₹/yr)</Label>
            <Input className="mt-1" type="number" value={uni.hostel} onChange={(e) => setUni({ ...uni, hostel: Number(e.target.value) })} />
          </div>
          <div>
            <Label className="text-xs">Duration (yrs)</Label>
            <Input className="mt-1" type="number" value={uni.duration} onChange={(e) => setUni({ ...uni, duration: Number(e.target.value) })} />
          </div>
        </div>
      </div>
    </div>
  );
}

function CompareCol({
  name,
  totalCost,
  emi,
  burden,
  totalRepayment,
  scholarship,
  adjustedLoan
}: {
  name: string;
  totalCost: number;
  emi: number;
  burden: number;
  totalRepayment: number;
  scholarship: number;
  adjustedLoan: number; }) {
  return (
    <div className="space-y-2">
      <h4 className="font-semibold text-foreground text-sm">{name}</h4>
      <ResultRow label="Total Education Cost" value={formatINR(totalCost)} />
      <ResultRow label="Monthly EMI" value={formatINR(emi)} highlight />
      <ResultRow label="Total Repayment" value={formatINR(totalRepayment)} />
      <ResultRow label="EMI/Salary Burden" value={`${burden.toFixed(1)}%`} />
      <div className="h-2 rounded-full bg-secondary overflow-hidden mt-1">
        <div className={`h-full rounded-full transition-all ${burden > 30 ? "bg-destructive" : "bg-success"}`} style={{ width: `${Math.min(burden, 100)}%` }} />
      </div>
      <ResultRow label="Total Education Cost" value={formatINR(totalCost)} />

<p className="text-sm text-green-600">
  🎓 Scholarship Applied: ₹{scholarship.toLocaleString()}
</p>

<ResultRow label="Adjusted Loan Amount" value={formatINR(adjustedLoan)} />

<ResultRow label="Monthly EMI" value={formatINR(emi)} highlight />
    </div>
  );
}
