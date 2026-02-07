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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      account_setup_tokens: {
        Row: {
          created_at: string
          email: string
          expires_at: string
          id: string
          token: string
          used: boolean
          used_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          expires_at: string
          id?: string
          token: string
          used?: boolean
          used_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          token?: string
          used?: boolean
          used_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          ip_address: unknown
          new_data: Json | null
          old_data: Json | null
          record_id: string | null
          table_name: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          ip_address?: unknown
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          ip_address?: unknown
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author_id: string | null
          author_name: string | null
          canonical_url: string | null
          category: string | null
          content: string
          created_at: string | null
          estimated_word_count: number | null
          excerpt: string | null
          external_links: Json | null
          faq_data: Json | null
          featured_image_url: string | null
          id: string
          is_featured: boolean | null
          keywords: string[] | null
          language: string | null
          meta_description: string | null
          og_image_url: string | null
          published_at: string | null
          read_time_minutes: number | null
          related_post_ids: string[] | null
          slug: string
          status: Database["public"]["Enums"]["post_status"] | null
          structured_data: Json | null
          tags: string[] | null
          title: string
          updated_at: string | null
          view_count: number | null
        }
        Insert: {
          author_id?: string | null
          author_name?: string | null
          canonical_url?: string | null
          category?: string | null
          content: string
          created_at?: string | null
          estimated_word_count?: number | null
          excerpt?: string | null
          external_links?: Json | null
          faq_data?: Json | null
          featured_image_url?: string | null
          id?: string
          is_featured?: boolean | null
          keywords?: string[] | null
          language?: string | null
          meta_description?: string | null
          og_image_url?: string | null
          published_at?: string | null
          read_time_minutes?: number | null
          related_post_ids?: string[] | null
          slug: string
          status?: Database["public"]["Enums"]["post_status"] | null
          structured_data?: Json | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          view_count?: number | null
        }
        Update: {
          author_id?: string | null
          author_name?: string | null
          canonical_url?: string | null
          category?: string | null
          content?: string
          created_at?: string | null
          estimated_word_count?: number | null
          excerpt?: string | null
          external_links?: Json | null
          faq_data?: Json | null
          featured_image_url?: string | null
          id?: string
          is_featured?: boolean | null
          keywords?: string[] | null
          language?: string | null
          meta_description?: string | null
          og_image_url?: string | null
          published_at?: string | null
          read_time_minutes?: number | null
          related_post_ids?: string[] | null
          slug?: string
          status?: Database["public"]["Enums"]["post_status"] | null
          structured_data?: Json | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          view_count?: number | null
        }
        Relationships: []
      }
      early_access_sessions: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          ip_address: unknown
          session_token: string
          user_agent: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at?: string
          id?: string
          ip_address?: unknown
          session_token?: string
          user_agent?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          ip_address?: unknown
          session_token?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      failed_emails: {
        Row: {
          created_at: string
          email_type: string
          error_code: string | null
          error_message: string
          id: string
          last_retry_at: string | null
          order_id: string | null
          recipient_email: string
          resolved_at: string | null
          retry_count: number
          status: string
          subject: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email_type: string
          error_code?: string | null
          error_message: string
          id?: string
          last_retry_at?: string | null
          order_id?: string | null
          recipient_email: string
          resolved_at?: string | null
          retry_count?: number
          status?: string
          subject: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email_type?: string
          error_code?: string | null
          error_message?: string
          id?: string
          last_retry_at?: string | null
          order_id?: string | null
          recipient_email?: string
          resolved_at?: string | null
          retry_count?: number
          status?: string
          subject?: string
          user_id?: string | null
        }
        Relationships: []
      }
      idea_rotation_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: number
          rotated_at: string
          status: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: number
          rotated_at?: string
          status: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: number
          rotated_at?: string
          status?: string
        }
        Relationships: []
      }
      ideas: {
        Row: {
          ad_creatives: Json | null
          Amazon_data: Json | null
          biz_structure: string | null
          branding: string | null
          community_signal_reasoning_summary: string | null
          community_signal_score: number | null
          community_signals_full_analysis: Json | null
          Date: string | null
          date_published: string | null
          description: string | null
          email_funnel_system: Json | null
          execution_plan: string | null
          feasibility_reasoning_full_analysis: Json | null
          feasibility_reasoning_summary: string | null
          feasibilty_score: number | null
          id: number
          IdeaType: string | null
          industry: string | null
          is_idea_of_the_day: boolean | null
          MVP_Building_Prompt: string | null
          news_data: Json | null
          overall_opportunity_score: number | null
          overall_oppurtunity_full_analysis: Json | null
          overall_oppurtunity_reasoning_summary: string | null
          pain_score: number | null
          papu: string | null
          podcast_duration: number | null
          podcast_file_size: number | null
          podcast_url: string | null
          podcast_url_hindi: string | null
          reddit_data: Json | null
          reddit_Query: string | null
          revenue_model: string | null
          Revenue_potential: string | null
          revenue_potential_summary: string | null
          "status for wokflow": string | null
          structure_reason: string | null
          tam_summary: string | null
          tam_value: string | null
          timing_score: number | null
          title: string
          trend_data_1: Json | null
          trend_query_1: string | null
          trend_query_2: string | null
          trend_query_3: string | null
          trend_query_4: string | null
          trend_query_5: string | null
          trend_reasoning_full_Analysis: Json | null
          trends_reasoning_summary: string | null
          trends_score: number | null
          type: string | null
          urgent: string | null
          user_personas: Json | null
          why_now_full_analysis: Json | null
          why_now_reasoning_summary: string | null
          youtube_data: Json | null
        }
        Insert: {
          ad_creatives?: Json | null
          Amazon_data?: Json | null
          biz_structure?: string | null
          branding?: string | null
          community_signal_reasoning_summary?: string | null
          community_signal_score?: number | null
          community_signals_full_analysis?: Json | null
          Date?: string | null
          date_published?: string | null
          description?: string | null
          email_funnel_system?: Json | null
          execution_plan?: string | null
          feasibility_reasoning_full_analysis?: Json | null
          feasibility_reasoning_summary?: string | null
          feasibilty_score?: number | null
          id?: number
          IdeaType?: string | null
          industry?: string | null
          is_idea_of_the_day?: boolean | null
          MVP_Building_Prompt?: string | null
          news_data?: Json | null
          overall_opportunity_score?: number | null
          overall_oppurtunity_full_analysis?: Json | null
          overall_oppurtunity_reasoning_summary?: string | null
          pain_score?: number | null
          papu?: string | null
          podcast_duration?: number | null
          podcast_file_size?: number | null
          podcast_url?: string | null
          podcast_url_hindi?: string | null
          reddit_data?: Json | null
          reddit_Query?: string | null
          revenue_model?: string | null
          Revenue_potential?: string | null
          revenue_potential_summary?: string | null
          "status for wokflow"?: string | null
          structure_reason?: string | null
          tam_summary?: string | null
          tam_value?: string | null
          timing_score?: number | null
          title: string
          trend_data_1?: Json | null
          trend_query_1?: string | null
          trend_query_2?: string | null
          trend_query_3?: string | null
          trend_query_4?: string | null
          trend_query_5?: string | null
          trend_reasoning_full_Analysis?: Json | null
          trends_reasoning_summary?: string | null
          trends_score?: number | null
          type?: string | null
          urgent?: string | null
          user_personas?: Json | null
          why_now_full_analysis?: Json | null
          why_now_reasoning_summary?: string | null
          youtube_data?: Json | null
        }
        Update: {
          ad_creatives?: Json | null
          Amazon_data?: Json | null
          biz_structure?: string | null
          branding?: string | null
          community_signal_reasoning_summary?: string | null
          community_signal_score?: number | null
          community_signals_full_analysis?: Json | null
          Date?: string | null
          date_published?: string | null
          description?: string | null
          email_funnel_system?: Json | null
          execution_plan?: string | null
          feasibility_reasoning_full_analysis?: Json | null
          feasibility_reasoning_summary?: string | null
          feasibilty_score?: number | null
          id?: number
          IdeaType?: string | null
          industry?: string | null
          is_idea_of_the_day?: boolean | null
          MVP_Building_Prompt?: string | null
          news_data?: Json | null
          overall_opportunity_score?: number | null
          overall_oppurtunity_full_analysis?: Json | null
          overall_oppurtunity_reasoning_summary?: string | null
          pain_score?: number | null
          papu?: string | null
          podcast_duration?: number | null
          podcast_file_size?: number | null
          podcast_url?: string | null
          podcast_url_hindi?: string | null
          reddit_data?: Json | null
          reddit_Query?: string | null
          revenue_model?: string | null
          Revenue_potential?: string | null
          revenue_potential_summary?: string | null
          "status for wokflow"?: string | null
          structure_reason?: string | null
          tam_summary?: string | null
          tam_value?: string | null
          timing_score?: number | null
          title?: string
          trend_data_1?: Json | null
          trend_query_1?: string | null
          trend_query_2?: string | null
          trend_query_3?: string | null
          trend_query_4?: string | null
          trend_query_5?: string | null
          trend_reasoning_full_Analysis?: Json | null
          trends_reasoning_summary?: string | null
          trends_score?: number | null
          type?: string | null
          urgent?: string | null
          user_personas?: Json | null
          why_now_full_analysis?: Json | null
          why_now_reasoning_summary?: string | null
          youtube_data?: Json | null
        }
        Relationships: []
      }
      orders: {
        Row: {
          actual_amount_paid: number | null
          amount: number
          bank_ref_no: string | null
          billing_email: string | null
          billing_name: string | null
          billing_tel: string | null
          card_name: string | null
          ccavenue_response: Json | null
          completed_at: string | null
          created_at: string
          currency: string
          failure_message: string | null
          id: string
          order_id: string
          order_status: string | null
          payment_mode: string | null
          plan_type: string
          status: string
          status_code: string | null
          status_message: string | null
          tracking_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          actual_amount_paid?: number | null
          amount: number
          bank_ref_no?: string | null
          billing_email?: string | null
          billing_name?: string | null
          billing_tel?: string | null
          card_name?: string | null
          ccavenue_response?: Json | null
          completed_at?: string | null
          created_at?: string
          currency?: string
          failure_message?: string | null
          id?: string
          order_id: string
          order_status?: string | null
          payment_mode?: string | null
          plan_type: string
          status?: string
          status_code?: string | null
          status_message?: string | null
          tracking_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          actual_amount_paid?: number | null
          amount?: number
          bank_ref_no?: string | null
          billing_email?: string | null
          billing_name?: string | null
          billing_tel?: string | null
          card_name?: string | null
          ccavenue_response?: Json | null
          completed_at?: string | null
          created_at?: string
          currency?: string
          failure_message?: string | null
          id?: string
          order_id?: string
          order_status?: string | null
          payment_mode?: string | null
          plan_type?: string
          status?: string
          status_code?: string | null
          status_message?: string | null
          tracking_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      pending_research_requests: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          idea_description: string
          idea_title: string
          order_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string
          id?: string
          idea_description: string
          idea_title: string
          order_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          idea_description?: string
          idea_title?: string
          order_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pending_research_requests_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "orders"
            referencedColumns: ["order_id"]
          },
        ]
      }
      podcast_analytics: {
        Row: {
          created_at: string | null
          event_type: string
          id: string
          idea_id: number | null
          ip_address: unknown
          progress_seconds: number | null
          session_id: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_type: string
          id?: string
          idea_id?: number | null
          ip_address?: unknown
          progress_seconds?: number | null
          session_id: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_type?: string
          id?: string
          idea_id?: number | null
          ip_address?: unknown
          progress_seconds?: number | null
          session_id?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "podcast_analytics_idea_id_fkey"
            columns: ["idea_id"]
            isOneToOne: false
            referencedRelation: "ideas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "podcast_analytics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_limits: {
        Row: {
          action_type: string
          attempts: number | null
          blocked_until: string | null
          created_at: string
          id: string
          ip_address: unknown
          updated_at: string
          user_id: string | null
          window_start: string
        }
        Insert: {
          action_type: string
          attempts?: number | null
          blocked_until?: string | null
          created_at?: string
          id?: string
          ip_address?: unknown
          updated_at?: string
          user_id?: string | null
          window_start?: string
        }
        Update: {
          action_type?: string
          attempts?: number | null
          blocked_until?: string | null
          created_at?: string
          id?: string
          ip_address?: unknown
          updated_at?: string
          user_id?: string | null
          window_start?: string
        }
        Relationships: []
      }
      user_reports: {
        Row: {
          ad_creatives_generator_prompt: string | null
          brand_package_generator_prompt: string | null
          community_signal_full_analysis: string | null
          community_signal_score: number | null
          community_signal_summary: string | null
          created_at: string
          email_funnel_generator_prompt: string | null
          execution_plan: Json | null
          feasibility_full_analysis: string | null
          feasibility_score: number | null
          feasibility_summary: string | null
          id: string
          idea_description: string | null
          idea_title: string | null
          mvp_builder_prompt: string | null
          news_data: Json | null
          news_query: string | null
          opportunity_score: number | null
          order_id: string | null
          overall_full_analysis: string | null
          overall_summary: string | null
          pain_full_analysis: string | null
          pain_score: number | null
          pain_summary: string | null
          payment_status: string | null
          podcast_url: string | null
          podcast_url_hindi: string | null
          reddit_data: Json | null
          reddit_query: string | null
          revenue_plan: Json | null
          Revenue_potential: string | null
          revenue_potential_summary: string | null
          status: string | null
          tam_summary: string | null
          tam_value: string | null
          trends_data: Json | null
          trends_full_analysis: string | null
          trends_query: string | null
          trends_score: number | null
          trends_summary: string | null
          user_id: string
          user_persona_generator_prompt: string | null
          why_now_full_analysis: string | null
          why_now_score: number | null
          why_now_summary: string | null
          youtube_data: Json | null
          youtube_query: string | null
        }
        Insert: {
          ad_creatives_generator_prompt?: string | null
          brand_package_generator_prompt?: string | null
          community_signal_full_analysis?: string | null
          community_signal_score?: number | null
          community_signal_summary?: string | null
          created_at?: string
          email_funnel_generator_prompt?: string | null
          execution_plan?: Json | null
          feasibility_full_analysis?: string | null
          feasibility_score?: number | null
          feasibility_summary?: string | null
          id?: string
          idea_description?: string | null
          idea_title?: string | null
          mvp_builder_prompt?: string | null
          news_data?: Json | null
          news_query?: string | null
          opportunity_score?: number | null
          order_id?: string | null
          overall_full_analysis?: string | null
          overall_summary?: string | null
          pain_full_analysis?: string | null
          pain_score?: number | null
          pain_summary?: string | null
          payment_status?: string | null
          podcast_url?: string | null
          podcast_url_hindi?: string | null
          reddit_data?: Json | null
          reddit_query?: string | null
          revenue_plan?: Json | null
          Revenue_potential?: string | null
          revenue_potential_summary?: string | null
          status?: string | null
          tam_summary?: string | null
          tam_value?: string | null
          trends_data?: Json | null
          trends_full_analysis?: string | null
          trends_query?: string | null
          trends_score?: number | null
          trends_summary?: string | null
          user_id: string
          user_persona_generator_prompt?: string | null
          why_now_full_analysis?: string | null
          why_now_score?: number | null
          why_now_summary?: string | null
          youtube_data?: Json | null
          youtube_query?: string | null
        }
        Update: {
          ad_creatives_generator_prompt?: string | null
          brand_package_generator_prompt?: string | null
          community_signal_full_analysis?: string | null
          community_signal_score?: number | null
          community_signal_summary?: string | null
          created_at?: string
          email_funnel_generator_prompt?: string | null
          execution_plan?: Json | null
          feasibility_full_analysis?: string | null
          feasibility_score?: number | null
          feasibility_summary?: string | null
          id?: string
          idea_description?: string | null
          idea_title?: string | null
          mvp_builder_prompt?: string | null
          news_data?: Json | null
          news_query?: string | null
          opportunity_score?: number | null
          order_id?: string | null
          overall_full_analysis?: string | null
          overall_summary?: string | null
          pain_full_analysis?: string | null
          pain_score?: number | null
          pain_summary?: string | null
          payment_status?: string | null
          podcast_url?: string | null
          podcast_url_hindi?: string | null
          reddit_data?: Json | null
          reddit_query?: string | null
          revenue_plan?: Json | null
          Revenue_potential?: string | null
          revenue_potential_summary?: string | null
          status?: string | null
          tam_summary?: string | null
          tam_value?: string | null
          trends_data?: Json | null
          trends_full_analysis?: string | null
          trends_query?: string | null
          trends_score?: number | null
          trends_summary?: string | null
          user_id?: string
          user_persona_generator_prompt?: string | null
          why_now_full_analysis?: string | null
          why_now_score?: number | null
          why_now_summary?: string | null
          youtube_data?: Json | null
          youtube_query?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_user_reports_order"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["order_id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          account_status: string | null
          ccavenue_customer_id: string | null
          created_at: string | null
          email: string | null
          has_completed_onboarding: boolean | null
          id: string
          Newsletter: boolean | null
          onboarding_completed_at: string | null
          onboarding_plan_choice: string | null
          razorpay_customer_id: string | null
          subscription_end_date: string | null
          subscription_plan: string | null
          subscription_status: string | null
        }
        Insert: {
          account_status?: string | null
          ccavenue_customer_id?: string | null
          created_at?: string | null
          email?: string | null
          has_completed_onboarding?: boolean | null
          id: string
          Newsletter?: boolean | null
          onboarding_completed_at?: string | null
          onboarding_plan_choice?: string | null
          razorpay_customer_id?: string | null
          subscription_end_date?: string | null
          subscription_plan?: string | null
          subscription_status?: string | null
        }
        Update: {
          account_status?: string | null
          ccavenue_customer_id?: string | null
          created_at?: string | null
          email?: string | null
          has_completed_onboarding?: boolean | null
          id?: string
          Newsletter?: boolean | null
          onboarding_completed_at?: string | null
          onboarding_plan_choice?: string | null
          razorpay_customer_id?: string | null
          subscription_end_date?: string | null
          subscription_plan?: string | null
          subscription_status?: string | null
        }
        Relationships: []
      }
      waitlist: {
        Row: {
          created_at: string | null
          email: string
          id: string
          name: string
          phone_number: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          name: string
          phone_number: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          phone_number?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_rate_limit: {
        Args: {
          _action_type: string
          _ip_address?: unknown
          _max_attempts?: number
          _user_id: string
          _window_minutes?: number
        }
        Returns: boolean
      }
      check_user_research_eligibility: {
        Args: { p_user_id: string }
        Returns: Json
      }
      cleanup_expired_pending_requests: { Args: never; Returns: undefined }
      cleanup_expired_setup_tokens: { Args: never; Returns: number }
      has_admin_role: { Args: { _user_id: string }; Returns: boolean }
      increment_blog_view: { Args: { post_id: string }; Returns: undefined }
      link_guest_order_to_user: {
        Args: { p_order_id: string; p_user_id: string }
        Returns: boolean
      }
      log_audit_event: {
        Args: {
          _action: string
          _new_data?: Json
          _old_data?: Json
          _record_id?: string
          _table_name: string
          _user_id: string
        }
        Returns: undefined
      }
      rotate_idea_of_the_day: { Args: never; Returns: undefined }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      post_status: "draft" | "published" | "archived"
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
    Enums: {
      app_role: ["admin", "moderator", "user"],
      post_status: ["draft", "published", "archived"],
    },
  },
} as const
