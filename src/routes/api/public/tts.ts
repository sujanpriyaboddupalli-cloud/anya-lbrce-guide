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
        const geminiKey = process.env["GEMINI_API_KEY"];
        const lovableKey = process.env["LOVABLE_API_KEY"];
        if (!geminiKey && !lovableKey) {
          return new Response("Voice is not configured.", { status: 500, headers: CORS });
        }

        const speechConfig = {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: TTS_VOICE } },
        };
        const contents = [{ role: "user", parts: [{ text: STEER + text }] }];

        let upstream: Response;
        try {
          if (geminiKey) {
            // Own-key mode: call Google directly, then convert to the widget's SSE format.
            const g = await fetch(
              "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:streamGenerateContent?alt=sse",
              {
                method: "POST",
                headers: { "Content-Type": "application/json", "x-goog-api-key": geminiKey },
                body: JSON.stringify({
                  contents,
                  generationConfig: { responseModalities: ["AUDIO"], speechConfig },
                }),
                signal: request.signal,
              },
            );
            if (!g.ok || !g.body) {
              const detail = await g.text().catch(() => "");
              return new Response(detail || "Voice unavailable.", { status: g.status, headers: CORS });
            }
            const reader = g.body.getReader();
            const dec = new TextDecoder();
            const enc = new TextEncoder();
            const out = new ReadableStream({
              async start(controller) {
                let buf = "";
                try {
                  while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    buf += dec.decode(value, { stream: true });
                    const lines = buf.split("\n");
                    buf = lines.pop() ?? "";
                    for (const line of lines) {
                      const t = line.trim();
                      if (!t.startsWith("data:")) continue;
                      try {
                        const parts = JSON.parse(t.slice(5).trim())?.candidates?.[0]?.content?.parts ?? [];
                        for (const part of parts) {
                          const audio = part?.inlineData?.data;
                          if (audio) {
                            controller.enqueue(
                              enc.encode(`data: ${JSON.stringify({ type: "speech.audio.delta", audio })}\n\n`),
                            );
                          }
                        }
                      } catch {
                        /* partial */
                      }
                    }
                  }
                } catch {
                  /* aborted */
                }
                controller.close();
              },
            });
            return new Response(out, {
              headers: {
                ...CORS,
                "Content-Type": "text/event-stream; charset=utf-8",
                "Cache-Control": "no-cache, no-transform",
              },
            });
          }
          upstream = await fetch("https://ai.gateway.lovable.dev/v1/audio/speech", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${lovableKey}`,
            },
            body: JSON.stringify({
              model: TTS_MODEL,
              contents,
              generationConfig: { responseModalities: ["AUDIO"], speechConfig },
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
