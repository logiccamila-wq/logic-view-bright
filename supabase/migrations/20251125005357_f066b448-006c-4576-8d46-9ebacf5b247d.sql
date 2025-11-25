-- Corrigir políticas RLS para plano_contas
DROP POLICY IF EXISTS "Allow authenticated users to read plano_contas" ON plano_contas;
DROP POLICY IF EXISTS "Allow authenticated users to insert plano_contas" ON plano_contas;
DROP POLICY IF EXISTS "Allow authenticated users to update plano_contas" ON plano_contas;
DROP POLICY IF EXISTS "Allow authenticated users to delete plano_contas" ON plano_contas;

CREATE POLICY "Allow authenticated users to read plano_contas"
  ON plano_contas FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert plano_contas"
  ON plano_contas FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update plano_contas"
  ON plano_contas FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete plano_contas"
  ON plano_contas FOR DELETE
  TO authenticated
  USING (true);

-- Corrigir políticas RLS para lancamentos_financeiros
DROP POLICY IF EXISTS "Allow authenticated users to read lancamentos_financeiros" ON lancamentos_financeiros;
DROP POLICY IF EXISTS "Allow authenticated users to insert lancamentos_financeiros" ON lancamentos_financeiros;
DROP POLICY IF EXISTS "Allow authenticated users to update lancamentos_financeiros" ON lancamentos_financeiros;
DROP POLICY IF EXISTS "Allow authenticated users to delete lancamentos_financeiros" ON lancamentos_financeiros;

CREATE POLICY "Allow authenticated users to read lancamentos_financeiros"
  ON lancamentos_financeiros FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert lancamentos_financeiros"
  ON lancamentos_financeiros FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update lancamentos_financeiros"
  ON lancamentos_financeiros FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete lancamentos_financeiros"
  ON lancamentos_financeiros FOR DELETE
  TO authenticated
  USING (true);