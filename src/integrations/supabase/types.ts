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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      maintenance_checklists: {
        Row: {
          checklist_type: string
          completed_at: string | null
          created_at: string | null
          id: string
          items: Json
          mechanic_id: string | null
          photos: Json | null
          service_order_id: string | null
          status: string
          updated_at: string | null
          vehicle_plate: string
        }
        Insert: {
          checklist_type: string
          completed_at?: string | null
          created_at?: string | null
          id?: string
          items?: Json
          mechanic_id?: string | null
          photos?: Json | null
          service_order_id?: string | null
          status?: string
          updated_at?: string | null
          vehicle_plate: string
        }
        Update: {
          checklist_type?: string
          completed_at?: string | null
          created_at?: string | null
          id?: string
          items?: Json
          mechanic_id?: string | null
          photos?: Json | null
          service_order_id?: string | null
          status?: string
          updated_at?: string | null
          vehicle_plate?: string
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_checklists_service_order_id_fkey"
            columns: ["service_order_id"]
            isOneToOne: false
            referencedRelation: "service_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          module: string | null
          read: boolean
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          module?: string | null
          read?: boolean
          title: string
          type?: Database["public"]["Enums"]["notification_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          module?: string | null
          read?: boolean
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      service_orders: {
        Row: {
          completed_at: string | null
          created_at: string | null
          created_by: string | null
          estimated_completion: string | null
          id: string
          issue_description: string
          labor_hours: number | null
          mechanic_id: string | null
          mechanic_notes: string | null
          odometer: number
          parts_used: Json | null
          priority: string
          status: string
          updated_at: string | null
          vehicle_model: string
          vehicle_plate: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          estimated_completion?: string | null
          id?: string
          issue_description: string
          labor_hours?: number | null
          mechanic_id?: string | null
          mechanic_notes?: string | null
          odometer: number
          parts_used?: Json | null
          priority: string
          status?: string
          updated_at?: string | null
          vehicle_model: string
          vehicle_plate: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          estimated_completion?: string | null
          id?: string
          issue_description?: string
          labor_hours?: number | null
          mechanic_id?: string | null
          mechanic_notes?: string | null
          odometer?: number
          parts_used?: Json | null
          priority?: string
          status?: string
          updated_at?: string | null
          vehicle_model?: string
          vehicle_plate?: string
        }
        Relationships: []
      }
      tpms_readings: {
        Row: {
          alert_level: string
          created_at: string | null
          id: string
          last_calibration: string | null
          notes: string | null
          pressure_psi: number
          recorded_by: string | null
          temperature_celsius: number | null
          tire_brand: string | null
          tire_model: string | null
          tire_position: string
          tread_depth_mm: number | null
          vehicle_plate: string
        }
        Insert: {
          alert_level?: string
          created_at?: string | null
          id?: string
          last_calibration?: string | null
          notes?: string | null
          pressure_psi: number
          recorded_by?: string | null
          temperature_celsius?: number | null
          tire_brand?: string | null
          tire_model?: string | null
          tire_position: string
          tread_depth_mm?: number | null
          vehicle_plate: string
        }
        Update: {
          alert_level?: string
          created_at?: string | null
          id?: string
          last_calibration?: string | null
          notes?: string | null
          pressure_psi?: number
          recorded_by?: string | null
          temperature_celsius?: number | null
          tire_brand?: string | null
          tire_model?: string | null
          tire_position?: string
          tread_depth_mm?: number | null
          vehicle_plate?: string
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
      workshop_inventory: {
        Row: {
          category: string
          created_at: string | null
          id: string
          last_restocked: string | null
          location: string | null
          minimum_stock: number
          part_code: string
          part_name: string
          quantity: number
          supplier: string | null
          unit_price: number | null
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          id?: string
          last_restocked?: string | null
          location?: string | null
          minimum_stock?: number
          part_code: string
          part_name: string
          quantity?: number
          supplier?: string | null
          unit_price?: number | null
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          id?: string
          last_restocked?: string | null
          location?: string | null
          minimum_stock?: number
          part_code?: string
          part_name?: string
          quantity?: number
          supplier?: string | null
          unit_price?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_roles: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"][]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "admin"
        | "driver"
        | "finance"
        | "operations"
        | "commercial"
        | "fleet_maintenance"
        | "maintenance_assistant"
        | "mecanico"
        | "motorista"
        | "financeiro"
        | "operacoes"
        | "comercial"
        | "frota"
        | "auxiliar_manutencao"
      notification_type: "info" | "success" | "warning" | "error"
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
      app_role: [
        "admin",
        "driver",
        "finance",
        "operations",
        "commercial",
        "fleet_maintenance",
        "maintenance_assistant",
        "mecanico",
        "motorista",
        "financeiro",
        "operacoes",
        "comercial",
        "frota",
        "auxiliar_manutencao",
      ],
      notification_type: ["info", "success", "warning", "error"],
    },
  },
} as const
