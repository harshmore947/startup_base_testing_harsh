import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createSetupToken } from '../_shared/token-manager.ts';
import { generateSetupLink, generateWelcomeEmailHtml, generateWelcomeEmailText } from '../_shared/email-templates.ts';

serve(async (req) => {
  try {
    const { user_id } = await req.json();

    if (!user_id) {
      return new Response(
        JSON.stringify({ error: 'user_id is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get user details
    const { data: userData } = await supabaseAdmin.auth.admin.getUserById(user_id);
    if (!userData?.user?.email) {
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const email = userData.user.email;
    console.log(`📧 Manually sending setup email to: ${email}`);

    // Create setup token
    const token = await createSetupToken(supabaseAdmin, user_id, email, 48);
    const FRONTEND_URL = Deno.env.get('FRONTEND_URL') || Deno.env.get('APP_URL') || 'https://startupbase.co.in';
    const setupLink = generateSetupLink(token, FRONTEND_URL);

    console.log(`🔗 Setup link: ${setupLink}`);

    // Send email via SendGrid
    const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY');
    const FROM_EMAIL = Deno.env.get('FROM_EMAIL') || 'noreply@mail.startupbase.co.in';
    const FROM_NAME = Deno.env.get('FROM_NAME') || 'StartupBase';

    const emailPayload = {
      personalizations: [
        {
          to: [{ email: email }],
          subject: 'Welcome to StartupBase - Complete Your Setup',
        },
      ],
      from: {
        email: FROM_EMAIL,
        name: FROM_NAME,
      },
      content: [
        {
          type: 'text/plain',
          value: generateWelcomeEmailText({ setupLink, expiryHours: 48 }),
        },
        {
          type: 'text/html',
          value: generateWelcomeEmailHtml({ setupLink, expiryHours: 48 }),
        },
      ],
    };

    console.log(`📤 Sending to SendGrid...`);
    const sendGridResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailPayload),
    });

    console.log(`📬 SendGrid response status: ${sendGridResponse.status}`);

    if (sendGridResponse.ok) {
      console.log(`✅ Email sent successfully!`);
      return new Response(
        JSON.stringify({
          success: true,
          email: email,
          setup_link: setupLink,
          message: 'Setup email sent successfully',
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } else {
      const errorText = await sendGridResponse.text();
      console.error(`❌ SendGrid error: ${errorText}`);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to send email',
          sendgrid_error: errorText,
          setup_link: setupLink,
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('❌ Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
