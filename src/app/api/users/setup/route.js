import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { verifyTOTP } from "@/lib/totp";
import { safeErrorResponse } from "@/lib/error-handler";

// GET: Validate setup token and return user metadata & 2FA secret
export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
        return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    try {
        await dbConnect();
        const user = await User.findOne({ 
            setupToken: token,
            setupTokenExpiry: { $gt: new Date() }
        });

        if (!user) {
            return NextResponse.json({ error: "Invalid or expired setup link. Please contact an admin to resend your invitation." }, { status: 404 });
        }

        return NextResponse.json({
            name: user.name,
            email: user.email,
            username: user.username,
            role: user.role,
            twoFactorSecret: user.twoFactorSecret
        });
    } catch (error) {
        return safeErrorResponse(error, "Validate Setup Token");
    }
}

// POST: Save password, verify TOTP OTP, and complete setup
export async function POST(request) {
    try {
        await dbConnect();
        const { token, password, otp } = await request.json();

        if (!token || !password || !otp) {
            return NextResponse.json({ error: "Token, Password, and 6-digit 2FA OTP code are required." }, { status: 400 });
        }

        if (password.length < 6) {
            return NextResponse.json({ error: "Password must be at least 6 characters long." }, { status: 400 });
        }

        const user = await User.findOne({ 
            setupToken: token,
            setupTokenExpiry: { $gt: new Date() }
        });

        if (!user) {
            return NextResponse.json({ error: "Invalid or expired setup link." }, { status: 404 });
        }

        // Verify the user's 2FA OTP code against their twoFactorSecret
        const isValidOtp = verifyTOTP(otp, user.twoFactorSecret);
        if (!isValidOtp) {
            return NextResponse.json({ error: "Invalid 2FA Verification Code. Please check your Authenticator app and try again." }, { status: 400 });
        }

        // Hash the user's chosen password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Update user record: save password, mark configured, and invalidate setup token
        user.password = hashedPassword;
        user.isConfigured = true;
        user.setupToken = "";
        user.setupTokenExpiry = null;
        await user.save();

        return NextResponse.json({ success: true, message: "Account setup successfully completed!" });
    } catch (error) {
        return safeErrorResponse(error, "Complete Account Setup");
    }
}
