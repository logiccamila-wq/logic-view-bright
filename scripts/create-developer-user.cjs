const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

function loadEnv() {
  const envs = {};
  const files = ['.env', '.env.local'];
  for (const f of files) {
    const p = path.resolve(process.cwd(), f);
    if (fs.existsSync(p)) {
      const txt = fs.readFileSync(p, 'utf8');
      for (const line of txt.split(/\r?\n/)) {
        const t = line.trim();
        if (!t || t.startsWith('#')) continue;
        const idx = t.indexOf('=');
        if (idx === -1) continue;
        const key = t.slice(0, idx).trim();
        let val = t.slice(idx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        envs[key] = val;
      }
    }
  }
  return envs;
}

async function createDeveloperUser() {
  try {
    const envs = { ...process.env, ...loadEnv() };
    const supabaseUrl = envs.SUPABASE_URL || envs.VITE_SUPABASE_URL || '';
    const serviceKey = envs.SUPABASE_SERVICE_ROLE_KEY || '';
    
    if (!supabaseUrl || !serviceKey) {
      console.error('❌ Missing SUPABASE_URL/VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
      console.log('\n💡 Certifique-se de que as variáveis de ambiente estão configuradas');
      process.exit(1);
    }

    console.log('🔧 Criando usuário desenvolvedor...\n');
    console.log('📧 Email: logiccamila@gmail.com');
    console.log('🔑 Senha: Multi.13\n');

    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Tentar criar o usuário
    const { data, error } = await supabase.auth.admin.createUser({
      email: 'logiccamila@gmail.com',
      password: 'Multi.13',
      email_confirm: true,
      user_metadata: {
        name: 'Camila - Developer',
        role: 'admin'
      }
    });

    if (error) {
      if (error.message.includes('already registered')) {
        console.log('⚠️  Usuário já existe no sistema');
        console.log('🔄 Tentando atualizar senha...\n');
        
        // Buscar usuário existente
        const { data: users } = await supabase.auth.admin.listUsers();
        const existingUser = users?.users?.find(u => u.email === 'logiccamila@gmail.com');
        
        if (existingUser) {
          // Atualizar senha
          const { error: updateError } = await supabase.auth.admin.updateUserById(
            existingUser.id,
            { password: 'Multi.13' }
          );
          
          if (updateError) {
            console.error('❌ Erro ao atualizar senha:', updateError.message);
            process.exit(1);
          }
          
          console.log('✅ Senha atualizada com sucesso!');
          console.log(`👤 User ID: ${existingUser.id}\n`);
          
          // Atribuir role de admin
          await assignAdminRole(supabaseUrl, serviceKey, existingUser.id);
          
          console.log('\n✅ Usuário desenvolvedor configurado com sucesso!');
          console.log('\n🔐 Credenciais de Login:');
          console.log('   Email: logiccamila@gmail.com');
          console.log('   Senha: Multi.13');
          console.log('\n🌐 URL de Login: https://logic-view-bright.vercel.app/login\n');
          process.exit(0);
        }
      } else {
        console.error('❌ Erro ao criar usuário:', error.message);
        process.exit(1);
      }
    }

    const userId = data?.user?.id;
    if (!userId) {
      console.error('❌ User ID não encontrado');
      process.exit(1);
    }

    console.log(`✅ Usuário criado com sucesso!`);
    console.log(`👤 User ID: ${userId}\n`);

    // Atribuir role de admin
    await assignAdminRole(supabaseUrl, serviceKey, userId);

    console.log('\n✅ Usuário desenvolvedor criado com sucesso!');
    console.log('\n🔐 Credenciais de Login:');
    console.log('   Email: logiccamila@gmail.com');
    console.log('   Senha: Multi.13');
    console.log('\n🌐 URL de Login: https://logic-view-bright.vercel.app/login\n');
    
    process.exit(0);
  } catch (e) {
    console.error('❌ Erro inesperado:', e?.message || String(e));
    process.exit(1);
  }
}

async function assignAdminRole(supabaseUrl, serviceKey, userId) {
  console.log('🔑 Atribuindo role de admin...');
  
  try {
    // Verificar se já existe a role
    const checkResp = await fetch(`${supabaseUrl}/rest/v1/user_roles?user_id=eq.${userId}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceKey}`,
        'apikey': serviceKey
      }
    });
    
    const existingRoles = await checkResp.json();
    
    if (existingRoles && existingRoles.length > 0) {
      console.log('   ✓ Role de admin já existe');
      return;
    }
    
    // Criar role de admin
    const resp = await fetch(`${supabaseUrl}/rest/v1/user_roles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceKey}`,
        'apikey': serviceKey,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        user_id: userId,
        role: 'admin'
      })
    });

    if (resp.status === 201 || resp.status === 200) {
      console.log('   ✓ Role de admin atribuída com sucesso');
    } else {
      const txt = await resp.text();
      console.log(`   ⚠️  Status da role: ${resp.status} - ${txt}`);
    }
  } catch (e) {
    console.log('   ⚠️  Erro ao atribuir role (pode não afetar o login):', e.message);
  }
}

createDeveloperUser();
