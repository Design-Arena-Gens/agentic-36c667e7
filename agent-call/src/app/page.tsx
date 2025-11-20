"use client";

import { FormEvent, useMemo, useState } from "react";

type CallState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; sid: string }
  | { status: "error"; message: string };

const voices = [
  { value: "Polly.Joanna", label: "Polly Joanna (US · F)" },
  { value: "Polly.Matthew", label: "Polly Matthew (US · M)" },
  { value: "alice", label: "Alice (US · F)" },
];

export default function Home() {
  const [callerName, setCallerName] = useState("Alex");
  const [targetNumber, setTargetNumber] = useState("+1");
  const [message, setMessage] = useState(
    "I'm calling to follow up about our meeting. Please call me back when you can."
  );
  const [voice, setVoice] = useState(voices[0]?.value ?? "Polly.Joanna");
  const [callState, setCallState] = useState<CallState>({ status: "idle" });

  const messagePreview = useMemo(() => {
    const normalizedName = callerName.trim();
    if (!normalizedName) return message;
    return `Hello, this is ${normalizedName}. ${message}`.trim();
  }, [callerName, message]);

  const canSubmit = useMemo(() => {
    if (!callerName.trim()) return false;
    if (!targetNumber.trim()) return false;
    if (!message.trim()) return false;
    if (messagePreview.length < 15) return false;
    return callState.status !== "loading";
  }, [callState.status, callerName, message, messagePreview.length, targetNumber]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;
    setCallState({ status: "loading" });
    try {
      const response = await fetch("/api/call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          callerName,
          targetNumber,
          message,
          voice,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        const message =
          (errorBody && "error" in errorBody && typeof errorBody.error === "string"
            ? errorBody.error
            : "The call could not be placed.") ?? "The call could not be placed.";
        setCallState({ status: "error", message });
        return;
      }

      const data = (await response.json()) as { sid?: string };
      setCallState({
        status: "success",
        sid: data.sid ?? "unknown",
      });
    } catch (error) {
      setCallState({
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "Unexpected error while attempting to place the call.",
      });
    }
  }

  return (
    <div className="flex min-h-screen w-full justify-center bg-slate-950 py-10 font-sans text-slate-100">
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-10 rounded-2xl border border-slate-800 bg-slate-900/70 p-8 shadow-xl backdrop-blur">
        <header className="flex flex-col gap-3">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-700 bg-slate-800 px-3 py-1 text-xs uppercase tracking-wide text-slate-300">
            Call Concierge
          </span>
          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Launch an on-demand voice agent
          </h1>
          <p className="max-w-2xl text-sm text-slate-300 sm:text-base">
            Configure the script, choose a voice, and instantly place automated calls that
            speak on your behalf using Twilio.
          </p>
        </header>

        <form className="grid gap-6 lg:grid-cols-[2fr_1fr]" onSubmit={handleSubmit}>
          <div className="grid gap-6">
            <section className="grid gap-4 rounded-xl border border-slate-800 bg-slate-900/60 p-6">
              <h2 className="text-lg font-semibold text-white">Call details</h2>
              <label className="grid gap-2 text-sm">
                <span className="text-slate-300">Your name</span>
                <input
                  className="w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-base text-white outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-500/60"
                  value={callerName}
                  onChange={(event) => setCallerName(event.target.value)}
                  placeholder="Jane Doe"
                  required
                />
              </label>
              <label className="grid gap-2 text-sm">
                <span className="text-slate-300">Recipient phone number</span>
                <input
                  className="w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-base text-white outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-500/60"
                  value={targetNumber}
                  onChange={(event) => setTargetNumber(event.target.value)}
                  placeholder="+15551234567"
                  required
                />
              </label>
              <label className="grid gap-2 text-sm">
                <span className="text-slate-300">Voice selection</span>
                <select
                  className="w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-base text-white outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-500/60"
                  value={voice}
                  onChange={(event) => setVoice(event.target.value)}
                >
                  {voices.map((option) => (
                    <option className="bg-slate-900 text-slate-100" key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2 text-sm">
                <span className="text-slate-300">What should the agent say?</span>
                <textarea
                  className="h-40 w-full resize-none rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-base text-white outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-500/60"
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Provide the script the agent should read during the call."
                  required
                />
              </label>
            </section>

            <section className="grid gap-4 rounded-xl border border-slate-800 bg-slate-900/60 p-6">
              <h2 className="text-lg font-semibold text-white">Preview</h2>
              <p className="rounded-lg border border-slate-800 bg-slate-950/60 p-4 text-sm leading-relaxed text-slate-200">
                {messagePreview}
              </p>
              <p className="text-xs text-slate-500">
                The generated script above is what the callee will hear, delivered with
                the selected synthetic voice.
              </p>
            </section>
          </div>

          <aside className="flex h-fit flex-col gap-6 rounded-xl border border-slate-800 bg-slate-900/60 p-6">
            <div className="grid gap-2">
              <h3 className="text-base font-semibold text-white">Launch checklist</h3>
              <ul className="space-y-2 text-xs text-slate-400">
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 h-2.5 w-2.5 rounded-full bg-slate-400" />
                  Verify that the recipient&apos;s number includes the country code.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 h-2.5 w-2.5 rounded-full bg-slate-400" />
                  Ensure the Twilio credentials are configured in your environment.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 h-2.5 w-2.5 rounded-full bg-slate-400" />
                  The agent introduces itself using the name you provide.
                </li>
              </ul>
            </div>

            <button
              type="submit"
              disabled={!canSubmit}
              className="flex h-12 items-center justify-center rounded-lg bg-sky-500 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-slate-700"
            >
              {callState.status === "loading" ? "Placing call..." : "Launch call"}
            </button>

            {callState.status === "success" && (
              <div className="space-y-2 rounded-lg border border-emerald-600 bg-emerald-500/10 p-4 text-sm text-emerald-200">
                <p className="font-semibold text-emerald-100">
                  Call queued successfully
                </p>
                <p className="break-all text-xs text-emerald-200/80">
                  Twilio SID: {callState.sid}
                </p>
              </div>
            )}

            {callState.status === "error" && (
              <div className="space-y-2 rounded-lg border border-rose-600 bg-rose-500/10 p-4 text-sm text-rose-200">
                <p className="font-semibold text-rose-100">Something went wrong</p>
                <p className="text-xs text-rose-200/80">{callState.message}</p>
              </div>
            )}
          </aside>
        </form>
      </main>
    </div>
  );
}
