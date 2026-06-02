export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string
          phone: string
          grade: string
          class_name?: string | null
          church_name: string
          role: 'student' | 'admin'
          avatar_url: string | null
          total_xp: number
          current_level: number
          streak_days: number
          last_activity_date: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: Partial<Database['public']['Tables']['profiles']['Row']> & {
          id: string
          full_name: string
          phone: string
          grade: string
          church_name: string
        }
        Update: Partial<Database['public']['Tables']['profiles']['Row']>
        Relationships: []
      }
      weeks: {
        Row: {
          id: string
          title: string
          description: string | null
          week_number: number
          opens_at: string
          closes_at: string | null
          pdf_url: string | null
          pdf_filename: string | null
          xp_reward_full: number
          xp_reward_partial: number
          passing_score: number
          is_published: boolean
          show_answers_after_close: boolean
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: Partial<Database['public']['Tables']['weeks']['Row']> & {
          title: string
          week_number: number
          opens_at: string
        }
        Update: Partial<Database['public']['Tables']['weeks']['Row']>
        Relationships: []
      }
      exams: {
        Row: {
          id: string
          week_id: string
          title: string
          description: string | null
          time_limit_minutes: number | null
          opens_at: string | null
          closes_at: string | null
          xp_reward_full: number
          xp_reward_partial: number
          passing_score: number
          is_published: boolean
          display_order: number
          created_at: string
          updated_at: string
        }
        Insert: Partial<Database['public']['Tables']['exams']['Row']> & {
          week_id: string
          title: string
        }
        Update: Partial<Database['public']['Tables']['exams']['Row']>
        Relationships: []
      }
      questions: {
        Row: {
          id: string
          week_id: string
          exam_id?: string | null
          question_text: string
          question_type: 'multiple_choice' | 'true_false'
          options: Json
          correct_answer: string
          explanation: string | null
          points: number
          display_order: number
          created_at: string
        }
        Insert: Partial<Database['public']['Tables']['questions']['Row']> & {
          week_id: string
          question_text: string
          question_type: 'multiple_choice' | 'true_false'
          correct_answer: string
        }
        Update: Partial<Database['public']['Tables']['questions']['Row']>
        Relationships: []
      }
      exam_submissions: {
        Row: {
          id: string
          student_id: string
          week_id: string
          exam_id: string | null
          answers: Json
          score: number | null
          total_questions: number | null
          correct_count: number | null
          xp_earned: number
          started_at: string
          submitted_at: string | null
          is_graded: boolean
          can_retry: boolean
          attempt_number: number
        }
        Insert: Partial<Database['public']['Tables']['exam_submissions']['Row']> & {
          student_id: string
          week_id: string
          exam_id?: string | null
        }
        Update: Partial<Database['public']['Tables']['exam_submissions']['Row']>
        Relationships: []
      }
      badges: { Row: any; Insert: any; Update: any; Relationships: [] }
      student_badges: { Row: any; Insert: any; Update: any; Relationships: [] }
      xp_transactions: { Row: any; Insert: any; Update: any; Relationships: [] }
      notifications: { Row: any; Insert: any; Update: any; Relationships: [] }
      weekly_progress: { Row: any; Insert: any; Update: any; Relationships: [] }
    }
    Views: {
      questions_safe: {
        Row: {
          id: string
          week_id: string
          exam_id?: string | null
          question_text: string
          question_type: 'multiple_choice' | 'true_false'
          options: Json
          points: number
          display_order: number
          explanation: string | null
          correct_answer: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      increment_xp: {
        Args: {
          p_student_id: string
          p_xp: number
          p_week_id: string | null
        }
        Returns: void
      }
      update_streak: {
        Args: { p_student_id: string }
        Returns: void
      }
    }
  }
}
