
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';
import { Resend } from "npm:resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, fullName, area, rolEmpresa, invitedBy } = await req.json();
    
    console.log('📧 Sending invitation to:', email);
    
    // Validate email format (any domain allowed)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Email inválido');
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Generate temporary password
    const tempPassword = Math.random().toString(36).slice(-12) + 'A1!';

    // Create user account
    const { data: userData, error: signUpError } = await supabase.auth.admin.createUser({
      email: email,
      password: tempPassword,
      user_metadata: {
        full_name: fullName,
        area: area,
        rol_empresa: rolEmpresa
      },
      email_confirm: true
    });

    if (signUpError) {
      throw new Error(`Error creando usuario: ${signUpError.message}`);
    }

    console.log('✅ User created successfully');

    // Send invitation email
    // TODO: Cambiar dominio del remitente cuando se verifique cerebro-ivory.vercel.app o usacerebro.com en Resend
    const emailFrom = Deno.env.get("EMAIL_FROM") || "CEREBRO <noreply@retorna.app>";
    const emailResponse = await resend.emails.send({
      from: emailFrom,
      to: [email],
      subject: "Bienvenido a CEREBRO - Tu acceso a la plataforma de conocimiento",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #7c3aed; margin: 0;">🧠 CEREBRO</h1>
            <p style="color: #666; margin: 5px 0;">Plataforma de Conocimiento Inteligente</p>
          </div>
          
          <h2 style="color: #333;">¡Hola ${fullName}! 👋</h2>
          
          <p style="color: #555; line-height: 1.6;">
            Has sido invitado a unirte a <strong>CEREBRO</strong>, la capa de contexto operacional de tu empresa.
          </p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Tus credenciales de acceso:</h3>
            <p style="margin: 10px 0;"><strong>Email:</strong> ${email}</p>
            <p style="margin: 10px 0;"><strong>Password temporal:</strong> <code style="background: #e9ecef; padding: 2px 6px; border-radius: 4px;">${tempPassword}</code></p>
            <p style="margin: 10px 0;"><strong>Área asignada:</strong> ${area}</p>
            <p style="margin: 10px 0;"><strong>Rol:</strong> ${rolEmpresa}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://cerebro-ivory.vercel.app" 
               style="background: #7c3aed; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Acceder a CEREBRO
            </a>
          </div>
          
          <div style="background: #e7f3ff; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <h4 style="color: #0066cc; margin-top: 0;">¿Qué puedes hacer en CEREBRO?</h4>
            <ul style="color: #555; margin: 0; padding-left: 20px;">
              <li>Chatear con la IA para obtener información interna</li>
              <li>Consultar documentos y políticas de la empresa</li>
              <li>Buscar procedimientos específicos por área</li>
              <li>Acceder a scripts de atención al cliente</li>
            </ul>
          </div>
          
          <p style="color: #777; font-size: 14px; margin-top: 30px;">
            <strong>Importante:</strong> Cambia tu password temporal después del primer login por seguridad.
          </p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          
          <p style="color: #999; font-size: 12px; text-align: center;">
            Este email fue enviado desde CEREBRO<br>
            Si tienes problemas accediendo, contacta al administrador del sistema.
          </p>
        </div>
      `,
    });

    if (emailResponse.error) {
      console.error('Email sending failed:', emailResponse.error);
      throw new Error(`Error enviando email: ${emailResponse.error.message}`);
    }

    console.log('✅ Invitation email sent successfully');

    // Log the email sending
    await supabase
      .from('email_logs')
      .insert({
        to_email: email,
        subject: "Bienvenido a CEREBRO - Tu acceso a la plataforma de conocimiento",
        status: 'sent',
        created_by: invitedBy
      });

    return new Response(JSON.stringify({ 
      success: true,
      email: email,
      tempPassword: tempPassword,
      userId: userData.user?.id
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in send-invitation function:', error);
    
    // Log failed email
    try {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      await supabase
        .from('email_logs')
        .insert({
          to_email: req.body?.email || 'unknown',
          subject: "Bienvenido a CEREBRO - Tu acceso a la plataforma de conocimiento",
          status: 'failed',
          error_message: error.message
        });
    } catch (logError) {
      console.error('Failed to log email error:', logError);
    }

    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
