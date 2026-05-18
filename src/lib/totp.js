import crypto from "crypto";

/**
 * Decodes a Base32 string into a Buffer.
 * Supports standard RFC 4648 Base32 alphabet (A-Z, 2-7).
 * Handles lowercase/uppercase, spaces, and padding (=) characters safely.
 */
export function base32Decode(base32) {
    const cleaned = base32.replace(/=+$/, "").replace(/\s/g, "").toUpperCase();
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    let bits = "";
    let hex = "";

    for (let i = 0; i < cleaned.length; i++) {
        const val = alphabet.indexOf(cleaned[i]);
        if (val === -1) {
            throw new Error(`Invalid Base32 character: ${cleaned[i]}`);
        }
        bits += val.toString(2).padStart(5, "0");
    }

    for (let i = 0; i + 8 <= bits.length; i += 8) {
        const chunk = bits.substring(i, i + 8);
        hex += parseInt(chunk, 2).toString(16).padStart(2, "0");
    }

    return Buffer.from(hex, "hex");
}

/**
 * Generates a Time-Based One-Time Password (TOTP).
 * @param {string} secretBase32 The shared Base32 secret key.
 * @param {number} timeOffsetStep Optional step offset to test past/future codes.
 * @returns {string} A 6-digit OTP string.
 */
export function generateTOTP(secretBase32, timeOffsetStep = 0) {
    const key = base32Decode(secretBase32);
    const epoch = Math.round(new Date().getTime() / 1000.0);
    
    // Divide epoch time by step duration (30 seconds) and apply the drift step offset
    let time = Math.floor(epoch / 30) + timeOffsetStep;

    // Convert time step to an 8-byte buffer
    const buffer = Buffer.alloc(8);
    for (let i = 7; i >= 0; i--) {
        buffer[i] = time & 0xff;
        time >>= 8;
    }

    // Generate HMAC-SHA1 using the key and time-step buffer
    const hmac = crypto.createHmac("sha1", key).update(buffer).digest();
    
    // Dynamic truncation to extract a 6-digit OTP
    const offset = hmac[hmac.length - 1] & 0xf;
    const code =
        ((hmac[offset] & 0x7f) << 24) |
        ((hmac[offset + 1] & 0xff) << 16) |
        ((hmac[offset + 2] & 0xff) << 8) |
        (hmac[offset + 3] & 0xff);

    const otp = code % 1000000;
    return otp.toString().padStart(6, "0");
}

/**
 * Verifies a 6-digit TOTP token against a Base32 secret.
 * Automatically allows ±1 time step of 30 seconds to handle client-server clock drift.
 * @param {string} token The 6-digit user input.
 * @param {string} secretBase32 The shared Base32 secret key.
 * @returns {boolean} True if the code is valid.
 */
export function verifyTOTP(token, secretBase32) {
    if (!token || typeof token !== "string" || token.length !== 6) {
        return false;
    }

    const cleanToken = token.trim();
    
    // Test current, past, and future windows (total window of 90 seconds)
    for (let offset = -1; offset <= 1; offset++) {
        try {
            if (generateTOTP(secretBase32, offset) === cleanToken) {
                return true;
            }
        } catch (e) {
            console.error("TOTP verification internal error:", e);
            return false;
        }
    }
    return false;
}
