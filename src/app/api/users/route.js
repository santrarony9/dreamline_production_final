import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { safeErrorResponse } from "@/lib/error-handler";
import { sendAccountSetupEmail, sendUserWelcomeEmail } from "@/lib/mailer";

// Only "admin" roles (like the Master Admin) should access these routes.
const isAdmin = (session) => session?.user?.role === "admin";

export async function GET(request) {
    const session = await getServerSession(authOptions);
    if (!isAdmin(session)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        await dbConnect();
        // Return users without exposing passwords or full setup tokens
        const users = await User.find({}, { password: 0 }).sort({ createdAt: -1 });
        return NextResponse.json(users);
    } catch (error) {
        return safeErrorResponse(error, "Fetch Users");
    }
}

export async function POST(request) {
    const session = await getServerSession(authOptions);
    if (!isAdmin(session)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        await dbConnect();
        const body = await request.json();

        // Check if this is a "Resend Setup Email" request
        if (body.action === "resend_setup") {
            const { userId } = body;
            const user = await User.findById(userId);
            if (!user) {
                return NextResponse.json({ error: "User not found" }, { status: 404 });
            }

            // Generate new setup token valid for 48 hours
            const setupToken = crypto.randomBytes(24).toString("hex");
            const setupTokenExpiry = new Date(Date.now() + 48 * 60 * 60 * 1000);

            // Re-generate TOTP Secret if not already configured
            if (!user.twoFactorSecret) {
                const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
                let totpSecret = '';
                const bytes = crypto.randomBytes(32);
                for (let i = 0; i < 32; i++) {
                    totpSecret += alphabet[bytes[i] % alphabet.length];
                }
                user.twoFactorSecret = totpSecret;
            }

            user.setupToken = setupToken;
            user.setupTokenExpiry = setupTokenExpiry;
            await user.save();

            const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://dreamlineproduction.com";
            const setupUrl = `${siteUrl}/admin/setup-account?token=${setupToken}`;

            let emailResult = { success: false };
            if (user.email) {
                emailResult = await sendAccountSetupEmail({
                    name: user.name || user.username,
                    email: user.email,
                    username: user.username,
                    setupUrl,
                    role: user.role
                });
            }

            return NextResponse.json({
                success: true,
                emailSent: emailResult.success,
                emailError: emailResult.reason || null,
                setupUrl
            });
        }

        // --- Standard User Creation ---
        let { name, email, username, password, role, sendEmail = true } = body;

        name = (name || "").trim();
        email = (email || "").trim().toLowerCase();
        username = (username || "").trim().toLowerCase();

        // If username not provided, default to email username prefix
        if (!username && email) {
            username = email.split("@")[0].replace(/[^a-z0-9_]/g, "");
        }

        if (!email && !username) {
            return NextResponse.json({ error: "Email address or Username is required" }, { status: 400 });
        }

        // Check for existing user with same username or email
        const queryConditions = [];
        if (username) queryConditions.push({ username });
        if (email) queryConditions.push({ email });

        const existingUser = await User.findOne({ $or: queryConditions });
        if (existingUser) {
            const conflictField = existingUser.username === username ? "Username" : "Email address";
            return NextResponse.json({ error: `${conflictField} already exists in database.` }, { status: 400 });
        }

        // Generate setup token valid for 48 hours
        const setupToken = crypto.randomBytes(24).toString("hex");
        const setupTokenExpiry = new Date(Date.now() + 48 * 60 * 60 * 1000);

        // Generate Base32 TOTP Secret
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
        let totpSecret = '';
        const bytes = crypto.randomBytes(32);
        for (let i = 0; i < 32; i++) {
            totpSecret += alphabet[bytes[i] % alphabet.length];
        }

        let hashedPassword = "";
        let rawPassword = password;

        if (password) {
            const salt = await bcrypt.genSalt(10);
            hashedPassword = await bcrypt.hash(password, salt);
        }

        const newUser = await User.create({
            name,
            email,
            username,
            password: hashedPassword,
            role: role || 'admin',
            twoFactorSecret: totpSecret,
            setupToken,
            setupTokenExpiry,
            isConfigured: !!password
        });

        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://dreamlineproduction.com";
        const setupUrl = `${siteUrl}/admin/setup-account?token=${setupToken}`;

        // Send Setup Invitation Email if email is provided
        let emailResult = { success: false };
        if (sendEmail && email) {
            emailResult = await sendAccountSetupEmail({
                name: name || username,
                email,
                username,
                setupUrl,
                role: newUser.role
            });
        }

        // Response object
        const userResponse = {
            _id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            username: newUser.username,
            role: newUser.role,
            createdAt: newUser.createdAt,
            twoFactorSecret: totpSecret,
            setupUrl,
            emailSent: emailResult.success,
            emailError: emailResult.reason || null
        };

        return NextResponse.json(userResponse, { status: 201 });
    } catch (error) {
        return safeErrorResponse(error, "Create User");
    }
}

export async function DELETE(request) {
    const session = await getServerSession(authOptions);
    if (!isAdmin(session)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "User ID is required" }, { status: 400 });
        }

        await User.findByIdAndDelete(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        return safeErrorResponse(error, "Delete User");
    }
}
