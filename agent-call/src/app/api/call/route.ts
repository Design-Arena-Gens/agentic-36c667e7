import { NextResponse } from "next/server";
import { z } from "zod";
import twilio from "twilio";

const requestSchema = z.object({
  callerName: z
    .string()
    .trim()
    .min(1, "Please provide your name.")
    .max(80, "Name is too long."),
  targetNumber: z
    .string()
    .trim()
    .regex(/^\+?[1-9]\d{6,14}$/, "Enter a valid E.164 phone number."),
  message: z
    .string()
    .trim()
    .min(10, "Provide more context for the call.")
    .max(600, "Message is too long."),
  voice: z.enum(["Polly.Joanna", "Polly.Matthew", "alice"]),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    const errorMessage =
      parsed.error.issues[0]?.message ?? "Invalid call parameters were provided.";
    return NextResponse.json({ error: errorMessage }, { status: 422 });
  }

  const { callerName, targetNumber, message, voice } = parsed.data;

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const callerId = process.env.TWILIO_CALLER_ID;

  if (!accountSid || !authToken || !callerId) {
    return NextResponse.json(
      { error: "Server configuration is missing Twilio credentials." },
      { status: 500 }
    );
  }

  const client = twilio(accountSid, authToken);
  const twimlResponse = new twilio.twiml.VoiceResponse();
  twimlResponse.say(
    {
      voice,
    },
    `Hello, this is ${callerName}. ${message}`
  );

  try {
    const call = await client.calls.create({
      to: targetNumber,
      from: callerId,
      twiml: twimlResponse.toString(),
    });

    return NextResponse.json({ sid: call.sid });
  } catch (error) {
    console.error("[call]", error);
    const message =
      error instanceof Error
        ? error.message
        : "Twilio rejected the call request. Please verify the phone numbers.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
