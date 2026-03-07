async function testLogin() {
  const apiBase = (process.env.VITE_API_BASE_URL || 'http://localhost:7071/api').replace(/\/$/, '');
  const runtimeBase = `${apiBase}/runtime`;

  console.log('🔐 Testando login com logiccamila@gmail.com...\n');

  const resp = await fetch(`${runtimeBase}/auth/signin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'logiccamila@gmail.com', password: 'Multi.13' }),
  });

  const result = await resp.json();

  if (result.error) {
    console.error('❌ Erro no login:', result.error.message || String(result.error));
    process.exit(1);
  }

  const user = result.data?.session?.user;
  console.log('✅ Login bem-sucedido!');
  console.log('\n📧 Email:', user?.email);
  console.log('🆔 User ID:', user?.id);
  console.log('\n✅ Nome exibido:', user?.user_metadata?.full_name || user?.email);
  console.log('\n🌐 Pode fazer login em: https://www.xyzlogicflow.com.br/login');
}

testLogin().catch(console.error);
