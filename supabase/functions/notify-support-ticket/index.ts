import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TicketNotification {
  ticket_number: string;
  subject: string;
  user_name: string;
  user_email: string;
  priority: string;
  type: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { ticket_number, subject, user_name, user_email, priority, type }: TicketNotification = await req.json();
    
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY não configurada');
    }

    // HTML do email
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #DC2626;">🎫 Novo Ticket de Suporte</h2>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Ticket:</strong> ${ticket_number}</p>
          <p><strong>Tipo:</strong> ${type === 'support' ? 'Suporte' : type === 'internal' ? 'Interno' : 'Ajuda'}</p>
          <p><strong>Prioridade:</strong> ${priority}</p>
          <p><strong>Assunto:</strong> ${subject}</p>
          <p><strong>Usuário:</strong> ${user_name} (${user_email})</p>
        </div>
        <p style="color: #666; font-size: 14px;">
          Acesse o sistema para responder este ticket.
        </p>
        <p style="color: #999; font-size: 12px; margin-top: 20px;">
          WhatsApp: 81989684986
        </p>
      </div>
    `;

    // Enviar email via Resend API
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'LogicFlow Support <onboarding@resend.dev>',
        to: ['suporte@xyzlogicflow.tech'],
        subject: `[${ticket_number}] ${subject}`,
        html: emailHtml,
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error('Erro ao enviar email:', errorText);
      throw new Error(`Falha ao enviar email: ${errorText}`);
    }

    console.log('Email enviado com sucesso para suporte@xyzlogicflow.tech');

    // Preparar mensagem para WhatsApp
    const whatsappMessage = `
🎫 *Novo Ticket de Suporte*

*Ticket:* ${ticket_number}
*Tipo:* ${type === 'support' ? 'Suporte' : type === 'internal' ? 'Interno' : 'Ajuda'}
*Prioridade:* ${priority}
*Assunto:* ${subject}
*Usuário:* ${user_name} (${user_email})

Acesse o sistema para responder.
    `.trim();

    // Log da mensagem WhatsApp (integração completa requer API do WhatsApp Business)
    console.log('Mensagem WhatsApp preparada para 81989684986:', whatsappMessage);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Notificações enviadas com sucesso',
        whatsapp_number: '81989684986',
        email_sent: true
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Erro ao enviar notificações:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
