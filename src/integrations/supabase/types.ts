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
      churn_predictions: {
        Row: {
          avg_transfer_amount: number | null
          churn_probability: number
          created_at: string
          days_since_last_transfer: number | null
          id: string
          intervention_suggested: string | null
          key_factors: Json
          kyc_completion_status: string | null
          last_complaint_date: string | null
          predicted_churn_date: string | null
          risk_level: string
          support_tickets_count: number | null
          total_transfers: number | null
          total_volume_sent: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avg_transfer_amount?: number | null
          churn_probability: number
          created_at?: string
          days_since_last_transfer?: number | null
          id?: string
          intervention_suggested?: string | null
          key_factors: Json
          kyc_completion_status?: string | null
          last_complaint_date?: string | null
          predicted_churn_date?: string | null
          risk_level: string
          support_tickets_count?: number | null
          total_transfers?: number | null
          total_volume_sent?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avg_transfer_amount?: number | null
          churn_probability?: number
          created_at?: string
          days_since_last_transfer?: number | null
          id?: string
          intervention_suggested?: string | null
          key_factors?: Json
          kyc_completion_status?: string | null
          last_complaint_date?: string | null
          predicted_churn_date?: string | null
          risk_level?: string
          support_tickets_count?: number | null
          total_transfers?: number | null
          total_volume_sent?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      company_config: {
        Row: {
          brand_colors: Json | null
          created_at: string | null
          id: string
          logo_url: string | null
          name: string
          system_prompt: string
          updated_at: string | null
          voice_tone: string
        }
        Insert: {
          brand_colors?: Json | null
          created_at?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          system_prompt?: string
          updated_at?: string | null
          voice_tone?: string
        }
        Update: {
          brand_colors?: Json | null
          created_at?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          system_prompt?: string
          updated_at?: string | null
          voice_tone?: string
        }
        Relationships: []
      }
      conversation_analytics: {
        Row: {
          affected_journey_stage: string | null
          conversation_id: string | null
          conversation_type: string
          created_at: string
          id: string
          issue_category: string
          metadata: Json | null
          priority_level: string
          resolution_status: string
          sentiment_score: number | null
          suggested_improvement: string | null
          user_id: string | null
          user_type: string
        }
        Insert: {
          affected_journey_stage?: string | null
          conversation_id?: string | null
          conversation_type: string
          created_at?: string
          id?: string
          issue_category: string
          metadata?: Json | null
          priority_level?: string
          resolution_status?: string
          sentiment_score?: number | null
          suggested_improvement?: string | null
          user_id?: string | null
          user_type: string
        }
        Update: {
          affected_journey_stage?: string | null
          conversation_id?: string | null
          conversation_type?: string
          created_at?: string
          id?: string
          issue_category?: string
          metadata?: Json | null
          priority_level?: string
          resolution_status?: string
          sentiment_score?: number | null
          suggested_improvement?: string | null
          user_id?: string | null
          user_type?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      document_chunks: {
        Row: {
          chunk_index: number
          chunk_text: string
          created_at: string | null
          document_id: string | null
          embedding: string | null
          id: string
          metadata: Json | null
        }
        Insert: {
          chunk_index: number
          chunk_text: string
          created_at?: string | null
          document_id?: string | null
          embedding?: string | null
          id?: string
          metadata?: Json | null
        }
        Update: {
          chunk_index?: number
          chunk_text?: string
          created_at?: string | null
          document_id?: string | null
          embedding?: string | null
          id?: string
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "document_chunks_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "knowledge_base"
            referencedColumns: ["id"]
          },
        ]
      }
      email_logs: {
        Row: {
          created_by: string | null
          error_message: string | null
          id: string
          sent_at: string | null
          status: string | null
          subject: string
          to_email: string
        }
        Insert: {
          created_by?: string | null
          error_message?: string | null
          id?: string
          sent_at?: string | null
          status?: string | null
          subject: string
          to_email: string
        }
        Update: {
          created_by?: string | null
          error_message?: string | null
          id?: string
          sent_at?: string | null
          status?: string | null
          subject?: string
          to_email?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_logs_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      feature_flags: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_global: boolean | null
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_global?: boolean | null
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_global?: boolean | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      feature_flags_enhanced: {
        Row: {
          created_at: string | null
          description: string | null
          display_name: string
          id: string
          is_global: boolean | null
          module: string
          name: string
          requires_commercial: boolean | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_name: string
          id?: string
          is_global?: boolean | null
          module: string
          name: string
          requires_commercial?: boolean | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_name?: string
          id?: string
          is_global?: boolean | null
          module?: string
          name?: string
          requires_commercial?: boolean | null
        }
        Relationships: []
      }
      improvement_suggestions: {
        Row: {
          category: string
          created_at: string
          department_owner: string | null
          estimated_impact: Json | null
          first_mentioned: string
          frequency_count: number
          id: string
          impact_area: string
          implementation_status: string
          last_mentioned: string
          priority_score: number
          suggestion_text: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          department_owner?: string | null
          estimated_impact?: Json | null
          first_mentioned?: string
          frequency_count?: number
          id?: string
          impact_area: string
          implementation_status?: string
          last_mentioned?: string
          priority_score?: number
          suggestion_text: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          department_owner?: string | null
          estimated_impact?: Json | null
          first_mentioned?: string
          frequency_count?: number
          id?: string
          impact_area?: string
          implementation_status?: string
          last_mentioned?: string
          priority_score?: number
          suggestion_text?: string
          updated_at?: string
        }
        Relationships: []
      }
      integrations_config: {
        Row: {
          config: Json
          created_at: string
          id: string
          integration_type: string
          last_sync: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          config?: Json
          created_at?: string
          id?: string
          integration_type: string
          last_sync?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          config?: Json
          created_at?: string
          id?: string
          integration_type?: string
          last_sync?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      knowledge_base: {
        Row: {
          active: boolean | null
          content: string
          created_at: string
          created_by: string
          embedding: string | null
          external_id: string | null
          file_type: string | null
          file_url: string | null
          id: string
          project: string | null
          source: string | null
          tags: string[] | null
          title: string
          user_id: string | null
        }
        Insert: {
          active?: boolean | null
          content: string
          created_at?: string
          created_by: string
          embedding?: string | null
          external_id?: string | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          project?: string | null
          source?: string | null
          tags?: string[] | null
          title: string
          user_id?: string | null
        }
        Update: {
          active?: boolean | null
          content?: string
          created_at?: string
          created_by?: string
          embedding?: string | null
          external_id?: string | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          project?: string | null
          source?: string | null
          tags?: string[] | null
          title?: string
          user_id?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          attachments: Json | null
          content: string
          conversation_id: string
          id: string
          image_data: string | null
          role: string
          timestamp: string
        }
        Insert: {
          attachments?: Json | null
          content: string
          conversation_id: string
          id?: string
          image_data?: string | null
          role: string
          timestamp?: string
        }
        Update: {
          attachments?: Json | null
          content?: string
          conversation_id?: string
          id?: string
          image_data?: string | null
          role?: string
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      notion_integrations: {
        Row: {
          created_at: string
          database_id: string
          documents_synced: number | null
          id: string
          last_sync: string | null
          metadata: Json | null
          notion_token: string
          status: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          database_id: string
          documents_synced?: number | null
          id?: string
          last_sync?: string | null
          metadata?: Json | null
          notion_token: string
          status?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          database_id?: string
          documents_synced?: number | null
          id?: string
          last_sync?: string | null
          metadata?: Json | null
          notion_token?: string
          status?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          branding: Json | null
          created_at: string | null
          description: string | null
          display_name: string
          features: string[] | null
          id: string
          is_commercial: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          branding?: Json | null
          created_at?: string | null
          description?: string | null
          display_name: string
          features?: string[] | null
          id?: string
          is_commercial?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          branding?: Json | null
          created_at?: string | null
          description?: string | null
          display_name?: string
          features?: string[] | null
          id?: string
          is_commercial?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          area: string
          created_at: string
          daily_query_limit: number | null
          department: string | null
          email: string
          full_name: string
          id: string
          is_super_admin: boolean | null
          last_login: string | null
          last_query_reset: string | null
          queries_used_today: number | null
          rol_empresa: string
          role: string | null
          role_system: string
          tenant_id: string | null
        }
        Insert: {
          area?: string
          created_at?: string
          daily_query_limit?: number | null
          department?: string | null
          email: string
          full_name: string
          id: string
          is_super_admin?: boolean | null
          last_login?: string | null
          last_query_reset?: string | null
          queries_used_today?: number | null
          rol_empresa?: string
          role?: string | null
          role_system?: string
          tenant_id?: string | null
        }
        Update: {
          area?: string
          created_at?: string
          daily_query_limit?: number | null
          department?: string | null
          email?: string
          full_name?: string
          id?: string
          is_super_admin?: boolean | null
          last_login?: string | null
          last_query_reset?: string | null
          queries_used_today?: number | null
          rol_empresa?: string
          role?: string | null
          role_system?: string
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_feature_flags: {
        Row: {
          config: Json | null
          created_at: string
          feature_flag_id: string | null
          id: string
          is_enabled: boolean | null
          tenant_id: string | null
          updated_at: string
        }
        Insert: {
          config?: Json | null
          created_at?: string
          feature_flag_id?: string | null
          id?: string
          is_enabled?: boolean | null
          tenant_id?: string | null
          updated_at?: string
        }
        Update: {
          config?: Json | null
          created_at?: string
          feature_flag_id?: string | null
          id?: string
          is_enabled?: boolean | null
          tenant_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_feature_flags_feature_flag_id_fkey"
            columns: ["feature_flag_id"]
            isOneToOne: false
            referencedRelation: "feature_flags"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenant_feature_flags_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_feature_flags_enhanced: {
        Row: {
          created_at: string | null
          feature_flag_id: string
          granted_by: string | null
          id: string
          is_enabled: boolean | null
          tenant_id: string
        }
        Insert: {
          created_at?: string | null
          feature_flag_id: string
          granted_by?: string | null
          id?: string
          is_enabled?: boolean | null
          tenant_id: string
        }
        Update: {
          created_at?: string | null
          feature_flag_id?: string
          granted_by?: string | null
          id?: string
          is_enabled?: boolean | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_feature_flags_enhanced_feature_flag_id_fkey"
            columns: ["feature_flag_id"]
            isOneToOne: false
            referencedRelation: "feature_flags_enhanced"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenant_feature_flags_enhanced_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          admin_email: string | null
          areas: string[] | null
          branding: Json | null
          created_at: string | null
          domain: string | null
          id: string
          is_internal: boolean | null
          max_monthly_queries: number | null
          max_storage_gb: number | null
          max_users: number | null
          name: string
          plan: string | null
          product_id: string | null
          settings: Json | null
          subdomain: string
          subscription_status: string | null
          trial_ends_at: string | null
          updated_at: string | null
        }
        Insert: {
          admin_email?: string | null
          areas?: string[] | null
          branding?: Json | null
          created_at?: string | null
          domain?: string | null
          id?: string
          is_internal?: boolean | null
          max_monthly_queries?: number | null
          max_storage_gb?: number | null
          max_users?: number | null
          name: string
          plan?: string | null
          product_id?: string | null
          settings?: Json | null
          subdomain: string
          subscription_status?: string | null
          trial_ends_at?: string | null
          updated_at?: string | null
        }
        Update: {
          admin_email?: string | null
          areas?: string[] | null
          branding?: Json | null
          created_at?: string | null
          domain?: string | null
          id?: string
          is_internal?: boolean | null
          max_monthly_queries?: number | null
          max_storage_gb?: number | null
          max_users?: number | null
          name?: string
          plan?: string | null
          product_id?: string | null
          settings?: Json | null
          subdomain?: string
          subscription_status?: string | null
          trial_ends_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tenants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      uploaded_files: {
        Row: {
          created_at: string
          file_type: string
          file_url: string
          filename: string
          id: string
          processed_content: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          file_type: string
          file_url: string
          filename: string
          id?: string
          processed_content?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          file_type?: string
          file_url?: string
          filename?: string
          id?: string
          processed_content?: string | null
          user_id?: string
        }
        Relationships: []
      }
      usage_analytics: {
        Row: {
          ai_provider: string | null
          created_at: string | null
          id: string
          query: string
          rating: number | null
          response_time: number | null
          sources_used: Json | null
          user_id: string | null
        }
        Insert: {
          ai_provider?: string | null
          created_at?: string | null
          id?: string
          query: string
          rating?: number | null
          response_time?: number | null
          sources_used?: Json | null
          user_id?: string | null
        }
        Update: {
          ai_provider?: string | null
          created_at?: string | null
          id?: string
          query?: string
          rating?: number | null
          response_time?: number | null
          sources_used?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      usage_metrics: {
        Row: {
          conversation_id: string | null
          created_at: string | null
          has_image: boolean | null
          id: string
          image_analysis_tokens: number | null
          knowledge_base_used: boolean | null
          model_used: string | null
          tokens_used: number | null
        }
        Insert: {
          conversation_id?: string | null
          created_at?: string | null
          has_image?: boolean | null
          id?: string
          image_analysis_tokens?: number | null
          knowledge_base_used?: boolean | null
          model_used?: string | null
          tokens_used?: number | null
        }
        Update: {
          conversation_id?: string | null
          created_at?: string | null
          has_image?: boolean | null
          id?: string
          image_analysis_tokens?: number | null
          knowledge_base_used?: boolean | null
          model_used?: string | null
          tokens_used?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "usage_metrics_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_feature_permissions: {
        Row: {
          created_at: string
          feature_flag_id: string | null
          granted_at: string | null
          granted_by: string | null
          id: string
          is_enabled: boolean | null
          tenant_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          feature_flag_id?: string | null
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          is_enabled?: boolean | null
          tenant_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          feature_flag_id?: string | null
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          is_enabled?: boolean | null
          tenant_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_feature_permissions_feature_flag_id_fkey"
            columns: ["feature_flag_id"]
            isOneToOne: false
            referencedRelation: "feature_flags"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_feature_permissions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      binary_quantize: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      halfvec_avg: {
        Args: { "": number[] }
        Returns: unknown
      }
      halfvec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_send: {
        Args: { "": unknown }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      hnsw_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnswhandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      is_current_user_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_super_admin_user: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      ivfflat_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflathandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      l2_norm: {
        Args: { "": unknown } | { "": unknown }
        Returns: number
      }
      l2_normalize: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: unknown
      }
      reset_daily_query_limits: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      search_documents: {
        Args: {
          query_embedding: string
          similarity_threshold?: number
          match_count?: number
        }
        Returns: {
          title: string
          chunk_text: string
          similarity: number
          project: string
        }[]
      }
      sparsevec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      sparsevec_send: {
        Args: { "": unknown }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      user_has_feature_access: {
        Args: { _user_id: string; _feature_name: string; _tenant_id?: string }
        Returns: boolean
      }
      vector_avg: {
        Args: { "": number[] }
        Returns: string
      }
      vector_dims: {
        Args: { "": string } | { "": unknown }
        Returns: number
      }
      vector_norm: {
        Args: { "": string }
        Returns: number
      }
      vector_out: {
        Args: { "": string }
        Returns: unknown
      }
      vector_send: {
        Args: { "": string }
        Returns: string
      }
      vector_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
