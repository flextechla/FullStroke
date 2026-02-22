import { NextRequest, NextResponse } from "next/server";

// Uses Twilio (https://twilio.com) - free trial includes $15 credit
// 1. Sign up at twilio.com
// 2. Get a phone number from the console
// 3. Add to your .env.local:
//    TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
//    TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
//    TWILIO_PHONE_NUMBER=+1234567890

export async function POST(req: NextRequest) {
  try {
    const { to, body, ticketId } = await req.json();

    if (!to || !body) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !fromNumber) {
      return NextResponse.json(
        {
          error:
            "SMS not configured. Add TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER to your .env.local file.",
        },
        { status: 500 }
      );
    }

    // Clean the phone number (remove spaces, dashes, etc.)
    let cleanPhone = to.replace(/[^\d+]/g, "");
    // Add +1 if it looks like a US number without country code
    if (cleanPhone.length === 10) {
      cleanPhone = "+1" + cleanPhone;
    } else if (!cleanPhone.startsWith("+")) {
      cleanPhone = "+" + cleanPhone;
    }

    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

    const params = new URLSearchParams();
    params.append("To", cleanPhone);
    params.append("From", fromNumber);
    params.append("Body", body);

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: "Basic " + Buffer.from(`${accountSid}:${authToken}`).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Twilio error:", data);
      return NextResponse.json(
        { error: data.message || "Failed to send text" },
        { status: res.status }
      );
    }

    return NextResponse.json({ success: true, sid: data.sid });
  } catch (err) {
    console.error("SMS API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
