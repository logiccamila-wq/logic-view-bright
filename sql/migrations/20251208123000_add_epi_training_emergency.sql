-- Adicionar novos valores ao enum document_type
DO $$
BEGIN
  BEGIN
    ALTER TYPE document_type ADD VALUE IF NOT EXISTS 'epi';
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER TYPE document_type ADD VALUE IF NOT EXISTS 'training';
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER TYPE document_type ADD VALUE IF NOT EXISTS 'emergency_kit';
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END $$;
