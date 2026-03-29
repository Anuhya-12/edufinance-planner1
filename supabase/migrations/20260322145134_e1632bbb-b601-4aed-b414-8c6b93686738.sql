
-- Timestamp update function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  dob DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  category TEXT CHECK (category IN ('general', 'obc', 'sc', 'st', 'ews')),
  state TEXT,
  tenth_board TEXT,
  tenth_percentage NUMERIC(5,2),
  twelfth_board TEXT,
  twelfth_percentage NUMERIC(5,2),
  stream TEXT CHECK (stream IN ('science', 'commerce', 'arts')),
  family_income NUMERIC(12,2),
  savings NUMERIC(12,2),
  existing_loans NUMERIC(12,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Universities
CREATE TABLE public.universities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location TEXT,
  state TEXT,
  type TEXT CHECK (type IN ('iit', 'nit', 'iiit', 'state', 'private', 'deemed', 'central')),
  naac_grade TEXT,
  nirf_ranking INTEGER,
  website TEXT,
  established INTEGER,
  description TEXT,
  logo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.universities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Universities are publicly readable" ON public.universities FOR SELECT USING (true);

-- Courses
CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id UUID NOT NULL REFERENCES public.universities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  specialization TEXT,
  duration_years INTEGER DEFAULT 4,
  annual_fee NUMERIC(10,2),
  total_seats INTEGER,
  general_seats INTEGER,
  obc_seats INTEGER,
  sc_seats INTEGER,
  st_seats INTEGER,
  ews_seats INTEGER,
  state_quota_seats INTEGER,
  ai_quota_seats INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Courses are publicly readable" ON public.courses FOR SELECT USING (true);

-- Entrance Exams
CREATE TABLE public.entrance_exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  conducting_body TEXT,
  eligibility TEXT,
  exam_date TEXT,
  application_deadline TEXT,
  website TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.entrance_exams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Exams are publicly readable" ON public.entrance_exams FOR SELECT USING (true);

-- University-Exam link with cutoffs
CREATE TABLE public.university_exam_cutoffs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id UUID NOT NULL REFERENCES public.universities(id) ON DELETE CASCADE,
  exam_id UUID NOT NULL REFERENCES public.entrance_exams(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  general_cutoff NUMERIC(8,2),
  obc_cutoff NUMERIC(8,2),
  sc_cutoff NUMERIC(8,2),
  st_cutoff NUMERIC(8,2),
  ews_cutoff NUMERIC(8,2),
  year INTEGER DEFAULT 2024,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.university_exam_cutoffs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Cutoffs are publicly readable" ON public.university_exam_cutoffs FOR SELECT USING (true);

-- Hostel Details
CREATE TABLE public.hostel_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id UUID NOT NULL REFERENCES public.universities(id) ON DELETE CASCADE,
  boys_available BOOLEAN DEFAULT true,
  girls_available BOOLEAN DEFAULT true,
  annual_fee NUMERIC(10,2),
  facilities TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.hostel_details ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Hostel details are publicly readable" ON public.hostel_details FOR SELECT USING (true);

-- Loans
CREATE TABLE public.loans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_name TEXT NOT NULL,
  loan_name TEXT,
  interest_rate NUMERIC(5,2),
  max_amount NUMERIC(12,2),
  min_tenure_years INTEGER,
  max_tenure_years INTEGER,
  moratorium_months INTEGER,
  processing_fee TEXT,
  required_documents TEXT[],
  official_link TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Loans are publicly readable" ON public.loans FOR SELECT USING (true);

-- Scholarships
CREATE TABLE public.scholarships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  provider TEXT,
  type TEXT CHECK (type IN ('central_govt', 'state_govt', 'private', 'institutional')),
  eligibility TEXT,
  income_limit NUMERIC(10,2),
  amount NUMERIC(10,2),
  deadline TEXT,
  required_documents TEXT[],
  official_link TEXT,
  categories TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.scholarships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Scholarships are publicly readable" ON public.scholarships FOR SELECT USING (true);

-- Entrance Exam Scores (user-specific)
CREATE TABLE public.exam_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exam_id UUID NOT NULL REFERENCES public.entrance_exams(id) ON DELETE CASCADE,
  score NUMERIC(10,2),
  rank INTEGER,
  percentile NUMERIC(5,2),
  year INTEGER DEFAULT 2024,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.exam_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own scores" ON public.exam_scores FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own scores" ON public.exam_scores FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own scores" ON public.exam_scores FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own scores" ON public.exam_scores FOR DELETE USING (auth.uid() = user_id);

-- Search History
CREATE TABLE public.search_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  search_type TEXT CHECK (search_type IN ('university', 'course', 'prediction', 'loan', 'scholarship')),
  search_query TEXT,
  result_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.search_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own history" ON public.search_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own history" ON public.search_history FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own history" ON public.search_history FOR DELETE USING (auth.uid() = user_id);
