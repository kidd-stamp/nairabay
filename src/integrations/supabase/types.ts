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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      items: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          image_path: string
          location_city: string | null
          location_state: string | null
          price: number
          seller_id: string
          status: string
          title: string
          views: number
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          id?: string
          image_path: string
          location_city?: string | null
          location_state?: string | null
          price: number
          seller_id: string
          status?: string
          title: string
          views?: number
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          image_path?: string
          location_city?: string | null
          location_state?: string | null
          price?: number
          seller_id?: string
          status?: string
          title?: string
          views?: number
        }
        Relationships: [
          {
            foreignKeyName: "items_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "sellers"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          created_at: string
          details: string | null
          id: string
          item_id: string | null
          reason: string
          seller_id: string
          status: string
        }
        Insert: {
          created_at?: string
          details?: string | null
          id?: string
          item_id?: string | null
          reason: string
          seller_id: string
          status?: string
        }
        Update: {
          created_at?: string
          details?: string | null
          id?: string
          item_id?: string | null
          reason?: string
          seller_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "sellers"
            referencedColumns: ["id"]
          },
        ]
      }
      sellers: {
        Row: {
          bay_handle: string
          created_at: string
          display_name: string | null
          id: string
          location_city: string | null
          location_state: string | null
          phone_number: string
          phone_verified_at: string | null
          seller_key: string
        }
        Insert: {
          bay_handle: string
          created_at?: string
          display_name?: string | null
          id?: string
          location_city?: string | null
          location_state?: string | null
          phone_number: string
          phone_verified_at?: string | null
          seller_key?: string
        }
        Update: {
          bay_handle?: string
          created_at?: string
          display_name?: string | null
          id?: string
          location_city?: string | null
          location_state?: string | null
          phone_number?: string
          phone_verified_at?: string | null
          seller_key?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_list_items: {
        Args: { _search?: string; _status?: string }
        Returns: {
          bay_handle: string
          category: string
          created_at: string
          description: string
          id: string
          image_path: string
          location_city: string
          location_state: string
          phone_number: string
          phone_verified_at: string
          price: number
          seller_id: string
          status: string
          title: string
          views: number
        }[]
      }
      admin_list_reports: {
        Args: { _status?: string }
        Returns: {
          bay_handle: string
          created_at: string
          details: string
          id: string
          item_id: string
          item_status: string
          item_title: string
          phone_verified_at: string
          reason: string
          seller_id: string
          status: string
        }[]
      }
      admin_list_sellers: {
        Args: { _search?: string }
        Returns: {
          bay_handle: string
          created_at: string
          display_name: string
          id: string
          item_count: number
          location_city: string
          location_state: string
          phone_number: string
          phone_verified_at: string
        }[]
      }
      admin_set_item_status: {
        Args: { _item_id: string; _status: string }
        Returns: boolean
      }
      admin_set_report_status: {
        Args: { _report_id: string; _status: string }
        Returns: boolean
      }
      admin_set_seller_verified: {
        Args: { _seller_id: string; _verified: boolean }
        Returns: boolean
      }
      admin_stats: {
        Args: never
        Returns: {
          active_items: number
          open_reports: number
          sellers_total: number
          unverified_sellers: number
        }[]
      }
      bump_item_views: { Args: { _item_id: string }; Returns: undefined }
      claim_bay: {
        Args: {
          _city?: string
          _display_name?: string
          _phone: string
          _state?: string
        }
        Returns: {
          bay_handle: string
          seller_id: string
          seller_key: string
        }[]
      }
      create_item: {
        Args: {
          _category: string
          _city?: string
          _description?: string
          _image_path: string
          _price: number
          _seller_id: string
          _seller_key: string
          _state?: string
          _title: string
        }
        Returns: string
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      item_is_visible: {
        Args: { _created_at: string; _seller_id: string }
        Returns: boolean
      }
      report_bay: {
        Args: {
          _bay_handle: string
          _details?: string
          _item_id?: string
          _reason: string
        }
        Returns: boolean
      }
      set_item_status: {
        Args: { _item_id: string; _seller_key: string; _status: string }
        Returns: boolean
      }
      update_seller_phone: {
        Args: { _phone: string; _seller_id: string; _seller_key: string }
        Returns: {
          bay_handle: string
          phone_number: string
          seller_id: string
        }[]
      }
      verify_phone_from_sms: {
        Args: { _body: string; _from: string }
        Returns: {
          bay_handle: string
          seller_id: string
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "moderator"
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
      app_role: ["admin", "moderator"],
    },
  },
} as const
