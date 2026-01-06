const { createClient } = require('@supabase/supabase-js');

async function checkSchema() {
  const supabaseUrl = 'https://eixkvksttadhukucohda.supabase.co';
  const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpeGt2a3N0dGFkaHVrdWNvaGRhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzQzODEwNSwiZXhwIjoyMDc5MDE0MTA1fQ.2_KPoKEJoOrLvBwTT92BliPeGOPb3es3qOrFtnmaaWg';

  const supabase = createClient(supabaseUrl, serviceKey);

  console.log('🔍 Verificando estrutura da tabela profiles...\n');
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .limit(1);
  
  if (error) {
    console.log('❌ Erro:', error.message);
  } else {
    console.log('✅ Colunas disponíveis em profiles:');
    if (data && data[0]) {
      console.log(Object.keys(data[0]));
    } else {
      console.log('(tabela vazia)');
    }
  }
  
  console.log('\n🔍 Verificando roles disponíveis...\n');
  
  const { data: roles, error: rolesError } = await supabase
    .from('roles')
    .select('*');
  
  if (rolesError) {
    console.log('❌ Erro ao buscar roles:', rolesError.message);
  } else {
    console.log('✅ Roles disponíveis:');
    console.log(roles);
  }
  
  console.log('\n🔍 Verificando perfil do usuário...\n');
  const userId = 'd8a93554-18e1-454a-a3a2-1441cbfaa1bc';
  
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (profileError) {
    console.log('❌ Perfil não encontrado:', profileError.message);
  } else {
    console.log('✅ Perfil atual:');
    console.log(profile);
  }
}

checkSchema().catch(console.error);
