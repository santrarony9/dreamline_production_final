"use client";

import React from 'react';
import Image from 'next/image';

export default function WhatsAppButton({ phoneNumber = "+918240054002" }) {
    // Format number to remove spaces/pluses for the wa.me link
    const formattedNumber = phoneNumber.replace(/[^0-9]/g, '');
    const waLink = `https://wa.me/${formattedNumber}`;

    return (
        <a 
            href={waLink} 
            target="_blank" 
            rel="noopener noreferrer"
            className="fixed bottom-6 right-6 z-50 hover:scale-110 transition-transform duration-300"
            aria-label="Chat with us on WhatsApp"
        >
            <div className="w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-[0_4px_14px_rgba(37,211,102,0.4)] border-2 border-white relative group">
                <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.031 21.055a8.995 8.995 0 01-4.234-1.056l-.304-.18-3.147.825.84-3.07-.197-.314A8.98 8.98 0 0112.03 3a9 9 0 019 9 9.006 9.006 0 01-8.999 9.055zm.006-16.518a7.481 7.481 0 00-7.488 7.493c0 1.558.423 3.067 1.205 4.382l.142.235-.494 1.812 1.854-.486.223.134a7.464 7.464 0 004.558 1.411 7.48 7.48 0 007.492-7.485A7.498 7.498 0 0012.037 4.537zm3.931 10.37c-.216-.108-1.275-.629-1.472-.701-.197-.072-.34-.108-.483.107-.143.216-.554.701-.68.845-.125.144-.25.162-.465.054-.215-.108-.91-.336-1.734-1.072-.64-.572-1.071-1.28-1.196-1.496-.125-.216-.013-.332.095-.44.097-.097.215-.252.323-.377.108-.126.143-.216.215-.36.072-.144.036-.27-.018-.378-.054-.108-.483-1.163-.661-1.591-.174-.418-.352-.361-.483-.368h-.412c-.143 0-.376.054-.573.27-.197.216-.751.734-.751 1.79 0 1.056.769 2.077.876 2.221.108.144 1.516 2.313 3.67 3.205.513.213.913.34 1.226.435.515.164.985.141 1.356.085.415-.062 1.275-.52 1.454-1.022.18-.501.18-.931.126-1.022-.054-.09-.197-.144-.413-.252z"/>
                </svg>
                {/* Notification Badge (Optional, gives it that live feel) */}
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white"></div>
            </div>
        </a>
    );
}
