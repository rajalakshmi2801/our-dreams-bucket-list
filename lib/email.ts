import nodemailer from 'nodemailer';

const gmailUser = process.env.GMAIL_USER;
const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: gmailUser || '',
    pass: gmailAppPassword || ''
  }
});

export async function sendEmail(to: string, subject: string, html: string) {
  try {
    const mailOptions = {
      from: `"Our Dreams Bucket List" <${gmailUser}>`,
      to,
      subject,
      html
    };

    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`Error sending email to ${to}:`, error);
    return { success: false, error };
  }
}

// Email Templates
export const emailTemplates = {
  welcome: (name: string, username: string, password: string, role: string) => ({
    subject: `🎉 Welcome to Our Dreams Bucket List!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h1 style="color: #ec489a;">Welcome ${name}! 🌟</h1>
        <p>Your account has been created successfully as a <strong>${role === 'creator' ? 'Dream Creator' : 'Dream Fulfiller'}</strong>.</p>
        
        <div style="background: #f9f9f9; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <h2 style="color: #374151; margin-top: 0;">Your Login Credentials:</h2>
          <p><strong>Username:</strong> <span style="color: #ec489a;">${username}</span></p>
          <p><strong>Password:</strong> <span style="color: #ec489a;">${password}</span></p>
          <p><strong>Role:</strong> ${role === 'creator' ? '✨ You can create dreams' : '🎯 You can fulfill dreams'}</p>
        </div>
        
        <p>Login here: <a href="${process.env.APP_URL}/auth/login" style="color: #ec489a;">${process.env.APP_URL}/auth/login</a></p>
        
        <hr style="border: 1px solid #E5E7EB; margin: 20px 0;" />
        <p style="color: #6B7280; font-size: 14px;">Start your journey of making dreams come true! 💫</p>
      </div>
    `
  }),

  dreamCreated: (creatorName: string, dreamTitle: string, fulfillerName: string) => ({
    subject: `✨ New Dream Added by ${creatorName}!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #ec489a;">New Dream Added! 🌟</h1>
        <p>Hi ${fulfillerName},</p>
        <p><strong>${creatorName}</strong> has added a new dream to your bucket list:</p>
        
        <div style="background: #F3F4F6; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <h2 style="color: #374151; margin: 0;">"${dreamTitle}"</h2>
        </div>
        
        <p>Log in to start working on this dream!</p>
        <a href="${process.env.APP_URL}/dashboard/fulfiller" style="background: #ec489a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">View Dream</a>
      </div>
    `
  }),

  dreamActivated: (fulfillerName: string, dreamTitle: string, creatorName: string) => ({
    subject: `🎯 ${fulfillerName} is Working on Your Dream!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #ec489a;">Dream Activated! 🚀</h1>
        <p>Hi ${creatorName},</p>
        <p><strong>${fulfillerName}</strong> has started working on your dream:</p>
        
        <div style="background: #F3F4F6; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <h2 style="color: #374151; margin: 0;">"${dreamTitle}"</h2>
        </div>
        
        <p>Your dream is now in progress! 🌈</p>
      </div>
    `
  }),

  fulfillmentRequested: (fulfillerName: string, dreamTitle: string, creatorName: string) => ({
    subject: `✅ Fulfillment Request for Your Dream!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #ec489a;">Fulfillment Request! 🎊</h1>
        <p>Hi ${creatorName},</p>
        <p><strong>${fulfillerName}</strong> believes they have fulfilled your dream:</p>
        
        <div style="background: #F3F4F6; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <h2 style="color: #374151; margin: 0;">"${dreamTitle}"</h2>
        </div>
        
        <p>Please verify and mark it as fulfilled:</p>
        <a href="${process.env.APP_URL}/dashboard/creator" style="background: #ec489a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">Review Request</a>
      </div>
    `
  }),

  fulfillmentApproved: (creatorName: string, dreamTitle: string, fulfillerName: string) => ({
    subject: `🎉 Dream Fulfilled! Congratulations!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #ec489a;">Dream Fulfilled! 🌟</h1>
        <p>Hi ${fulfillerName},</p>
        <p><strong>${creatorName}</strong> has confirmed that you fulfilled their dream:</p>
        
        <div style="background: #F3F4F6; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <h2 style="color: #374151; margin: 0;">"${dreamTitle}"</h2>
        </div>
        
        <p>You made a dream come true! 🎊</p>
      </div>
    `
  }),

  fulfillmentRejected: (creatorName: string, dreamTitle: string, fulfillerName: string) => ({
    subject: `💪 Keep Going! Dream Not Yet Fulfilled`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #ec489a;">Not Yet Fulfilled</h1>
        <p>Hi ${fulfillerName},</p>
        <p><strong>${creatorName}</strong> has marked your fulfillment request as <strong>"not yet fulfilled"</strong> for:</p>

        <div style="background: #F3F4F6; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <h2 style="color: #374151; margin: 0;">"${dreamTitle}"</h2>
        </div>

        <p>Keep working on making this dream come true! You've got this! 💪</p>
      </div>
    `
  }),

  partnerEmailAlert: (originalCreatorEmail: string, suspiciousEmail: string) => ({
    subject: `⚠️ Alert: Someone tried to register your partner's email!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 2px solid #f43f5e; border-radius: 10px;">
        <h1 style="color: #e11d48;">⚠️ Partner Email Alert</h1>
        <p>Hi there,</p>
        <p>We noticed that someone using the email <strong style="color: #e11d48;">${suspiciousEmail}</strong> tried to register your partner's email address on Our Dreams Bucket List.</p>

        <div style="background: #fff1f2; padding: 20px; border-radius: 10px; margin: 20px 0; border: 1px solid #fecdd3;">
          <p style="margin: 0; color: #9f1239;"><strong>Your partner's email is already linked to your account.</strong></p>
          <p style="margin: 10px 0 0 0; color: #be123c;">If this wasn't you, please talk to your partner about this.</p>
        </div>

        <p style="color: #6B7280; font-size: 14px;">If you initiated this, you can ignore this email. Your existing account is safe and unchanged.</p>

        <hr style="border: 1px solid #fecdd3; margin: 20px 0;" />
        <p style="color: #9ca3af; font-size: 12px;">This is an automated security alert from Our Dreams Bucket List.</p>
      </div>
    `
  })
};