## Call Concierge

A Next.js + Tailwind application that scripts and launches Twilio-powered phone calls on your behalf. Enter the recipient, compose the message, pick a synthetic voice, and trigger a call in seconds.

### Prerequisites

- Twilio account with Voice capabilities enabled
- A verified caller ID or purchased Twilio phone number
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_CALLER_ID` configured in the environment (see `.env.example`)

### Local Development

```bash
npm install
npm run dev
```

Navigate to [http://localhost:3000](http://localhost:3000) and submit the form to initiate a call.

### Production Build

```bash
npm run build
npm run start
```

### Environment Variables

| Name | Description |
| --- | --- |
| `TWILIO_ACCOUNT_SID` | Found in the Twilio Console |
| `TWILIO_AUTH_TOKEN` | API auth token for the project |
| `TWILIO_CALLER_ID` | E.164 number verified in Twilio, used as the caller ID |
