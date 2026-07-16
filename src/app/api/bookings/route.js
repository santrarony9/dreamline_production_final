export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Booking from "@/models/Booking";
import axios from "axios";
import nodemailer from "nodemailer";
import { bookingLimiter } from "@/lib/rate-limit";
import { safeErrorResponse } from "@/lib/error-handler";

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "465"),
    secure: true, // true for 465 (SSL/TLS)
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

function escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;");
}

export async function POST(req) {
    try {
        const { success } = bookingLimiter.check(req);
        if (!success) {
            return NextResponse.json(
                { error: "Too many requests. Please try again later." },
                { status: 429 }
            );
        }

        await dbConnect();
        const body = await req.json();

        // Input validation — only allow expected fields (prevent mass assignment)
        const { firstName, lastName, phone, email, eventDate, serviceType, vision, website } = body;

        // Honeypot check: If 'website' is filled, it's likely a bot.
        if (website) {
            console.log("Spam detected via honeypot field.");
            return NextResponse.json({ success: true, message: "Inquiry received" }, { status: 201 }); // Return success to deceive the bot
        }


        if (!firstName || !lastName || !phone) {
            return NextResponse.json({ error: "Name and phone are required" }, { status: 400 });
        }

        // Sanitize input lengths to prevent DB abuse
        const sanitize = (str, maxLen = 200) => String(str || "").slice(0, maxLen).trim();

        const bookingData = {
            firstName: sanitize(firstName, 100),
            lastName: sanitize(lastName, 100),
            phone: sanitize(phone, 20),
            email: sanitize(email, 150),
            eventDate: sanitize(eventDate, 30),
            serviceType: sanitize(serviceType, 100),
            vision: sanitize(vision, 1000),
        };

        // Save to database with sanitized data only
        const booking = await Booking.create(bookingData);

        // Escape HTML for email
        const safeFirstName = escapeHtml(bookingData.firstName);
        const safeLastName = escapeHtml(bookingData.lastName);
        const safeEmail = escapeHtml(bookingData.email);
        const safePhone = escapeHtml(bookingData.phone);
        const safeService = escapeHtml(bookingData.serviceType);
        const safeDate = escapeHtml(bookingData.eventDate);
        const safeVision = escapeHtml(bookingData.vision);

        // 3. Email Notification via MilesWeb SMTP
        if (process.env.SMTP_USER && process.env.SMTP_PASS) {
            try {
                const mailOptions = {
                    from: `"Dreamline Inquiry" <${process.env.SMTP_USER}>`,
                    to: process.env.EMAIL_TO || process.env.SMTP_USER,
                    subject: `🌟 New Inquiry from ${bookingData.firstName} ${bookingData.lastName}`,
                    text: `New Inquiry Details:\n\nName: ${bookingData.firstName} ${bookingData.lastName}\nEmail: ${bookingData.email}\nPhone: ${bookingData.phone}\nService: ${bookingData.serviceType}\nDate: ${bookingData.eventDate}\nVision: ${bookingData.vision}`,
                    html: `
                        <h3>New Inquiry Details</h3>
                        <p><strong>Name:</strong> ${safeFirstName} ${safeLastName}</p>
                        <p><strong>Email:</strong> ${safeEmail}</p>
                        <p><strong>Phone:</strong> ${safePhone}</p>
                        <p><strong>Service:</strong> ${safeService}</p>
                        <p><strong>Date:</strong> ${safeDate}</p>
                        <p><strong>Vision:</strong> ${safeVision}</p>
                    `,
                };
                await transporter.sendMail(mailOptions);
            } catch (mailErr) {
                console.error("Nodemailer failed to send email:", mailErr.message);
            }
        }

        // 1. WhatsApp Business API (New Method)
        if (process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_ID) {
            const message = `🌟 New Inquiry from ${bookingData.firstName} ${bookingData.lastName}!\n\nEmail: ${bookingData.email}\nPhone: ${bookingData.phone}\nEvent: ${bookingData.serviceType}\nDate: ${bookingData.eventDate}\nVision: ${bookingData.vision}`;

            try {
                await axios.post(
                    `https://graph.facebook.com/v17.0/${process.env.WHATSAPP_PHONE_ID}/messages`,
                    {
                        messaging_product: "whatsapp",
                        to: process.env.FOR_PHONE || "918240054002",
                        type: "text",
                        text: { body: message }
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
                            "Content-Type": "application/json"
                        }
                    }
                );
            } catch (waErr) {
                console.error("WhatsApp Business API failed:", waErr.response?.data || waErr.message);
            }
        }

        // 2. Legacy BhashSMS Notification (Backup/Alternative)
        if (process.env.WHATSAPP_PASS) {
            try {
                const message = `New Inquiry: ${bookingData.firstName} ${bookingData.lastName} - ${bookingData.phone} - ${bookingData.serviceType}`;
                await axios.get('https://bhashsms.com/api/sendmsg.php', {
                    params: {
                        user: process.env.WHATSAPP_USER || 'Rony_BW',
                        pass: process.env.WHATSAPP_PASS,
                        sender: process.env.WHATSAPP_SENDER || 'BUZWAP',
                        phone: process.env.WHATSAPP_ADMIN_PHONE || '8240054002',
                        text: message,
                        priority: 'wa',
                        stype: 'normal'
                    }
                });
            } catch (legacyErr) {
                console.error("Legacy WhatsApp notification failed:", legacyErr.message);
            }
        }


        return NextResponse.json({ success: true, message: "Inquiry received" }, { status: 201 });
    } catch (error) {
        return safeErrorResponse(error, "Booking");
    }
}
