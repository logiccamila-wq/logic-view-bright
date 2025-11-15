import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UserData {
  email: string;
  password: string;
  role: string;
  full_name?: string;
}

const USERS_TO_SEED: UserData[] = [
  // Diretores (acesso completo como logistics_manager)
  { email: 'jailson.barros@ejgtransporte.com.br', password: 'financeiro123', role: 'logistics_manager', full_name: 'Jailson Barros - Diretor Financeiro' },
  { email: 'enio.gomes@ejgtransportecom.br', password: 'operacional123', role: 'logistics_manager', full_name: 'Enio Gomes - Diretor Operacional' },
  
  // Administrativo (admin completo)
  { email: 'administrati@ejgtransporte.com.br', password: 'adm123456', role: 'admin', full_name: 'Edjane - Administrativo' },
  
  // Gestores
  { email: 'comercial@ejgtransporte.com.br', password: 'comercial123', role: 'commercial', full_name: 'Comercial' },
  { email: 'frota@ejgtransporte.com.br', password: 'frota123', role: 'fleet_maintenance', full_name: 'Mecânico - Frota/Manutenção' },
  { email: 'miguellareste37@gmail.com', password: 'auxiliar123', role: 'maintenance_assistant', full_name: 'Miguel - Auxiliar Mecânico' },
  
  // Admins e testes
  { email: 'logiccamila@gmail.com', password: 'Multi12345678', role: 'admin', full_name: 'Camila - Admin' },
  { email: 'camila.eteste@gmail.com', password: 'Multi@#$%362748', role: 'admin', full_name: 'Camila Teste' },
  { email: 'camila.etseral@gmail.com', password: 'Multi@#$%362748', role: 'admin', full_name: 'Camila Etseral' },
  { email: 'teste@teste.com', password: 'teste123', role: 'admin', full_name: 'Usuário Teste' },
];

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Create admin client
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const results = {
      success: [] as string[],
      errors: [] as { email: string; error: string }[],
      skipped: [] as string[],
    };

    // Process each user
    for (const userData of USERS_TO_SEED) {
      try {
        // Check if user already exists
        const { data: existingUser } = await supabaseAdmin.auth.admin.listUsers();
        const userExists = existingUser?.users?.some(u => u.email === userData.email);

        if (userExists) {
          results.skipped.push(userData.email);
          continue;
        }

        // Create user with admin API
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email: userData.email,
          password: userData.password,
          email_confirm: true,
          user_metadata: {
            full_name: userData.full_name || userData.email,
          },
        });

        if (createError) {
          results.errors.push({ email: userData.email, error: createError.message });
          continue;
        }

        if (!newUser.user) {
          results.errors.push({ email: userData.email, error: 'User creation failed' });
          continue;
        }

        // Assign role
        const { error: roleError } = await supabaseAdmin
          .from('user_roles')
          .insert({
            user_id: newUser.user.id,
            role: userData.role,
          });

        if (roleError) {
          results.errors.push({ 
            email: userData.email, 
            error: `User created but role assignment failed: ${roleError.message}` 
          });
          continue;
        }

        results.success.push(userData.email);

      } catch (error: any) {
        results.errors.push({ 
          email: userData.email, 
          error: error.message || 'Unknown error' 
        });
      }
    }

    return new Response(
      JSON.stringify({
        message: 'Seed process completed',
        summary: {
          total: USERS_TO_SEED.length,
          created: results.success.length,
          skipped: results.skipped.length,
          failed: results.errors.length,
        },
        details: results,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        details: error.toString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
