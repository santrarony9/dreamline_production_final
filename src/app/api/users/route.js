import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { safeErrorResponse } from "@/lib/error-handler";

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
        const { username, password, role } = await request.json();

        if (!username || !password) {
            return NextResponse.json({ error: "Username and password are required" }, { status: 400 });
        }

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return NextResponse.json({ error: "Username already exists" }, { status: 400 });
        }

        // Hash the password securely
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Generate a random Base32 TOTP Secret (32 chars)
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
        let totpSecret = '';
        const bytes = crypto.randomBytes(32);
        for (let i = 0; i < 32; i++) {
            totpSecret += alphabet[bytes[i] % alphabet.length];
        }

        const newUser = await User.create({
            username,
            password: hashedPassword,
            role: role || 'admin',
            twoFactorSecret: totpSecret
        });

        // Don't return the password, but DO return the TOTP secret so the admin can scan it ONCE
        const userResponse = {
            _id: newUser._id,
            username: newUser.username,
            role: newUser.role,
            createdAt: newUser.createdAt,
            twoFactorSecret: totpSecret
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
