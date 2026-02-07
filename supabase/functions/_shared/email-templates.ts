/**
 * Email Templates for Guest Checkout
 * HTML and plain text templates for welcome and reminder emails
 */

interface WelcomeEmailData {
  setupLink: string;
  expiryHours: number;
}

interface ReminderEmailData {
  setupLink: string;
  hoursRemaining: number;
}

/**
 * Generates welcome email HTML content
 * Sent immediately after successful payment
 */
export function generateWelcomeEmailHtml(data: WelcomeEmailData): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to StartupBase - Complete Your Setup</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #f6f9fc;
      color: #1a202c;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 40px 20px;
      text-align: center;
    }
    .header h1 {
      color: #ffffff;
      margin: 0;
      font-size: 28px;
      font-weight: 600;
    }
    .content {
      padding: 40px 30px;
    }
    .content h2 {
      color: #2d3748;
      font-size: 22px;
      margin-top: 0;
      margin-bottom: 16px;
    }
    .content p {
      color: #4a5568;
      font-size: 16px;
      line-height: 1.6;
      margin-bottom: 16px;
    }
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #ffffff !important;
      text-decoration: none;
      padding: 14px 32px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
      margin: 24px 0;
      text-align: center;
    }
    .cta-button:hover {
      opacity: 0.9;
    }
    .info-box {
      background-color: #edf2f7;
      border-left: 4px solid #667eea;
      padding: 16px;
      margin: 24px 0;
      border-radius: 4px;
    }
    .info-box p {
      margin: 0;
      font-size: 14px;
      color: #2d3748;
    }
    .footer {
      background-color: #f7fafc;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #e2e8f0;
    }
    .footer p {
      color: #718096;
      font-size: 14px;
      margin: 8px 0;
    }
    .footer a {
      color: #667eea;
      text-decoration: none;
    }
    @media only screen and (max-width: 600px) {
      .content {
        padding: 30px 20px;
      }
      .header h1 {
        font-size: 24px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to StartupBase! 🎉</h1>
    </div>

    <div class="content">
      <h2>Thank you for your purchase!</h2>

      <p>Your payment was successful and you now have premium access to all our startup ideas and reports.</p>

      <p>To get started, please complete your account setup by creating a password:</p>

      <div style="text-align: center;">
        <a href="${data.setupLink}" class="cta-button">Complete Account Setup</a>
      </div>

      <div class="info-box">
        <p><strong>⏰ Important:</strong> This setup link will expire in ${data.expiryHours} hours for security reasons. Please complete your setup soon!</p>
      </div>

      <p>Once you've set your password, you'll be able to:</p>
      <ul style="color: #4a5568; font-size: 16px; line-height: 1.8;">
        <li>Access all premium idea reports</li>
        <li>View detailed market analysis</li>
        <li>Explore revenue models and execution plans</li>
        <li>Save and track your favorite ideas</li>
      </ul>

      <p>If you have any questions or need assistance, feel free to reach out to us at <a href="mailto:admin@startupbase.co.in" style="color: #667eea;">admin@startupbase.co.in</a></p>

      <p>Happy building! 🚀</p>
      <p><strong>The StartupBase Team</strong></p>
    </div>

    <div class="footer">
      <p>StartupBase - Curated Startup Ideas & Market Research</p>
      <p><a href="https://startupbase.co.in">startupbase.co.in</a></p>
      <p style="font-size: 12px; color: #a0aec0; margin-top: 16px;">
        If you didn't make this purchase, please contact us immediately.
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Generates welcome email plain text content
 */
export function generateWelcomeEmailText(data: WelcomeEmailData): string {
  return `
Welcome to StartupBase!

Thank you for your purchase! Your payment was successful and you now have premium access to all our startup ideas and reports.

To get started, please complete your account setup by creating a password:

${data.setupLink}

⏰ IMPORTANT: This setup link will expire in ${data.expiryHours} hours for security reasons. Please complete your setup soon!

Once you've set your password, you'll be able to:
• Access all premium idea reports
• View detailed market analysis
• Explore revenue models and execution plans
• Save and track your favorite ideas

If you have any questions or need assistance, feel free to reach out to us at admin@startupbase.co.in

Happy building! 🚀

The StartupBase Team

---
StartupBase - Curated Startup Ideas & Market Research
https://startupbase.co.in

If you didn't make this purchase, please contact us immediately.
  `.trim();
}

/**
 * Generates reminder email HTML content
 * Sent when setup token is about to expire
 */
export function generateReminderEmailHtml(data: ReminderEmailData): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Complete Your StartupBase Setup</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #f6f9fc;
      color: #1a202c;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .header {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      padding: 40px 20px;
      text-align: center;
    }
    .header h1 {
      color: #ffffff;
      margin: 0;
      font-size: 28px;
      font-weight: 600;
    }
    .content {
      padding: 40px 30px;
    }
    .content h2 {
      color: #2d3748;
      font-size: 22px;
      margin-top: 0;
      margin-bottom: 16px;
    }
    .content p {
      color: #4a5568;
      font-size: 16px;
      line-height: 1.6;
      margin-bottom: 16px;
    }
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      color: #ffffff !important;
      text-decoration: none;
      padding: 14px 32px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
      margin: 24px 0;
      text-align: center;
    }
    .cta-button:hover {
      opacity: 0.9;
    }
    .warning-box {
      background-color: #fff5f5;
      border-left: 4px solid #f5576c;
      padding: 16px;
      margin: 24px 0;
      border-radius: 4px;
    }
    .warning-box p {
      margin: 0;
      font-size: 14px;
      color: #742a2a;
    }
    .footer {
      background-color: #f7fafc;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #e2e8f0;
    }
    .footer p {
      color: #718096;
      font-size: 14px;
      margin: 8px 0;
    }
    .footer a {
      color: #f5576c;
      text-decoration: none;
    }
    @media only screen and (max-width: 600px) {
      .content {
        padding: 30px 20px;
      }
      .header h1 {
        font-size: 24px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⏰ Complete Your Setup</h1>
    </div>

    <div class="content">
      <h2>Your setup link is expiring soon!</h2>

      <p>We noticed you haven't completed your StartupBase account setup yet. Your premium access is active and waiting for you!</p>

      <div class="warning-box">
        <p><strong>⚠️ Urgent:</strong> Your setup link will expire in approximately ${data.hoursRemaining} hours. After that, you'll need to contact support to regain access.</p>
      </div>

      <p>Complete your setup now to start exploring premium startup ideas:</p>

      <div style="text-align: center;">
        <a href="${data.setupLink}" class="cta-button">Complete Setup Now</a>
      </div>

      <p>It only takes 30 seconds to create your password and get started.</p>

      <p>If you're having trouble with the setup or need any help, don't hesitate to reach out to us at <a href="mailto:admin@startupbase.co.in" style="color: #f5576c;">admin@startupbase.co.in</a></p>

      <p>Looking forward to seeing you inside!</p>
      <p><strong>The StartupBase Team</strong></p>
    </div>

    <div class="footer">
      <p>StartupBase - Curated Startup Ideas & Market Research</p>
      <p><a href="https://startupbase.co.in">startupbase.co.in</a></p>
      <p style="font-size: 12px; color: #a0aec0; margin-top: 16px;">
        You're receiving this because you recently purchased premium access.
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Generates reminder email plain text content
 */
export function generateReminderEmailText(data: ReminderEmailData): string {
  return `
⏰ Complete Your StartupBase Setup

Your setup link is expiring soon!

We noticed you haven't completed your StartupBase account setup yet. Your premium access is active and waiting for you!

⚠️ URGENT: Your setup link will expire in approximately ${data.hoursRemaining} hours. After that, you'll need to contact support to regain access.

Complete your setup now:
${data.setupLink}

It only takes 30 seconds to create your password and get started.

If you're having trouble with the setup or need any help, don't hesitate to reach out to us at admin@startupbase.co.in

Looking forward to seeing you inside!

The StartupBase Team

---
StartupBase - Curated Startup Ideas & Market Research
https://startupbase.co.in

You're receiving this because you recently purchased premium access.
  `.trim();
}

/**
 * Helper function to generate account setup link
 */
export function generateSetupLink(token: string, baseUrl?: string): string {
  const base = baseUrl || Deno.env.get('APP_URL') || 'https://startupbase.co.in';
  return `${base}/account-setup?token=${token}`;
}
