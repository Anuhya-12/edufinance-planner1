export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      courses: {
        Row: {
          ai_quota_seats: number | null
          annual_fee: number | null
          created_at: string
          duration_years: number | null
          ews_seats: number | null
          general_seats: number | null
          id: string
          name: string
          obc_seats: number | null
          sc_seats: number | null
          specialization: string | null
          st_seats: number | null
          state_quota_seats: number | null
          total_seats: number | null
          university_id: string
        }
        Insert: {
          ai_quota_seats?: number | null
          annual_fee?: number | null
          created_at?: string
          duration_years?: number | null
          ews_seats?: number | null
          general_seats?: number | null
          id?: string
          name: string
          obc_seats?: number | null
          sc_seats?: number | null
          specialization?: string | null
          st_seats?: number | null
          state_quota_seats?: number | null
          total_seats?: number | null
          university_id: string
        }
        Update: {
          ai_quota_seats?: number | null
          annual_fee?: number | null
          created_at?: string
          duration_years?: number | null
          ews_seats?: number | null
          general_seats?: number | null
          id?: string
          name?: string
          obc_seats?: number | null
          sc_seats?: number | null
          specialization?: string | null
          st_seats?: number | null
          state_quota_seats?: number | null
          total_seats?: number | null
          university_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "courses_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
        ]
      }
      entrance_exams: {
        Row: {
          application_deadline: string | null
          conducting_body: string | null
          created_at: string
          eligibility: string | null
          exam_date: string | null
          id: string
          name: string
          website: string | null
        }
        Insert: {
          application_deadline?: string | null
          conducting_body?: string | null
          created_at?: string
          eligibility?: string | null
          exam_date?: string | null
          id?: string
          name: string
          website?: string | null
        }
        Update: {
          application_deadline?: string | null
          conducting_body?: string | null
          created_at?: string
          eligibility?: string | null
          exam_date?: string | null
          id?: string
          name?: string
          website?: string | null
        }
        Relationships: []
      }
      exam_scores: {
        Row: {
          created_at: string
          exam_id: string
          id: string
          percentile: number | null
          rank: number | null
          score: number | null
          user_id: string
          year: number | null
        }
        Insert: {
          created_at?: string
          exam_id: string
          id?: string
          percentile?: number | null
          rank?: number | null
          score?: number | null
          user_id: string
          year?: number | null
        }
        Update: {
          created_at?: string
          exam_id?: string
          id?: string
          percentile?: number | null
          rank?: number | null
          score?: number | null
          user_id?: string
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "exam_scores_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "entrance_exams"
            referencedColumns: ["id"]
          },
        ]
      }
      hostel_details: {
        Row: {
          annual_fee: number | null
          boys_available: boolean | null
          created_at: string
          facilities: string[] | null
          girls_available: boolean | null
          id: string
          university_id: string
        }
        Insert: {
          annual_fee?: number | null
          boys_available?: boolean | null
          created_at?: string
          facilities?: string[] | null
          girls_available?: boolean | null
          id?: string
          university_id: string
        }
        Update: {
          annual_fee?: number | null
          boys_available?: boolean | null
          created_at?: string
          facilities?: string[] | null
          girls_available?: boolean | null
          id?: string
          university_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hostel_details_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
        ]
      }
      loans: {
        Row: {
          bank_name: string
          created_at: string
          id: string
          interest_rate: number | null
          loan_name: string | null
          max_amount: number | null
          max_tenure_years: number | null
          min_tenure_years: number | null
          moratorium_months: number | null
          official_link: string | null
          processing_fee: string | null
          required_documents: string[] | null
        }
        Insert: {
          bank_name: string
          created_at?: string
          id?: string
          interest_rate?: number | null
          loan_name?: string | null
          max_amount?: number | null
          max_tenure_years?: number | null
          min_tenure_years?: number | null
          moratorium_months?: number | null
          official_link?: string | null
          processing_fee?: string | null
          required_documents?: string[] | null
        }
        Update: {
          bank_name?: string
          created_at?: string
          id?: string
          interest_rate?: number | null
          loan_name?: string | null
          max_amount?: number | null
          max_tenure_years?: number | null
          min_tenure_years?: number | null
          moratorium_months?: number | null
          official_link?: string | null
          processing_fee?: string | null
          required_documents?: string[] | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          category: string | null
          created_at: string
          dob: string | null
          existing_loans: number | null
          family_income: number | null
          full_name: string | null
          gender: string | null
          id: string
          savings: number | null
          state: string | null
          stream: string | null
          tenth_board: string | null
          tenth_percentage: number | null
          twelfth_board: string | null
          twelfth_percentage: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          dob?: string | null
          existing_loans?: number | null
          family_income?: number | null
          full_name?: string | null
          gender?: string | null
          id?: string
          savings?: number | null
          state?: string | null
          stream?: string | null
          tenth_board?: string | null
          tenth_percentage?: number | null
          twelfth_board?: string | null
          twelfth_percentage?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          dob?: string | null
          existing_loans?: number | null
          family_income?: number | null
          full_name?: string | null
          gender?: string | null
          id?: string
          savings?: number | null
          state?: string | null
          stream?: string | null
          tenth_board?: string | null
          tenth_percentage?: number | null
          twelfth_board?: string | null
          twelfth_percentage?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      scholarships: {
        Row: {
          amount: number | null
          categories: string[] | null
          created_at: string
          deadline: string | null
          eligibility: string | null
          id: string
          income_limit: number | null
          name: string
          official_link: string | null
          provider: string | null
          required_documents: string[] | null
          type: string | null
        }
        Insert: {
          amount?: number | null
          categories?: string[] | null
          created_at?: string
          deadline?: string | null
          eligibility?: string | null
          id?: string
          income_limit?: number | null
          name: string
          official_link?: string | null
          provider?: string | null
          required_documents?: string[] | null
          type?: string | null
        }
        Update: {
          amount?: number | null
          categories?: string[] | null
          created_at?: string
          deadline?: string | null
          eligibility?: string | null
          id?: string
          income_limit?: number | null
          name?: string
          official_link?: string | null
          provider?: string | null
          required_documents?: string[] | null
          type?: string | null
        }
        Relationships: []
      }
      search_history: {
        Row: {
          created_at: string
          id: string
          result_data: Json | null
          search_query: string | null
          search_type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          result_data?: Json | null
          search_query?: string | null
          search_type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          result_data?: Json | null
          search_query?: string | null
          search_type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      universities: {
        Row: {
          created_at: string
          description: string | null
          established: number | null
          id: string
          location: string | null
          logo_url: string | null
          naac_grade: string | null
          name: string
          nirf_ranking: number | null
          state: string | null
          type: string | null
          website: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          established?: number | null
          id?: string
          location?: string | null
          logo_url?: string | null
          naac_grade?: string | null
          name: string
          nirf_ranking?: number | null
          state?: string | null
          type?: string | null
          website?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          established?: number | null
          id?: string
          location?: string | null
          logo_url?: string | null
          naac_grade?: string | null
          name?: string
          nirf_ranking?: number | null
          state?: string | null
          type?: string | null
          website?: string | null
        }
        Relationships: []
      }
      university_exam_cutoffs: {
        Row: {
          course_id: string | null
          created_at: string
          ews_cutoff: number | null
          exam_id: string
          general_cutoff: number | null
          id: string
          obc_cutoff: number | null
          sc_cutoff: number | null
          st_cutoff: number | null
          university_id: string
          year: number | null
        }
        Insert: {
          course_id?: string | null
          created_at?: string
          ews_cutoff?: number | null
          exam_id: string
          general_cutoff?: number | null
          id?: string
          obc_cutoff?: number | null
          sc_cutoff?: number | null
          st_cutoff?: number | null
          university_id: string
          year?: number | null
        }
        Update: {
          course_id?: string | null
          created_at?: string
          ews_cutoff?: number | null
          exam_id?: string
          general_cutoff?: number | null
          id?: string
          obc_cutoff?: number | null
          sc_cutoff?: number | null
          st_cutoff?: number | null
          university_id?: string
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "university_exam_cutoffs_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "university_exam_cutoffs_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "entrance_exams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "university_exam_cutoffs_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
