import { createFileRoute } from "@tanstack/react-router";

// Text-to-speech for the Anya widget. Streams SSE PCM from the AI Gateway
// (gemini speech format, 24 kHz mono) straight through to the browser.
const TTS_MODEL = "google/gemini-3.1-flash-tts-preview";
const TTS_VOICE = "Laomedeia"; // upbeat, young-sounding female voice
const STEER =
  "Say this cheerfully and warmly, like an excited young female college guide, natural and lively: ";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export const Route = createFileRoute("/api/public/tts")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      POST: async ({ request }) => {
        let text = "";
        try {
          const body = await request.json();
          text = typeof body?.text === "string" ? body.text : "";
        } catch {
          /* ignore */
        }
        text = text.replace(/\s+/g, " ").trim().slice(0, 4000);
        if (!text) {
          return new Response("Please send text.", { status: 400, headers: CORS });
        }
        const key = process.env["LOVABLE_API_KEY"];
        if (!key) {
          return new Response("Voice is not configured.", { status: 500, headers: CORS });
        }

        let upstream: Response;
        try {
          upstream = await fetch("https://ai.gateway.lovable.dev/v1/audio/speech", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${key}`,
            },
            body: JSON.stringify({
              model: TTS_MODEL,
              contents: [{ role: "user", parts: [{ text: STEER + text }] }],
              generationConfig: {
                responseModalities: ["AUDIO"],
                speechConfig: {
                  voiceConfig: { prebuiltVoiceConfig: { voiceName: TTS_VOICE } },
                },
              },
              stream_format: "sse",
            }),
            signal: request.signal,
          });
        } catch (e) {
          if (request.signal.aborted) return new Response(null, { status: 499, headers: CORS });
          return new Response("Voice service error.", { status: 502, headers: CORS });
        }

        if (!upstream.ok || !upstream.body) {
          const detail = await upstream.text().catch(() => "");
          return new Response(detail || "Voice unavailable.", {
            status: upstream.status,
            headers: CORS,
          });
        }

        return new Response(upstream.body, {
          headers: {
            ...CORS,
            "Content-Type": "text/event-stream; charset=utf-8",
            "Cache-Control": "no-cache, no-transform",
          },
        });
      },
    },
  },
});
