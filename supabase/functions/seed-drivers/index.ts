import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const DRIVERS_TO_SEED = [
  {
    nome: "JAILSON PEREIRA DE BARROS",
    apelido: "JAILSON",
    cidade: "Cabo de Santo Agostinho",
    telefone: "",
    cpf: "04979633455",
    rg: "6741375",
    tipo_vinculo: "AGREGADO"
  },
  {
    nome: "RIVANIO VICENTE ALEIXO",
    apelido: "RIVANIO",
    cidade: "Cabo de Santo Agostinho",
    telefone: "81986281545",
    cpf: "05394253463",
    rg: "",
    tipo_vinculo: "PRÓPRIO"
  },
  {
    nome: "ENIO GOMES BARBOSA JÚNIOR",
    apelido: "ENIO",
    cidade: "Cabo de Santo Agostinho",
    telefone: "8182700006",
    cpf: "69648212449",
    rg: "4042216",
    tipo_vinculo: "AGREGADO"
  },
  {
    nome: "EDNALDO HELENO DE BARROS",
    apelido: "EDNALDO",
    cidade: "CABO DE SANTO AGOSTINHO",
    telefone: "81994049752",
    cpf: "88786811487",
    rg: "4915332",
    tipo_vinculo: "PRÓPRIO"
  },
  {
    nome: "NILTON CARLOS GOMES DA SILVA",
    apelido: "NILTON",
    cidade: "Jaboatão dos Guararapes",
    telefone: "",
    cpf: "05058861461",
    rg: "6076189",
    tipo_vinculo: "PRÓPRIO"
  },
  {
    nome: "MARCIO FRANCISCO DO NASCIMENTO",
    apelido: "MARCIO",
    cidade: "Recife",
    telefone: "",
    cpf: "88733173400",
    rg: "4826095",
    tipo_vinculo: "AGREGADO"
  },
  {
    nome: "JOSÉ ANTÔNIO DOS SANTOS",
    apelido: "JOSÉ ANTÔNIO",
    cidade: "Recife",
    telefone: "81981132528",
    cpf: "80850243491",
    rg: "4487747",
    tipo_vinculo: "PRÓPRIO"
  },
  {
    nome: "RUAN VINÍCIUS DE OLIVEIRA CUNHA",
    apelido: "RUAN",
    cidade: "Cabo de Santo Agostinho",
    telefone: "81994605480",
    cpf: "12765894418",
    rg: "9987102",
    tipo_vinculo: "PRÓPRIO"
  },
  {
    nome: "GEISIEL LOPES DE ALBUQUERQUE",
    apelido: "GEISIEL",
    cidade: "CABO DE SANTO AGOSTINHO",
    telefone: "",
    cpf: "04929876451",
    rg: "6078078",
    tipo_vinculo: "PRÓPRIO"
  },
  {
    nome: "DANILO SANTOS DE SOUZA",
    apelido: "DANILO",
    cidade: "Salvador",
    telefone: "71992859904",
    cpf: "02107351554",
    rg: "835617904",
    tipo_vinculo: "AGREGADO"
  },
  {
    nome: "MESSIAS AUGUSTO DA SILVA",
    apelido: "MESSIAS",
    cidade: "Escada",
    telefone: "",
    cpf: "85634000459",
    rg: "3693016",
    tipo_vinculo: "AGREGADO"
  }
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const results = [];
    let created = 0;
    let skipped = 0;
    let errors = 0;

    for (const driver of DRIVERS_TO_SEED) {
      try {
        const email = `${driver.cpf.replace(/\D/g, '')}@motorista.ejg.com`;
        const password = driver.cpf.replace(/\D/g, '');

        // Verificar se o usuário já existe
        const { data: existingUser } = await supabaseAdmin
          .from('profiles')
          .select('id, email')
          .eq('cpf', driver.cpf)
          .single();

        if (existingUser) {
          results.push({
            email,
            status: 'skipped',
            message: 'Motorista já cadastrado'
          });
          skipped++;
          continue;
        }

        // Criar usuário
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: {
            full_name: driver.nome,
            apelido: driver.apelido
          }
        });

        if (createError) throw createError;

        // Atualizar perfil com informações adicionais
        const { error: updateError } = await supabaseAdmin
          .from('profiles')
          .update({
            full_name: driver.nome,
            apelido: driver.apelido,
            telefone: driver.telefone,
            cpf: driver.cpf,
            rg: driver.rg,
            cidade: driver.cidade,
            tipo_vinculo: driver.tipo_vinculo
          })
          .eq('id', newUser.user!.id);

        if (updateError) throw updateError;

        // Atribuir role de motorista
        const { error: roleError } = await supabaseAdmin
          .from('user_roles')
          .insert({
            user_id: newUser.user!.id,
            role: 'driver'
          });

        if (roleError) throw roleError;

        results.push({
          email,
          status: 'created',
          message: 'Motorista criado com sucesso'
        });
        created++;

      } catch (error: any) {
        results.push({
          email: driver.nome,
          status: 'error',
          message: error?.message || 'Erro desconhecido'
        });
        errors++;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        summary: {
          total: DRIVERS_TO_SEED.length,
          created,
          skipped,
          errors
        },
        results
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error?.message || 'Erro desconhecido' }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
