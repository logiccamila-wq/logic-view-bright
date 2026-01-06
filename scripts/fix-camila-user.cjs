const { createClient } = require('@supabase/supabase-js');

async function fixCamilaUser() {
  const supabaseUrl = 'https://eixkvksttadhukucohda.supabase.co';
  const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpeGt2a3N0dGFkaHVrdWNvaGRhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzQzODEwNSwiZXhwIjoyMDc5MDE0MTA1fQ.2_KPoKEJoOrLvBwTT92BliPeGOPb3es3qOrFtnmaaWg';

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  console.log('🔍 Buscando usuário logiccamila@gmail.com...\n');

  // Buscar todos os usuários
  const { data: usersData, error: listError } = await supabase.auth.admin.listUsers();
  
  if (listError) {
    console.error('❌ Erro ao listar usuários:', listError.message);
    return;
  }

  const user = usersData.users.find(u => u.email === 'logiccamila@gmail.com');
  
  if (!user) {
    console.log('❌ Usuário não encontrado!');
    console.log('📧 Criando novo usuário...\n');
    
    const { data, error } = await supabase.auth.admin.createUser({
      email: 'logiccamila@gmail.com',
      password: 'Multi.13',
      email_confirm: true,
      user_metadata: {
        full_name: 'Logística',
        name: 'Logística',
        role: 'admin'
      }
    });
    
    if (error) {
      console.error('❌ Erro ao criar:', error.message);
      return;
    }
    
    console.log('✅ Usuário criado com sucesso!');
    console.log('User ID:', data.user.id);
    
    // Criar registro na tabela profiles
    await createProfile(supabase, data.user.id);
    await assignRole(supabase, data.user.id);
    
  } else {
    console.log('✅ Usuário encontrado!');
    console.log('User ID:', user.id);
    console.log('Email confirmado:', user.email_confirmed_at ? '✅ Sim' : '❌ Não');
    console.log('Metadata atual:', JSON.stringify(user.user_metadata, null, 2));
    
    // Atualizar usuário
    console.log('\n🔄 Atualizando usuário...');
    const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
      password: 'Multi.13',
      email_confirm: true,
      user_metadata: {
        full_name: 'Logística',
        name: 'Logística',
        role: 'admin'
      }
    });
    
    if (updateError) {
      console.error('❌ Erro ao atualizar:', updateError.message);
    } else {
      console.log('✅ Usuário atualizado!');
    }
    
    // Atualizar/criar profile
    await createProfile(supabase, user.id);
    await assignRole(supabase, user.id);
  }
  
  console.log('\n✅ Processo concluído!');
  console.log('\n🔐 Credenciais:');
  console.log('   Email: logiccamila@gmail.com');
  console.log('   Senha: Multi.13');
  console.log('\n🌐 URL: https://logic-view-bright.vercel.app/login');
}

async function createProfile(supabase, userId) {
  console.log('\n📝 Criando/atualizando perfil...');
  
  // Verificar se profile existe
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (existingProfile) {
    // Atualizar
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: 'Logística',
        role: 'admin',
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);
    
    if (error) {
      console.log('⚠️  Erro ao atualizar profile:', error.message);
    } else {
      console.log('✅ Profile atualizado!');
    }
  } else {
    // Criar
    const { error } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        full_name: 'Logística',
        role: 'admin'
      });
    
    if (error) {
      console.log('⚠️  Erro ao criar profile:', error.message);
    } else {
      console.log('✅ Profile criado!');
    }
  }
}

async function assignRole(supabase, userId) {
  console.log('\n👤 Verificando role admin...');
  
  // Buscar role admin
  const { data: adminRole } = await supabase
    .from('roles')
    .select('id')
    .eq('name', 'Admin')
    .single();
  
  if (!adminRole) {
    console.log('⚠️  Role Admin não encontrada');
    return;
  }
  
  // Verificar se user_role existe
  const { data: existingUserRole } = await supabase
    .from('user_roles')
    .select('*')
    .eq('user_id', userId)
    .eq('role_id', adminRole.id)
    .single();
  
  if (!existingUserRole) {
    const { error } = await supabase
      .from('user_roles')
      .insert({
        user_id: userId,
        role_id: adminRole.id
      });
    
    if (error) {
      console.log('⚠️  Erro ao atribuir role:', error.message);
    } else {
      console.log('✅ Role Admin atribuída!');
    }
  } else {
    console.log('✅ Role Admin já existe!');
  }
}

fixCamilaUser().catch(console.error);
