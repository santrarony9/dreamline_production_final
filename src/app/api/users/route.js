import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { safeErrorResponse } from "@/lib/error-handler";
import { sendUserWelcomeEmail } from "@/lib/mailer";

// Only "admin" roles (like the Master Admin) should access these routes.
const isAdmin = (session) => session?.user?.role === "admin";

export async function GET(request) {
    const session = await getServerSession(authOptions);
    if (!isAdmin(session)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        await dbConnect();
        // Return users without exposing the hashed passwords
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

        // Auto-generate password if not provided
        let rawPassword = password;
        if (!rawPassword) {
            rawPassword = crypto.randomBytes(6).toString("hex"); // 12 char random password
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

        // Hash the password securely
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(rawPassword, salt);

        // Generate a random Base32 TOTP Secret (32 chars)
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
        let totpSecret = '';
        const bytes = crypto.randomBytes(32);
        for (let i = 0; i < 32; i++) {
            totpSecret += alphabet[bytes[i] % alphabet.length];
        }

        const newUser = await User.create({
            name,
            email,
            username,
            password: hashedPassword,
            role: role || 'admin',
            twoFactorSecret: totpSecret
        });

        // Send Welcome Email if requested & email is provided
        let emailResult = { success: false };
        if (sendEmail && email) {
            emailResult = await sendUserWelcomeEmail({
                name: name || username,
                email,
                username,
                password: rawPassword,
                twoFactorSecret: totpSecret,
                role: newUser.role
            });
        }

        // Response object (without hashed password)
        const userResponse = {
            _id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            username: newUser.username,
            role: newUser.role,
            createdAt: newUser.createdAt,
            twoFactorSecret: totpSecret,
            generatedPassword: password ? null : rawPassword,
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
