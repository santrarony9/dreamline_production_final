# WhatsApp API Documentation (BhashSMS)

This document contains the API details for BhashSMS WhatsApp integration, as provided in the company's reference image.

## Base Configuration

- **User**: `Rony_BW`
- **Password**: `*******` (Refer to official credentials)
- **Sender ID**: `BUZWAP` (or customized Sender ID)

---

## API Endpoints

### 1. Normal Text Message
Sends a standard text message.
- **URL**: `http://bhashsms.com/api/sendmsg.php?user=Rony_BW&pass=*******&sender=BUZWAP&phone=Mobile No&text=TEMPLATENAME&priority=wa&stype=normal`
- **Note**: Mobile Number should be without `91` and separated by commas for multiple recipients.

### 2. Normal Text with Variables/Parameters
Sends a text template with dynamic parameters.
- **URL**: `http://bhashsms.com/api/sendmsg.php?user=Rony_BW&pass=*******&sender=BUZWAP&phone=Mobile No&text=TEMPLATENAME&priority=wa&stype=normal&Params=param1,param2`
- **Note**: Parameters should be separated by commas.

### 3. Text with Variables + Image/Video
Sends a media message (Image/Video/Document) with parameters.
- **URL**: `http://bhashsms.com/api/sendmsg.php?user=Rony_BW&pass=*******&sender=BUZWAP&phone=Mobile No&text=TEMPLATENAME&priority=wa&stype=normal&Params=param1,param2&htype=image&url=https://i.ibb.co/9w4vXVY/Whats-App-Image-2022-07-26-at-2-57-21-PM.jpg`
- **Note**: `htype` can be `image`, `video`, or `document`. The URL must be public.

### 4. Normal Text (After Customer Replies)
Used for standard session messages after a customer initiates contact.
- **URL**: `http://bhashsms.com/api/sendmsg.php?user=Rony_BW&pass=*******&sender=BUZWAP&phone=Mobile No&text=TEXT&priority=wa&stype=normal&&htype=normal`

### 5. Authentication OTP Messages
Specifically for sending OTPs.
- **URL**: `http://bhashsms.com/api/sendmsg.php?user=Rony_BW&pass=*******&sender=Sender ID&phone=Mobile No&text=TEMPLATENAME&priority=wa&stype=auth&Params=OTP`

---

## Important Notes
- **Phone Numbers**: Always omit the `91` country code.
- **Multiple Recipients**: Separate mobile numbers with commas.
- **Media URLs**: Must be publicly accessible links.
- **Call Backs**: Contact the Account Manager to set up endpoints for call backs.
