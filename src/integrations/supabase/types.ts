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
      chat_conversations: {
        Row: {
          assigned_to: string | null
          closed_at: string | null
          created_at: string
          id: string
          priority: string
          status: string
          subject: string
          ticket_number: string | null
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_to?: string | null
          closed_at?: string | null
          created_at?: string
          id?: string
          priority?: string
          status?: string
          subject: string
          ticket_number?: string | null
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_to?: string | null
          closed_at?: string | null
          created_at?: string
          id?: string
          priority?: string
          status?: string
          subject?: string
          ticket_number?: string | null
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      chat_faq: {
        Row: {
          answer: string
          category: string
          created_at: string
          id: string
          is_active: boolean
          keywords: string[] | null
          question: string
          updated_at: string
        }
        Insert: {
          answer: string
          category: string
          created_at?: string
          id?: string
          is_active?: boolean
          keywords?: string[] | null
          question: string
          updated_at?: string
        }
        Update: {
          answer?: string
          category?: string
          created_at?: string
          id?: string
          is_active?: boolean
          keywords?: string[] | null
          question?: string
          updated_at?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          conversation_id: string
          created_at: string
          id: string
          message: string
          message_type: string
          metadata: Json | null
          read_at: string | null
          sender_id: string
        }
        Insert: {
          conversation_id: string
          created_at?: string
          id?: string
          message: string
          message_type?: string
          metadata?: Json | null
          read_at?: string | null
          sender_id: string
        }
        Update: {
          conversation_id?: string
          created_at?: string
          id?: string
          message?: string
          message_type?: string
          metadata?: Json | null
          read_at?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      client_financial_analysis: {
        Row: {
          client_cnpj: string
          created_at: string
          id: string
          inadimplente: boolean
          maior_atraso_dias: number | null
          periodo_ano: number
          periodo_mes: number
          peso_total_kg: number
          receita_atrasada: number
          receita_pendente: number
          receita_recebida: number
          receita_total: number
          score_cliente: number | null
          ticket_medio: number
          total_ctes: number
          ultima_atualizacao: string
        }
        Insert: {
          client_cnpj: string
          created_at?: string
          id?: string
          inadimplente?: boolean
          maior_atraso_dias?: number | null
          periodo_ano: number
          periodo_mes: number
          peso_total_kg?: number
          receita_atrasada?: number
          receita_pendente?: number
          receita_recebida?: number
          receita_total?: number
          score_cliente?: number | null
          ticket_medio?: number
          total_ctes?: number
          ultima_atualizacao?: string
        }
        Update: {
          client_cnpj?: string
          created_at?: string
          id?: string
          inadimplente?: boolean
          maior_atraso_dias?: number | null
          periodo_ano?: number
          periodo_mes?: number
          peso_total_kg?: number
          receita_atrasada?: number
          receita_pendente?: number
          receita_recebida?: number
          receita_total?: number
          score_cliente?: number | null
          ticket_medio?: number
          total_ctes?: number
          ultima_atualizacao?: string
        }
        Relationships: []
      }
      clients: {
        Row: {
          cep: string | null
          cidade: string | null
          cnpj: string
          condicao_pagamento: string | null
          contato_principal: string | null
          created_at: string
          created_by: string | null
          email: string | null
          endereco: string | null
          id: string
          inscricao_estadual: string | null
          limite_credito: number | null
          nome_fantasia: string | null
          observacoes: string | null
          razao_social: string
          status: string
          telefone: string | null
          uf: string | null
          updated_at: string
        }
        Insert: {
          cep?: string | null
          cidade?: string | null
          cnpj: string
          condicao_pagamento?: string | null
          contato_principal?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          endereco?: string | null
          id?: string
          inscricao_estadual?: string | null
          limite_credito?: number | null
          nome_fantasia?: string | null
          observacoes?: string | null
          razao_social: string
          status?: string
          telefone?: string | null
          uf?: string | null
          updated_at?: string
        }
        Update: {
          cep?: string | null
          cidade?: string | null
          cnpj?: string
          condicao_pagamento?: string | null
          contato_principal?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          endereco?: string | null
          id?: string
          inscricao_estadual?: string | null
          limite_credito?: number | null
          nome_fantasia?: string | null
          observacoes?: string | null
          razao_social?: string
          status?: string
          telefone?: string | null
          uf?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      contas_pagar: {
        Row: {
          categoria: string | null
          created_at: string | null
          created_by: string | null
          data_pagamento: string | null
          data_vencimento: string
          descricao: string
          fornecedor: string
          id: string
          observacoes: string | null
          status: string | null
          updated_at: string | null
          valor: number
        }
        Insert: {
          categoria?: string | null
          created_at?: string | null
          created_by?: string | null
          data_pagamento?: string | null
          data_vencimento: string
          descricao: string
          fornecedor: string
          id?: string
          observacoes?: string | null
          status?: string | null
          updated_at?: string | null
          valor: number
        }
        Update: {
          categoria?: string | null
          created_at?: string | null
          created_by?: string | null
          data_pagamento?: string | null
          data_vencimento?: string
          descricao?: string
          fornecedor?: string
          id?: string
          observacoes?: string | null
          status?: string | null
          updated_at?: string | null
          valor?: number
        }
        Relationships: []
      }
      contas_receber: {
        Row: {
          cliente: string
          created_at: string | null
          created_by: string | null
          cte_id: string | null
          data_recebimento: string | null
          data_vencimento: string
          descricao: string
          id: string
          observacoes: string | null
          status: string | null
          updated_at: string | null
          valor: number
        }
        Insert: {
          cliente: string
          created_at?: string | null
          created_by?: string | null
          cte_id?: string | null
          data_recebimento?: string | null
          data_vencimento: string
          descricao: string
          id?: string
          observacoes?: string | null
          status?: string | null
          updated_at?: string | null
          valor: number
        }
        Update: {
          cliente?: string
          created_at?: string | null
          created_by?: string | null
          cte_id?: string | null
          data_recebimento?: string | null
          data_vencimento?: string
          descricao?: string
          id?: string
          observacoes?: string | null
          status?: string | null
          updated_at?: string | null
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "contas_receber_cte_id_fkey"
            columns: ["cte_id"]
            isOneToOne: true
            referencedRelation: "cte"
            referencedColumns: ["id"]
          },
        ]
      }
      cte: {
        Row: {
          chave_acesso: string | null
          created_at: string | null
          created_by: string | null
          data_autorizacao: string | null
          data_emissao: string | null
          data_pagamento: string | null
          data_vencimento: string | null
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
          status_pagamento: string | null
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
          data_pagamento?: string | null
          data_vencimento?: string | null
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
          status_pagamento?: string | null
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
          data_pagamento?: string | null
          data_vencimento?: string | null
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
          status_pagamento?: string | null
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
      digital_signatures: {
        Row: {
          id: string
          ip_address: string | null
          pdf_url: string | null
          report_id: string
          report_type: string
          signature_data: string
          signed_at: string
          signer_id: string
          user_agent: string | null
        }
        Insert: {
          id?: string
          ip_address?: string | null
          pdf_url?: string | null
          report_id: string
          report_type: string
          signature_data: string
          signed_at?: string
          signer_id: string
          user_agent?: string | null
        }
        Update: {
          id?: string
          ip_address?: string | null
          pdf_url?: string | null
          report_id?: string
          report_type?: string
          signature_data?: string
          signed_at?: string
          signer_id?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      driver_compensation_config: {
        Row: {
          created_at: string
          id: string
          percentual_desconto_cte: number
          percentual_gratificacao: number
          salario_base: number
          updated_at: string
          valor_hora_espera: number
          valor_hora_extra: number
          valor_hora_normal: number
        }
        Insert: {
          created_at?: string
          id?: string
          percentual_desconto_cte?: number
          percentual_gratificacao?: number
          salario_base?: number
          updated_at?: string
          valor_hora_espera?: number
          valor_hora_extra?: number
          valor_hora_normal?: number
        }
        Update: {
          created_at?: string
          id?: string
          percentual_desconto_cte?: number
          percentual_gratificacao?: number
          salario_base?: number
          updated_at?: string
          valor_hora_espera?: number
          valor_hora_extra?: number
          valor_hora_normal?: number
        }
        Relationships: []
      }
      driver_payroll: {
        Row: {
          ano: number
          aprovado_por: string | null
          base_calculo_gratificacao: number
          created_at: string
          dados_detalhados: Json | null
          data_aprovacao: string | null
          data_pagamento: string | null
          driver_id: string
          horas_espera: number
          horas_extras: number
          horas_normais: number
          id: string
          mes: number
          observacoes: string | null
          salario_base: number
          status: string
          total_bruto: number
          total_combustivel: number
          total_descontos: number
          total_liquido: number
          total_valor_ctes: number
          updated_at: string
          valor_gratificacao: number
          valor_horas_espera: number
          valor_horas_extras: number
          valor_horas_normais: number
        }
        Insert: {
          ano: number
          aprovado_por?: string | null
          base_calculo_gratificacao?: number
          created_at?: string
          dados_detalhados?: Json | null
          data_aprovacao?: string | null
          data_pagamento?: string | null
          driver_id: string
          horas_espera?: number
          horas_extras?: number
          horas_normais?: number
          id?: string
          mes: number
          observacoes?: string | null
          salario_base?: number
          status?: string
          total_bruto?: number
          total_combustivel?: number
          total_descontos?: number
          total_liquido?: number
          total_valor_ctes?: number
          updated_at?: string
          valor_gratificacao?: number
          valor_horas_espera?: number
          valor_horas_extras?: number
          valor_horas_normais?: number
        }
        Update: {
          ano?: number
          aprovado_por?: string | null
          base_calculo_gratificacao?: number
          created_at?: string
          dados_detalhados?: Json | null
          data_aprovacao?: string | null
          data_pagamento?: string | null
          driver_id?: string
          horas_espera?: number
          horas_extras?: number
          horas_normais?: number
          id?: string
          mes?: number
          observacoes?: string | null
          salario_base?: number
          status?: string
          total_bruto?: number
          total_combustivel?: number
          total_descontos?: number
          total_liquido?: number
          total_valor_ctes?: number
          updated_at?: string
          valor_gratificacao?: number
          valor_horas_espera?: number
          valor_horas_extras?: number
          valor_horas_normais?: number
        }
        Relationships: []
      }
      driver_violations: {
        Row: {
          created_at: string | null
          data_hora_violacao: string
          descricao: string
          driver_id: string
          id: string
          resolvida: boolean | null
          session_id: string
          severidade: string
          tipo_violacao: Database["public"]["Enums"]["violation_type"]
          valor_maximo_permitido: number | null
          valor_registrado: number | null
        }
        Insert: {
          created_at?: string | null
          data_hora_violacao: string
          descricao: string
          driver_id: string
          id?: string
          resolvida?: boolean | null
          session_id: string
          severidade?: string
          tipo_violacao: Database["public"]["Enums"]["violation_type"]
          valor_maximo_permitido?: number | null
          valor_registrado?: number | null
        }
        Update: {
          created_at?: string | null
          data_hora_violacao?: string
          descricao?: string
          driver_id?: string
          id?: string
          resolvida?: boolean | null
          session_id?: string
          severidade?: string
          tipo_violacao?: Database["public"]["Enums"]["violation_type"]
          valor_maximo_permitido?: number | null
          valor_registrado?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "driver_violations_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "driver_work_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      driver_weekly_reports: {
        Row: {
          ano: number
          assinado_gestor: boolean | null
          assinado_motorista: boolean | null
          created_at: string | null
          dados_detalhados: Json | null
          data_assinatura: string | null
          data_assinatura_gestor: string | null
          data_fim: string
          data_inicio: string
          driver_id: string
          gestor_id: string | null
          id: string
          semana: number
          total_horas_direcao: number
          total_horas_espera: number
          total_horas_extras: number
          total_horas_trabalhadas: number
          total_violacoes: number | null
          updated_at: string | null
        }
        Insert: {
          ano: number
          assinado_gestor?: boolean | null
          assinado_motorista?: boolean | null
          created_at?: string | null
          dados_detalhados?: Json | null
          data_assinatura?: string | null
          data_assinatura_gestor?: string | null
          data_fim: string
          data_inicio: string
          driver_id: string
          gestor_id?: string | null
          id?: string
          semana: number
          total_horas_direcao?: number
          total_horas_espera?: number
          total_horas_extras?: number
          total_horas_trabalhadas?: number
          total_violacoes?: number | null
          updated_at?: string | null
        }
        Update: {
          ano?: number
          assinado_gestor?: boolean | null
          assinado_motorista?: boolean | null
          created_at?: string | null
          dados_detalhados?: Json | null
          data_assinatura?: string | null
          data_assinatura_gestor?: string | null
          data_fim?: string
          data_inicio?: string
          driver_id?: string
          gestor_id?: string | null
          id?: string
          semana?: number
          total_horas_direcao?: number
          total_horas_espera?: number
          total_horas_extras?: number
          total_horas_trabalhadas?: number
          total_violacoes?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      driver_work_events: {
        Row: {
          automatico: boolean | null
          created_at: string | null
          data_hora_fim: string | null
          data_hora_inicio: string
          driver_id: string
          duracao_minutos: number | null
          id: string
          localizacao: Json | null
          observacoes: string | null
          session_id: string
          tipo_atividade: Database["public"]["Enums"]["driver_activity_type"]
        }
        Insert: {
          automatico?: boolean | null
          created_at?: string | null
          data_hora_fim?: string | null
          data_hora_inicio: string
          driver_id: string
          duracao_minutos?: number | null
          id?: string
          localizacao?: Json | null
          observacoes?: string | null
          session_id: string
          tipo_atividade: Database["public"]["Enums"]["driver_activity_type"]
        }
        Update: {
          automatico?: boolean | null
          created_at?: string | null
          data_hora_fim?: string | null
          data_hora_inicio?: string
          driver_id?: string
          duracao_minutos?: number | null
          id?: string
          localizacao?: Json | null
          observacoes?: string | null
          session_id?: string
          tipo_atividade?: Database["public"]["Enums"]["driver_activity_type"]
        }
        Relationships: [
          {
            foreignKeyName: "driver_work_events_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "driver_work_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      driver_work_sessions: {
        Row: {
          created_at: string | null
          data_fim: string | null
          data_inicio: string
          driver_id: string
          horas_extras_minutos: number | null
          id: string
          localizacao_fim: Json | null
          localizacao_inicio: Json | null
          status: string
          tipo_motorista: string
          total_descanso_minutos: number | null
          total_direcao_minutos: number | null
          total_espera_minutos: number | null
          total_trabalho_minutos: number | null
          trip_id: string | null
          updated_at: string | null
          vehicle_plate: string
        }
        Insert: {
          created_at?: string | null
          data_fim?: string | null
          data_inicio: string
          driver_id: string
          horas_extras_minutos?: number | null
          id?: string
          localizacao_fim?: Json | null
          localizacao_inicio?: Json | null
          status?: string
          tipo_motorista?: string
          total_descanso_minutos?: number | null
          total_direcao_minutos?: number | null
          total_espera_minutos?: number | null
          total_trabalho_minutos?: number | null
          trip_id?: string | null
          updated_at?: string | null
          vehicle_plate: string
        }
        Update: {
          created_at?: string | null
          data_fim?: string | null
          data_inicio?: string
          driver_id?: string
          horas_extras_minutos?: number | null
          id?: string
          localizacao_fim?: Json | null
          localizacao_inicio?: Json | null
          status?: string
          tipo_motorista?: string
          total_descanso_minutos?: number | null
          total_direcao_minutos?: number | null
          total_espera_minutos?: number | null
          total_trabalho_minutos?: number | null
          trip_id?: string | null
          updated_at?: string | null
          vehicle_plate?: string
        }
        Relationships: [
          {
            foreignKeyName: "driver_work_sessions_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_indicators: {
        Row: {
          created_at: string
          custo_total: number
          id: string
          margem_liquida: number
          periodo_ano: number
          periodo_mes: number
          peso_total_kg: number
          receita_por_kg: number
          receita_total: number
          ticket_medio: number
          top_cliente_cnpj: string | null
          top_cliente_valor: number
          top_rota_destino: string | null
          top_rota_origem: string | null
          top_rota_valor: number
          total_clientes: number
          total_ctes: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          custo_total?: number
          id?: string
          margem_liquida?: number
          periodo_ano: number
          periodo_mes: number
          peso_total_kg?: number
          receita_por_kg?: number
          receita_total?: number
          ticket_medio?: number
          top_cliente_cnpj?: string | null
          top_cliente_valor?: number
          top_rota_destino?: string | null
          top_rota_origem?: string | null
          top_rota_valor?: number
          total_clientes?: number
          total_ctes?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          custo_total?: number
          id?: string
          margem_liquida?: number
          periodo_ano?: number
          periodo_mes?: number
          peso_total_kg?: number
          receita_por_kg?: number
          receita_total?: number
          ticket_medio?: number
          top_cliente_cnpj?: string | null
          top_cliente_valor?: number
          top_rota_destino?: string | null
          top_rota_origem?: string | null
          top_rota_valor?: number
          total_clientes?: number
          total_ctes?: number
          updated_at?: string
        }
        Relationships: []
      }
      integration_settings: {
        Row: {
          config: Json
          created_at: string
          id: string
          integration_type: string
          is_active: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          config?: Json
          created_at?: string
          id?: string
          integration_type: string
          is_active?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          config?: Json
          created_at?: string
          id?: string
          integration_type?: string
          is_active?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
      lavagens: {
        Row: {
          created_at: string
          data_agendada: string | null
          data_conclusao: string | null
          data_inicio: string | null
          foto_antes: string | null
          foto_depois: string | null
          id: string
          km: number
          observacoes: string | null
          responsavel_id: string | null
          status: string
          tipo_lavagem: string
          updated_at: string
          valor: number | null
          vehicle_plate: string
        }
        Insert: {
          created_at?: string
          data_agendada?: string | null
          data_conclusao?: string | null
          data_inicio?: string | null
          foto_antes?: string | null
          foto_depois?: string | null
          id?: string
          km: number
          observacoes?: string | null
          responsavel_id?: string | null
          status?: string
          tipo_lavagem: string
          updated_at?: string
          valor?: number | null
          vehicle_plate: string
        }
        Update: {
          created_at?: string
          data_agendada?: string | null
          data_conclusao?: string | null
          data_inicio?: string | null
          foto_antes?: string | null
          foto_depois?: string | null
          id?: string
          km?: number
          observacoes?: string | null
          responsavel_id?: string | null
          status?: string
          tipo_lavagem?: string
          updated_at?: string
          valor?: number | null
          vehicle_plate?: string
        }
        Relationships: []
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
      maintenance_cost_alerts: {
        Row: {
          alert_name: string
          alert_type: string
          cost_threshold: number | null
          created_at: string
          email_enabled: boolean | null
          email_recipients: string[] | null
          id: string
          is_active: boolean
          last_triggered_at: string | null
          n8n_enabled: boolean | null
          n8n_webhook_url: string | null
          notification_channels: string[] | null
          period_days: number | null
          trend_percentage: number | null
          trend_period_months: number | null
          trigger_count: number | null
          updated_at: string
          user_id: string
          vehicle_plate: string | null
          whatsapp_enabled: boolean | null
          whatsapp_numbers: string[] | null
        }
        Insert: {
          alert_name: string
          alert_type: string
          cost_threshold?: number | null
          created_at?: string
          email_enabled?: boolean | null
          email_recipients?: string[] | null
          id?: string
          is_active?: boolean
          last_triggered_at?: string | null
          n8n_enabled?: boolean | null
          n8n_webhook_url?: string | null
          notification_channels?: string[] | null
          period_days?: number | null
          trend_percentage?: number | null
          trend_period_months?: number | null
          trigger_count?: number | null
          updated_at?: string
          user_id: string
          vehicle_plate?: string | null
          whatsapp_enabled?: boolean | null
          whatsapp_numbers?: string[] | null
        }
        Update: {
          alert_name?: string
          alert_type?: string
          cost_threshold?: number | null
          created_at?: string
          email_enabled?: boolean | null
          email_recipients?: string[] | null
          id?: string
          is_active?: boolean
          last_triggered_at?: string | null
          n8n_enabled?: boolean | null
          n8n_webhook_url?: string | null
          notification_channels?: string[] | null
          period_days?: number | null
          trend_percentage?: number | null
          trend_period_months?: number | null
          trigger_count?: number | null
          updated_at?: string
          user_id?: string
          vehicle_plate?: string | null
          whatsapp_enabled?: boolean | null
          whatsapp_numbers?: string[] | null
        }
        Relationships: []
      }
      movimentacao_pneus: {
        Row: {
          created_at: string
          id: string
          km_veiculo: number | null
          motivo: string
          observacoes: string | null
          pneu_id: string
          posicao_destino: string | null
          posicao_origem: string | null
          profundidade_sulco: number | null
          responsavel_id: string | null
          tipo_movimentacao: string
          vehicle_plate_destino: string | null
          vehicle_plate_origem: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          km_veiculo?: number | null
          motivo: string
          observacoes?: string | null
          pneu_id: string
          posicao_destino?: string | null
          posicao_origem?: string | null
          profundidade_sulco?: number | null
          responsavel_id?: string | null
          tipo_movimentacao: string
          vehicle_plate_destino?: string | null
          vehicle_plate_origem?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          km_veiculo?: number | null
          motivo?: string
          observacoes?: string | null
          pneu_id?: string
          posicao_destino?: string | null
          posicao_origem?: string | null
          profundidade_sulco?: number | null
          responsavel_id?: string | null
          tipo_movimentacao?: string
          vehicle_plate_destino?: string | null
          vehicle_plate_origem?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "movimentacao_pneus_pneu_id_fkey"
            columns: ["pneu_id"]
            isOneToOne: false
            referencedRelation: "pneus"
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
      payment_alerts: {
        Row: {
          alert_type: string
          client_cnpj: string
          created_at: string
          cte_id: string | null
          data_alerta: string
          data_resolucao: string | null
          dias_atraso: number | null
          id: string
          mensagem: string
          resolvido_por: string | null
          severity: string
          status: string
          valor_pendente: number
        }
        Insert: {
          alert_type: string
          client_cnpj: string
          created_at?: string
          cte_id?: string | null
          data_alerta?: string
          data_resolucao?: string | null
          dias_atraso?: number | null
          id?: string
          mensagem: string
          resolvido_por?: string | null
          severity?: string
          status?: string
          valor_pendente: number
        }
        Update: {
          alert_type?: string
          client_cnpj?: string
          created_at?: string
          cte_id?: string | null
          data_alerta?: string
          data_resolucao?: string | null
          dias_atraso?: number | null
          id?: string
          mensagem?: string
          resolvido_por?: string | null
          severity?: string
          status?: string
          valor_pendente?: number
        }
        Relationships: [
          {
            foreignKeyName: "payment_alerts_cte_id_fkey"
            columns: ["cte_id"]
            isOneToOne: false
            referencedRelation: "cte"
            referencedColumns: ["id"]
          },
        ]
      }
      pneus: {
        Row: {
          codigo: string
          created_at: string
          data_compra: string | null
          data_instalacao: string | null
          fornecedor: string | null
          id: string
          km_atual: number | null
          km_instalacao: number | null
          marca: string
          medida: string
          modelo: string
          numero_fogo: string | null
          observacoes: string | null
          posicao: string | null
          pressao_recomendada: number | null
          profundidade_sulco: number | null
          status: string
          tipo: string
          updated_at: string
          valor_compra: number | null
          vehicle_plate: string | null
          vida_util_km: number | null
        }
        Insert: {
          codigo: string
          created_at?: string
          data_compra?: string | null
          data_instalacao?: string | null
          fornecedor?: string | null
          id?: string
          km_atual?: number | null
          km_instalacao?: number | null
          marca: string
          medida: string
          modelo: string
          numero_fogo?: string | null
          observacoes?: string | null
          posicao?: string | null
          pressao_recomendada?: number | null
          profundidade_sulco?: number | null
          status?: string
          tipo: string
          updated_at?: string
          valor_compra?: number | null
          vehicle_plate?: string | null
          vida_util_km?: number | null
        }
        Update: {
          codigo?: string
          created_at?: string
          data_compra?: string | null
          data_instalacao?: string | null
          fornecedor?: string | null
          id?: string
          km_atual?: number | null
          km_instalacao?: number | null
          marca?: string
          medida?: string
          modelo?: string
          numero_fogo?: string | null
          observacoes?: string | null
          posicao?: string | null
          pressao_recomendada?: number | null
          profundidade_sulco?: number | null
          status?: string
          tipo?: string
          updated_at?: string
          valor_compra?: number | null
          vehicle_plate?: string | null
          vida_util_km?: number | null
        }
        Relationships: []
      }
      predictive_alert_history: {
        Row: {
          alert_id: string
          alert_reason: string
          ano_previsto: number
          created_at: string
          id: string
          mes_previsto: number
          notification_sent: boolean
          predicted_value: number
          target_value: number | null
          variance_percentage: number
        }
        Insert: {
          alert_id: string
          alert_reason: string
          ano_previsto: number
          created_at?: string
          id?: string
          mes_previsto: number
          notification_sent?: boolean
          predicted_value: number
          target_value?: number | null
          variance_percentage: number
        }
        Update: {
          alert_id?: string
          alert_reason?: string
          ano_previsto?: number
          created_at?: string
          id?: string
          mes_previsto?: number
          notification_sent?: boolean
          predicted_value?: number
          target_value?: number | null
          variance_percentage?: number
        }
        Relationships: [
          {
            foreignKeyName: "predictive_alert_history_alert_id_fkey"
            columns: ["alert_id"]
            isOneToOne: false
            referencedRelation: "predictive_alerts"
            referencedColumns: ["id"]
          },
        ]
      }
      predictive_alerts: {
        Row: {
          alert_name: string
          alert_type: string
          check_target_miss: boolean
          created_at: string
          email_recipients: string[]
          id: string
          is_active: boolean
          last_triggered_at: string | null
          n8n_enabled: boolean
          n8n_webhook_url: string | null
          notification_channels: string[]
          target_threshold_percentage: number | null
          threshold_percentage: number | null
          trigger_count: number
          updated_at: string
          user_id: string
          whatsapp_enabled: boolean
          whatsapp_numbers: string[]
        }
        Insert: {
          alert_name: string
          alert_type: string
          check_target_miss?: boolean
          created_at?: string
          email_recipients?: string[]
          id?: string
          is_active?: boolean
          last_triggered_at?: string | null
          n8n_enabled?: boolean
          n8n_webhook_url?: string | null
          notification_channels?: string[]
          target_threshold_percentage?: number | null
          threshold_percentage?: number | null
          trigger_count?: number
          updated_at?: string
          user_id: string
          whatsapp_enabled?: boolean
          whatsapp_numbers?: string[]
        }
        Update: {
          alert_name?: string
          alert_type?: string
          check_target_miss?: boolean
          created_at?: string
          email_recipients?: string[]
          id?: string
          is_active?: boolean
          last_triggered_at?: string | null
          n8n_enabled?: boolean
          n8n_webhook_url?: string | null
          notification_channels?: string[]
          target_threshold_percentage?: number | null
          threshold_percentage?: number | null
          trigger_count?: number
          updated_at?: string
          user_id?: string
          whatsapp_enabled?: boolean
          whatsapp_numbers?: string[]
        }
        Relationships: []
      }
      profiles: {
        Row: {
          apelido: string | null
          avatar_url: string | null
          cidade: string | null
          cpf: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          rg: string | null
          telefone: string | null
          tipo_vinculo: string | null
          updated_at: string
        }
        Insert: {
          apelido?: string | null
          avatar_url?: string | null
          cidade?: string | null
          cpf?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          rg?: string | null
          telefone?: string | null
          tipo_vinculo?: string | null
          updated_at?: string
        }
        Update: {
          apelido?: string | null
          avatar_url?: string | null
          cidade?: string | null
          cpf?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          rg?: string | null
          telefone?: string | null
          tipo_vinculo?: string | null
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
      revenue_alerts: {
        Row: {
          alert_name: string
          alert_type: string
          comparison_period: string
          created_at: string
          email_recipients: string[]
          id: string
          is_active: boolean
          last_triggered_at: string | null
          n8n_enabled: boolean
          n8n_webhook_url: string | null
          notification_channels: string[]
          threshold_percentage: number | null
          threshold_value: number | null
          trigger_count: number
          updated_at: string
          user_id: string
          whatsapp_enabled: boolean
          whatsapp_numbers: string[]
        }
        Insert: {
          alert_name: string
          alert_type: string
          comparison_period?: string
          created_at?: string
          email_recipients?: string[]
          id?: string
          is_active?: boolean
          last_triggered_at?: string | null
          n8n_enabled?: boolean
          n8n_webhook_url?: string | null
          notification_channels?: string[]
          threshold_percentage?: number | null
          threshold_value?: number | null
          trigger_count?: number
          updated_at?: string
          user_id: string
          whatsapp_enabled?: boolean
          whatsapp_numbers?: string[]
        }
        Update: {
          alert_name?: string
          alert_type?: string
          comparison_period?: string
          created_at?: string
          email_recipients?: string[]
          id?: string
          is_active?: boolean
          last_triggered_at?: string | null
          n8n_enabled?: boolean
          n8n_webhook_url?: string | null
          notification_channels?: string[]
          threshold_percentage?: number | null
          threshold_value?: number | null
          trigger_count?: number
          updated_at?: string
          user_id?: string
          whatsapp_enabled?: boolean
          whatsapp_numbers?: string[]
        }
        Relationships: []
      }
      revenue_records: {
        Row: {
          cliente_cnpj: string
          cliente_nome: string
          cliente_uf: string
          created_at: string
          created_by: string | null
          cte_chave: string | null
          data_emissao: string
          destinatario_cnpj: string | null
          destinatario_nome: string | null
          destinatario_uf: string | null
          destino_uf: string
          id: string
          notas: string | null
          numero_cte: string
          origem_uf: string
          peso_kg: number
          status: string
          updated_at: string
          valor_frete: number
          valor_icms: number
          valor_mercadoria: number
          volumes: number
        }
        Insert: {
          cliente_cnpj: string
          cliente_nome: string
          cliente_uf: string
          created_at?: string
          created_by?: string | null
          cte_chave?: string | null
          data_emissao: string
          destinatario_cnpj?: string | null
          destinatario_nome?: string | null
          destinatario_uf?: string | null
          destino_uf: string
          id?: string
          notas?: string | null
          numero_cte: string
          origem_uf: string
          peso_kg?: number
          status?: string
          updated_at?: string
          valor_frete?: number
          valor_icms?: number
          valor_mercadoria?: number
          volumes?: number
        }
        Update: {
          cliente_cnpj?: string
          cliente_nome?: string
          cliente_uf?: string
          created_at?: string
          created_by?: string | null
          cte_chave?: string | null
          data_emissao?: string
          destinatario_cnpj?: string | null
          destinatario_nome?: string | null
          destinatario_uf?: string | null
          destino_uf?: string
          id?: string
          notas?: string | null
          numero_cte?: string
          origem_uf?: string
          peso_kg?: number
          status?: string
          updated_at?: string
          valor_frete?: number
          valor_icms?: number
          valor_mercadoria?: number
          volumes?: number
        }
        Relationships: []
      }
      revenue_targets: {
        Row: {
          ano: number
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          mes: number
          target_value: number
          updated_at: string
        }
        Insert: {
          ano: number
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          mes: number
          target_value: number
          updated_at?: string
        }
        Update: {
          ano?: number
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          mes?: number
          target_value?: number
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
      vehicles: {
        Row: {
          ano: number | null
          created_at: string | null
          id: string
          modelo: string | null
          placa: string
          proprietario: string | null
          status: string | null
          tipo: string
          updated_at: string | null
        }
        Insert: {
          ano?: number | null
          created_at?: string | null
          id?: string
          modelo?: string | null
          placa: string
          proprietario?: string | null
          status?: string | null
          tipo: string
          updated_at?: string | null
        }
        Update: {
          ano?: number | null
          created_at?: string | null
          id?: string
          modelo?: string | null
          placa?: string
          proprietario?: string | null
          status?: string | null
          tipo?: string
          updated_at?: string | null
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
      driver_gratification: {
        Row: {
          ano: number | null
          base_calculo_gratificacao: number | null
          created_at: string | null
          data_pagamento: string | null
          driver_id: string | null
          id: string | null
          mes: number | null
          status: string | null
          total_combustivel: number | null
          total_valor_ctes: number | null
          valor_gratificacao: number | null
        }
        Insert: {
          ano?: number | null
          base_calculo_gratificacao?: number | null
          created_at?: string | null
          data_pagamento?: string | null
          driver_id?: string | null
          id?: string | null
          mes?: number | null
          status?: string | null
          total_combustivel?: number | null
          total_valor_ctes?: number | null
          valor_gratificacao?: number | null
        }
        Update: {
          ano?: number | null
          base_calculo_gratificacao?: number | null
          created_at?: string | null
          data_pagamento?: string | null
          driver_id?: string | null
          id?: string | null
          mes?: number | null
          status?: string | null
          total_combustivel?: number | null
          total_valor_ctes?: number | null
          valor_gratificacao?: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      calculate_client_financial_analysis: { Args: never; Returns: undefined }
      create_or_update_director: {
        Args: {
          user_email: string
          user_full_name: string
          user_password: string
        }
        Returns: string
      }
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
      driver_activity_type:
        | "direcao"
        | "descanso"
        | "refeicao"
        | "espera"
        | "trabalho"
        | "intervalo"
      notification_type: "info" | "success" | "warning" | "error"
      violation_type:
        | "direcao_continua_excedida"
        | "jornada_diaria_excedida"
        | "intervalo_interjornada_insuficiente"
        | "intervalo_refeicao_insuficiente"
        | "horas_extras_excedidas"
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
      driver_activity_type: [
        "direcao",
        "descanso",
        "refeicao",
        "espera",
        "trabalho",
        "intervalo",
      ],
      notification_type: ["info", "success", "warning", "error"],
      violation_type: [
        "direcao_continua_excedida",
        "jornada_diaria_excedida",
        "intervalo_interjornada_insuficiente",
        "intervalo_refeicao_insuficiente",
        "horas_extras_excedidas",
      ],
    },
  },
} as const
