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
      cte: {
        Row: {
          chave_acesso: string | null
          created_at: string | null
          created_by: string | null
          data_autorizacao: string | null
          data_emissao: string | null
          destinatario_cep: string
          destinatario_cidade: string
          destinatario_cnpj: string
          destinatario_endereco: string
          destinatario_nome: string
          destinatario_uf: string
          id: string
          modal: string
          numero_cte: string
          observacoes: string | null
          peso_bruto: number
          peso_cubado: number | null
          placa_carreta: string | null
          placa_veiculo: string
          produto_predominante: string
          protocolo_autorizacao: string | null
          quantidade_volumes: number
          remetente_cep: string
          remetente_cidade: string
          remetente_cnpj: string
          remetente_endereco: string
          remetente_nome: string
          remetente_uf: string
          rntrc: string | null
          serie: string
          status: string
          tipo_cte: string
          tipo_frete: string
          tipo_servico: string
          tomador_cnpj: string | null
          tomador_nome: string | null
          tomador_tipo: string
          trip_id: string | null
          uf_veiculo: string
          updated_at: string | null
          valor_frete: number
          valor_mercadoria: number
          valor_pedagio: number | null
          valor_total: number
        }
        Insert: {
          chave_acesso?: string | null
          created_at?: string | null
          created_by?: string | null
          data_autorizacao?: string | null
          data_emissao?: string | null
          destinatario_cep: string
          destinatario_cidade: string
          destinatario_cnpj: string
          destinatario_endereco: string
          destinatario_nome: string
          destinatario_uf: string
          id?: string
          modal?: string
          numero_cte: string
          observacoes?: string | null
          peso_bruto: number
          peso_cubado?: number | null
          placa_carreta?: string | null
          placa_veiculo: string
          produto_predominante: string
          protocolo_autorizacao?: string | null
          quantidade_volumes: number
          remetente_cep: string
          remetente_cidade: string
          remetente_cnpj: string
          remetente_endereco: string
          remetente_nome: string
          remetente_uf: string
          rntrc?: string | null
          serie?: string
          status?: string
          tipo_cte: string
          tipo_frete: string
          tipo_servico: string
          tomador_cnpj?: string | null
          tomador_nome?: string | null
          tomador_tipo: string
          trip_id?: string | null
          uf_veiculo: string
          updated_at?: string | null
          valor_frete: number
          valor_mercadoria: number
          valor_pedagio?: number | null
          valor_total: number
        }
        Update: {
          chave_acesso?: string | null
          created_at?: string | null
          created_by?: string | null
          data_autorizacao?: string | null
          data_emissao?: string | null
          destinatario_cep?: string
          destinatario_cidade?: string
          destinatario_cnpj?: string
          destinatario_endereco?: string
          destinatario_nome?: string
          destinatario_uf?: string
          id?: string
          modal?: string
          numero_cte?: string
          observacoes?: string | null
          peso_bruto?: number
          peso_cubado?: number | null
          placa_carreta?: string | null
          placa_veiculo?: string
          produto_predominante?: string
          protocolo_autorizacao?: string | null
          quantidade_volumes?: number
          remetente_cep?: string
          remetente_cidade?: string
          remetente_cnpj?: string
          remetente_endereco?: string
          remetente_nome?: string
          remetente_uf?: string
          rntrc?: string | null
          serie?: string
          status?: string
          tipo_cte?: string
          tipo_frete?: string
          tipo_servico?: string
          tomador_cnpj?: string | null
          tomador_nome?: string | null
          tomador_tipo?: string
          trip_id?: string | null
          uf_veiculo?: string
          updated_at?: string | null
          valor_frete?: number
          valor_mercadoria?: number
          valor_pedagio?: number | null
          valor_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "cte_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_categories: {
        Row: {
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      inventory_movements: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          item_id: string
          movement_type: string
          notes: string | null
          quantity: number
          reason: string
          reference_document: string | null
          responsible_user_id: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          item_id: string
          movement_type: string
          notes?: string | null
          quantity: number
          reason: string
          reference_document?: string | null
          responsible_user_id?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          item_id?: string
          movement_type?: string
          notes?: string | null
          quantity?: number
          reason?: string
          reference_document?: string | null
          responsible_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_movements_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "workshop_inventory"
            referencedColumns: ["id"]
          },
        ]
      }
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
      refuelings: {
        Row: {
          cost_per_km: number | null
          created_at: string
          driver_id: string
          id: string
          km: number
          liters: number
          timestamp: string
          total_value: number
          trip_id: string | null
          vehicle_plate: string
        }
        Insert: {
          cost_per_km?: number | null
          created_at?: string
          driver_id: string
          id?: string
          km: number
          liters: number
          timestamp?: string
          total_value: number
          trip_id?: string | null
          vehicle_plate: string
        }
        Update: {
          cost_per_km?: number | null
          created_at?: string
          driver_id?: string
          id?: string
          km?: number
          liters?: number
          timestamp?: string
          total_value?: number
          trip_id?: string | null
          vehicle_plate?: string
        }
        Relationships: [
          {
            foreignKeyName: "refuelings_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
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
          photos: Json | null
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
          photos?: Json | null
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
          photos?: Json | null
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
      trip_macros: {
        Row: {
          created_at: string
          driver_id: string
          id: string
          location_lat: number | null
          location_lng: number | null
          macro_type: string
          notes: string | null
          timestamp: string
          trip_id: string | null
        }
        Insert: {
          created_at?: string
          driver_id: string
          id?: string
          location_lat?: number | null
          location_lng?: number | null
          macro_type: string
          notes?: string | null
          timestamp?: string
          trip_id?: string | null
        }
        Update: {
          created_at?: string
          driver_id?: string
          id?: string
          location_lat?: number | null
          location_lng?: number | null
          macro_type?: string
          notes?: string | null
          timestamp?: string
          trip_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trip_macros_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      trips: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          destination: string
          driver_id: string
          driver_name: string
          estimated_arrival: string | null
          estimated_departure: string | null
          id: string
          notes: string | null
          origin: string
          status: string
          updated_at: string
          vehicle_plate: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          destination: string
          driver_id: string
          driver_name: string
          estimated_arrival?: string | null
          estimated_departure?: string | null
          id?: string
          notes?: string | null
          origin: string
          status?: string
          updated_at?: string
          vehicle_plate: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          destination?: string
          driver_id?: string
          driver_name?: string
          estimated_arrival?: string | null
          estimated_departure?: string | null
          id?: string
          notes?: string | null
          origin?: string
          status?: string
          updated_at?: string
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
          barcode: string | null
          category: string
          created_at: string | null
          critical_stock: number | null
          id: string
          last_restocked: string | null
          location: string | null
          minimum_stock: number
          notes: string | null
          part_code: string
          part_name: string
          quantity: number
          subcategory: string | null
          supplier: string | null
          unit_price: number | null
          updated_at: string | null
        }
        Insert: {
          barcode?: string | null
          category: string
          created_at?: string | null
          critical_stock?: number | null
          id?: string
          last_restocked?: string | null
          location?: string | null
          minimum_stock?: number
          notes?: string | null
          part_code: string
          part_name: string
          quantity?: number
          subcategory?: string | null
          supplier?: string | null
          unit_price?: number | null
          updated_at?: string | null
        }
        Update: {
          barcode?: string | null
          category?: string
          created_at?: string | null
          critical_stock?: number | null
          id?: string
          last_restocked?: string | null
          location?: string | null
          minimum_stock?: number
          notes?: string | null
          part_code?: string
          part_name?: string
          quantity?: number
          subcategory?: string | null
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
        | "logistics_manager"
        | "maintenance_manager"
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
        "logistics_manager",
        "maintenance_manager",
      ],
      notification_type: ["info", "success", "warning", "error"],
    },
  },
} as const
