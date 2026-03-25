export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Booking from "@/models/Booking";
import axios from "axios";

export async function POST(req) {
    try {
        await dbConnect();
        const body = await req.json();

        // Input validation — only allow expected fields (prevent mass assignment)
        const { firstName, lastName, phone, email, eventDate, serviceType, vision } = body;

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

        // 1. WhatsApp Business API (New Method)
        if (process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_ID) {
            const message = `🌟 New Inquiry from ${body.firstName} ${body.lastName}!\n\nEmail: ${body.email}\nPhone: ${body.phone}\nEvent: ${body.serviceType}\nDate: ${body.eventDate}\nVision: ${body.vision}`;

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
                const message = `New Inquiry: ${body.firstName} ${body.lastName} - ${body.phone} - ${body.serviceType}`;
                await axios.get('http://bhashsms.com/api/sendmsg.php', {
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


        return NextResponse.json({ success: true, data: booking }, { status: 201 });
    } catch (error) {
        console.error("Booking error:", error);
        return NextResponse.json({ error: "Failed to process booking" }, { status: 500 });
    }
}
