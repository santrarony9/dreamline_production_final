import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "465"),
    secure: parseInt(process.env.SMTP_PORT || "465") === 465,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export async function sendUserWelcomeEmail({ name, email, username, password, twoFactorSecret, role }) {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.warn("SMTP credentials not configured. Skipping email send.");
        return { success: false, reason: "SMTP credentials missing in environment variables" };
    }

    const loginUrl = process.env.NEXT_PUBLIC_SITE_URL 
        ? `${process.env.NEXT_PUBLIC_SITE_URL}/admin/login`
        : "https://dreamlineproduction.com/admin/login";

    const htmlContent = `
        <div style="font-family: Arial, sans-serif; background-color: #050505; color: #ffffff; padding: 30px; border-radius: 16px; max-w: 600px; margin: 0 auto; border: 1px solid #1a1a1a;">
            <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #222;">
                <h1 style="color: #c5a059; font-size: 24px; text-transform: uppercase; letter-spacing: 2px; margin: 0;">Dreamline Production</h1>
                <p style="color: #888; font-size: 11px; text-transform: uppercase; letter-spacing: 3px; margin-top: 4px;">Admin Portal Credentials</p>
            </div>
            
            <div style="padding: 24px 0;">
                <p style="font-size: 16px; color: #eee;">Hello <strong>${name || username}</strong>,</p>
                <p style="font-size: 14px; color: #aaa; line-height: 1.6;">You have been granted access to the Dreamline Production Admin Portal as <strong>${(role || 'admin').toUpperCase()}</strong>.</p>
                
                <div style="background-color: #111; border: 1px solid #333; padding: 20px; border-radius: 12px; margin: 20px 0;">
                    <h3 style="color: #c5a059; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; margin-top: 0;">Your Account Details</h3>
                    <p style="font-size: 13px; color: #ccc; margin: 8px 0;"><strong>Login URL:</strong> <a href="${loginUrl}" style="color: #c5a059; text-decoration: underline;">${loginUrl}</a></p>
                    <p style="font-size: 13px; color: #ccc; margin: 8px 0;"><strong>Username:</strong> <code style="background: #222; padding: 3px 8px; border-radius: 4px; color: #fff;">${username}</code></p>
                    <p style="font-size: 13px; color: #ccc; margin: 8px 0;"><strong>Email:</strong> ${email}</p>
                    <p style="font-size: 13px; color: #ccc; margin: 8px 0;"><strong>Temporary Password:</strong> <code style="background: #222; padding: 3px 8px; border-radius: 4px; color: #fff;">${password}</code></p>
                </div>

                <div style="background-color: #16120b; border: 1px solid #c5a05940; padding: 20px; border-radius: 12px; margin: 20px 0;">
                    <h3 style="color: #c5a059; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; margin-top: 0;">🔒 2FA Setup Key (Required)</h3>
                    <p style="font-size: 12px; color: #bbb; line-height: 1.5;">To log in, you must add this 2FA secret key to your <strong>Google Authenticator</strong> or <strong>Authy</strong> app:</p>
                    <p style="font-family: monospace; font-size: 14px; background: #000; color: #c5a059; padding: 12px; border-radius: 8px; text-align: center; letter-spacing: 3px; font-weight: bold; border: 1px border #c5a05960;">${twoFactorSecret}</p>
                </div>

                <div style="text-align: center; margin-top: 30px;">
                    <a href="${loginUrl}" style="background-color: #c5a059; color: #000; padding: 12px 28px; border-radius: 30px; text-decoration: none; font-weight: bold; font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px; display: inline-block;">Log In To Admin Portal</a>
                </div>
            </div>

            <div style="border-top: 1px solid #222; padding-top: 16px; text-align: center; font-size: 10px; color: #666; text-transform: uppercase; letter-spacing: 1px;">
                Dreamline Production • Authorized Personnel Only
            </div>
        </div>
    `;

    const mailOptions = {
        from: `"Dreamline Admin" <${process.env.SMTP_USER}>`,
        to: email,
        subject: `🔑 Your Admin Portal Account Access - Dreamline Production`,
        html: htmlContent,
    };

    try {
        await transporter.sendMail(mailOptions);
        return { success: true };
    } catch (error) {
        console.error("Error sending user welcome email:", error);
        return { success: false, reason: error.message };
    }
}
