import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Search, MapPin, Trophy, ArrowLeft, Loader2 } from "lucide-react";

interface University {
  id: string;
  name: string;
  location: string | null;
  state: string | null;
  type: string | null;
  naac_grade: string | null;
  nirf_ranking: number | null;
  website: string | null;
  established: number | null;
  fees?: number;

  hostel_details?: {
    boys_available: boolean;
    girls_available: boolean;
    annual_fee: number;
  }[];

  courses?: {
    name: string;
    total_seats: number;
    general_seats: number;
    obc_seats: number;
    sc_seats: number;
    st_seats: number;
  }[];
}

const typeLabels: Record<string, string> = {
  iit: "IIT",
  nit: "NIT",
  iiit: "IIIT",
  state: "State",
  private: "Private",
  deemed: "Deemed",
  central: "Central",
};

const typeColors: Record<string, string> = {
  iit: "bg-primary/10 text-primary",
  nit: "bg-info/10 text-info",
  iiit: "bg-success/10 text-success",
  state: "bg-accent/10 text-accent-foreground",
  private: "bg-secondary text-secondary-foreground",
  deemed: "bg-warning/10 text-warning",
  central: "bg-primary/10 text-primary",
};

export default function UniversitiesPage() {
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [budget, setBudget] = useState("200000");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("");
  const [recommendedColleges, setRecommendedColleges] = useState<any[]>([]);

useEffect(() => {
  // 🔥 LOAD DATA FIRST
  loadUniversities();

  // 🔥 THEN subscribe to realtime updates
  const channel = supabase
    .channel("realtime-updates")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "hostel_details" },
      () => {
        loadUniversities();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, []);
const fetchRecommended = () => {
  fetch(`http://localhost:8000/recommend-colleges/${Number(budget)}`)
    .then(res => res.json())
    .then(data => {
      console.log("Recommended Colleges:", data);
      setRecommendedColleges(data);
    });
};
const loadUniversities = async () => {
  setLoading(true);

  const { data, error } = await supabase
    .from("universities")
    .select(`
      *,
      hostel_details (
        boys_available,
        girls_available,
        annual_fee
      ),
      courses (
        name,
        total_seats,
        general_seats,
        obc_seats,
        sc_seats,
        st_seats
      )
    `);

  console.log("DATA:", data);
  console.log("ERROR:", error);

  if (error) {
    console.error("Error fetching universities:", error);
    setLoading(false);
    return;
  }

  setUniversities(data || []);
  setLoading(false);
};

  const filtered = universities.filter((u) => {
    const matchesSearch =
      !searchQuery ||
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.state?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.location?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = !filterType || u.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
        <div className="container flex h-14 items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/dashboard"><ArrowLeft className="h-4 w-4 mr-1" />Dashboard</Link>
          </Button>
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            <span className="font-bold text-foreground">Universities</span>
          </div>
        </div>
      </nav>

      <div className="container py-8 space-y-6">
        {/* ✅ RECOMMENDED COLLEGES */}
  {recommendedColleges.length > 0 && (
    <div className="mb-6">
      <h2 className="text-lg font-semibold text-primary mb-3">
        🎯 Recommended Colleges for You
      </h2>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recommendedColleges.map((uni) => (
          <div
            key={uni.id}
            className="rounded-xl border border-primary/30 bg-primary/5 p-4"
          >
            <h3 className="font-semibold">{uni.name}</h3>
            <p className="text-xs text-muted-foreground">
              📍 {uni.location}
            </p>
            <p className="text-xs">
              🎓 {uni.category || uni.type}
            </p>
            <p className="text-xs">
              💰 ₹{uni.fees || "N/A"}
            </p>
          </div>
        ))}
      </div>
    </div>
  )}
        <div className="flex gap-2">
    <Input
  type="text"
  value={budget}
  onChange={(e) => {
    let val = e.target.value;

    // remove non-numbers
    val = val.replace(/\D/g, "");

    // remove leading zeros
    val = val.replace(/^0+/, "");

    setBudget(val);
  }}
  placeholder="Enter your budget"
/>
    <Button onClick={fetchRecommended}>
      Get Recommendation
    </Button>
  </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, state, or city..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={filterType === "" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType("")}
            >
              All
            </Button>
            {Object.entries(typeLabels).map(([key, label]) => (
              <Button
                key={key}
                variant={filterType === key ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterType(key)}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="font-medium text-foreground">No universities found</p>
            <p className="text-sm text-muted-foreground">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((uni) => (
              <div
                key={uni.id}
                className="rounded-xl border border-border bg-card p-5 card-shadow transition-all duration-300 hover:card-shadow-hover hover:-translate-y-0.5"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-foreground text-sm leading-snug pr-2">{uni.name}</h3>
                  {uni.type && (
                    <Badge variant="secondary" className={`shrink-0 text-xs ${typeColors[uni.type] ?? ""}`}>
                      {typeLabels[uni.type] ?? uni.type}
                    </Badge>
                  )}
                </div>
                <div className="space-y-1.5 text-xs text-muted-foreground">
                  {/* Hostel Info */}
{/* Hostel Info */}
<div className="mt-2 text-xs">
  <p>
  🎓 College Fees: ₹
  {uni.fees ? uni.fees.toLocaleString() : "N/A"}
</p>

 <p>
    🏠 Hostel:{" "}
    {uni.hostel_details?.[0]
      ? uni.hostel_details[0].boys_available || uni.hostel_details[0].girls_available
        ? "Available"
        : "Not Available"
      : "No Data"}
  </p>
</div>

{/* Admission Info */}
<div className="mt-2 text-xs">
  <p>
    🪑 Total Seats:{" "}
    {uni.courses?.[0]?.total_seats ?? "N/A"}
  </p>

  <p>
    📊 General:{" "}
    {uni.courses?.[0]?.general_seats ?? "N/A"}
  </p>

  <p>
    OBC:{" "}
    {uni.courses?.[0]?.obc_seats ?? "N/A"}
  </p>

  <p>
    SC/ST:{" "}
    {uni.courses?.[0]
      ? `${uni.courses[0].sc_seats}/${uni.courses[0].st_seats}`
      : "N/A"}
  </p>
</div>
                  {uni.location && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3 w-3" />
                      {uni.location}, {uni.state}
                    </div>
                  )}
                  {uni.nirf_ranking && (
                    <div className="flex items-center gap-1.5">
                      <Trophy className="h-3 w-3" />
                      NIRF Rank #{uni.nirf_ranking}
                    </div>
                  )}
                  {uni.naac_grade && (
                    <div>NAAC: {uni.naac_grade}</div>
                  )}
                </div>
                {uni.website && (
                  <a
                    href={uni.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-block text-xs text-primary hover:underline"
                  >
                    Visit Website →
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
