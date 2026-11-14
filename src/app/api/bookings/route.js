export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Booking from "@/models/Booking";
import axios from "axios";
import nodemailer from "nodemailer";
import { bookingLimiter } from "@/lib/rate-limit";
import { safeErrorResponse } from "@/lib/error-handler";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "465"),
    secure: true,
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

export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        const { searchParams } = new URL(req.url);
        const status = searchParams.get("status");
        const query = status && status !== "all" ? { status } : {};

        const bookings = await Booking.find(query).sort({ createdAt: -1 }).lean();
        return NextResponse.json(bookings);
    } catch (error) {
        return safeErrorResponse(error, "Get Bookings");
    }
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
        const { firstName, lastName, phone, email, eventDate, serviceType, vision, message, website } = body;

        // Honeypot check: If 'website' is filled, it's likely a bot.
        if (website) {
            console.log("Spam detected via honeypot field.");
            return NextResponse.json({ success: true, message: "Inquiry received" }, { status: 201 });
        }

        if (!firstName || !phone) {
            return NextResponse.json({ error: "Name and phone are required" }, { status: 400 });
        }

        // Sanitize input lengths to prevent DB abuse
        const sanitize = (str, maxLen = 200) => String(str || "").slice(0, maxLen).trim();
        const finalVision = sanitize(vision || message, 1000);

        const bookingData = {
            firstName: sanitize(firstName, 100),
            lastName: sanitize(lastName, 100),
            phone: sanitize(phone, 20),
            email: sanitize(email, 150),
            eventDate: sanitize(eventDate, 30),
            serviceType: sanitize(serviceType, 100) || 'Wedding Photography',
            vision: finalVision,
            message: finalVision,
            status: 'pending'
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

        // 1. Email Notification via SMTP
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

        // 2. WhatsApp Business API (New Method)
        if (process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_ID) {
            const waMsg = `🌟 New Inquiry from ${bookingData.firstName} ${bookingData.lastName}!\n\nEmail: ${bookingData.email}\nPhone: ${bookingData.phone}\nEvent: ${bookingData.serviceType}\nDate: ${bookingData.eventDate}\nVision: ${bookingData.vision}`;

            try {
                await axios.post(
                    `https://graph.facebook.com/v17.0/${process.env.WHATSAPP_PHONE_ID}/messages`,
                    {
                        messaging_product: "whatsapp",
                        to: process.env.FOR_PHONE || "918240054002",
                        type: "text",
                        text: { body: waMsg }
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

        return NextResponse.json({ success: true, message: "Inquiry received", id: booking._id }, { status: 201 });
    } catch (error) {
        return safeErrorResponse(error, "Booking");
    }
}

export async function PATCH(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        const body = await req.json();
        const { id, status, notes } = body;

        if (!id) {
            return NextResponse.json({ error: "Booking ID is required" }, { status: 400 });
        }

        const update = {};
        if (status) update.status = status;
        if (notes !== undefined) update.notes = notes;

        const updated = await Booking.findByIdAndUpdate(id, { $set: update }, { new: true });
        if (!updated) {
            return NextResponse.json({ error: "Booking not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, booking: updated });
    } catch (error) {
        return safeErrorResponse(error, "Update Booking");
    }
}

export async function DELETE(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "Booking ID is required" }, { status: 400 });
        }

        const deleted = await Booking.findByIdAndDelete(id);
        if (!deleted) {
            return NextResponse.json({ error: "Booking not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: "Booking removed" });
    } catch (error) {
        return safeErrorResponse(error, "Delete Booking");
    }
}
