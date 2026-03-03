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

        // Save to database
        const booking = await Booking.create(body);

        // Send WhatsApp Notification (If configured)
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
                console.error("WhatsApp notification failed:", waErr.response?.data || waErr.message);
            }
        }

        return NextResponse.json({ success: true, data: booking }, { status: 201 });
    } catch (error) {
        console.error("Booking error:", error);
        return NextResponse.json({ error: "Failed to process booking" }, { status: 500 });
    }
}
