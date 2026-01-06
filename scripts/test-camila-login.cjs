const { createClient } = require('@supabase/supabase-js');

async function testLogin() {
  const supabaseUrl = 'https://eixkvksttadhukucohda.supabase.co';
  const anonKey = 'sb_publishable_dDvmA4UZtlFG3WaFo4ayFw_AJAnc7U3';

  const supabase = createClient(supabaseUrl, anonKey);

  console.log('🔐 Testando login com logiccamila@gmail.com...\n');

  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'logiccamila@gmail.com',
    password: 'Multi.13',
  });

  if (error) {
    console.error('❌ Erro no login:', error.message);
    process.exit(1);
  }

  console.log('✅ Login bem-sucedido!');
  console.log('\n📧 Email:', data.user.email);
  console.log('🆔 User ID:', data.user.id);
  console.log('✉️  Email confirmado:', data.user.email_confirmed_at ? 'Sim' : 'Não');
  console.log('\n👤 Metadata do usuário:');
  console.log(JSON.stringify(data.user.user_metadata, null, 2));
  console.log('\n✅ Nome exibido:', data.user.user_metadata?.name || data.user.user_metadata?.display_name || data.user.email);
  console.log('\n🌐 Pode fazer login em: https://logic-view-bright.vercel.app/login');
}

testLogin().catch(console.error);
