-- Adicionar novos valores ao enum app_role
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'mecanico';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'motorista';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'financeiro';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'operacoes';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'comercial';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'frota';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'auxiliar_manutencao';