const { createClient } = require('@supabase/supabase-js');

async function updateCamilaProfile() {
  const supabaseUrl = 'https://eixkvksttadhukucohda.supabase.co';
  const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpeGt2a3N0dGFkaHVrdWNvaGRhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzQzODEwNSwiZXhwIjoyMDc5MDE0MTA1fQ.2_KPoKEJoOrLvBwTT92BliPeGOPb3es3qOrFtnmaaWg';

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  const userId = 'd8a93554-18e1-454a-a3a2-1441cbfaa1bc';

  console.log('🔄 Atualizando metadata do usuário...\n');
  
  // Atualizar metadata do auth.users
  const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
    user_metadata: {
      name: 'Logística',
      display_name: 'Logística',
      full_name: 'Logística'
    }
  });
  
  if (updateError) {
    console.error('❌ Erro ao atualizar metadata:', updateError.message);
  } else {
    console.log('✅ Metadata atualizada com sucesso!');
  }
  
  console.log('\n📝 Verificando perfil do usuário...');
  
  // Buscar profile se existe
  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId);
  
  if (profileError) {
    console.log('⚠️  Erro ao buscar profile:', profileError.message);
  } else if (profiles && profiles.length > 0) {
    console.log('✅ Perfis encontrados:');
    console.log(profiles);
    
    // Atualizar name do primeiro profile
    const { error: updateProfileError } = await supabase
      .from('profiles')
      .update({ name: 'Logística' })
      .eq('id', userId);
    
    if (updateProfileError) {
      console.log('⚠️  Erro ao atualizar profile:', updateProfileError.message);
    } else {
      console.log('✅ Nome do profile atualizado!');
    }
  } else {
    console.log('ℹ️  Nenhum profile encontrado na tabela');
  }
  
  console.log('\n✅ Processo concluído!');
  console.log('\n🔐 Credenciais de Login:');
  console.log('   Email: logiccamila@gmail.com');
  console.log('   Senha: Multi.13');
  console.log('   Nome exibido: Logística');
  console.log('\n🌐 Acesse: https://logic-view-bright.vercel.app/login');
}

updateCamilaProfile().catch(console.error);
