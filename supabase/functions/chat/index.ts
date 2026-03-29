import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, profileData } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Build context from profile data
    let profileContext = "";
    if (profileData) {
      const p = profileData;
      profileContext = `
## Student Profile
- Name: ${p.full_name || "Not provided"}
- Category: ${p.category || "Not provided"}
- Gender: ${p.gender || "Not provided"}
- State: ${p.state || "Not provided"}
- 10th Board: ${p.tenth_board || "N/A"}, Percentage: ${p.tenth_percentage ?? "N/A"}%
- 12th Board: ${p.twelfth_board || "N/A"}, Percentage: ${p.twelfth_percentage ?? "N/A"}%
- Stream: ${p.stream || "Not provided"}
- Family Income: ₹${p.family_income ?? "Not provided"}
- Savings: ₹${p.savings ?? "Not provided"}
`;
    }

    // Fetch contextual data from database
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const sb = createClient(supabaseUrl, supabaseKey);

    const [
      { data: universities },
      { data: exams },
      { data: loans },
      { data: scholarships },
      { data: cutoffs },
    ] = await Promise.all([
      sb.from("universities").select("name, type, state, nirf_ranking, naac_grade"),
      sb.from("entrance_exams").select("name, conducting_body, eligibility, exam_date"),
      sb.from("loans").select("bank_name, loan_name, interest_rate, max_amount, moratorium_months"),
      sb.from("scholarships").select("name, provider, amount, income_limit, categories, eligibility"),
      sb.from("university_exam_cutoffs").select("university_id, exam_id, general_cutoff, obc_cutoff, sc_cutoff, st_cutoff, ews_cutoff, year").limit(50),
    ]);

    const systemPrompt = `You are AdmitKaro AI — an expert counselor for Indian university admissions and education finance. You have deep knowledge of IITs, NITs, IIITs, state and private universities across India.

## Your Capabilities
- Admission prediction based on rank, category, gender, state
- University and course recommendations
- Education loan comparison and EMI guidance
- Scholarship eligibility checking
- Seat matrix and reservation details
- Cut-off analysis across categories

## Current Database Context
Universities: ${JSON.stringify(universities?.slice(0, 20))}
Entrance Exams: ${JSON.stringify(exams)}
Loan Options: ${JSON.stringify(loans)}
Scholarships: ${JSON.stringify(scholarships)}
Recent Cutoffs: ${JSON.stringify(cutoffs?.slice(0, 20))}

${profileContext}

## Rules
1. Always answer in context of Indian education system
2. Use the student's profile data when available for personalized answers
3. For admission predictions, consider the student's category, rank, and the university cutoffs
4. Provide specific, actionable advice with data
5. When recommending loans/scholarships, mention eligibility clearly
6. Format responses with markdown for readability
7. If you don't have enough info, ask the student clarifying questions
8. Always explain WHY you're making a recommendation (Explainable AI)
9. Be encouraging but realistic about admission chances
10. Mention official links when relevant`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds in Settings." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
