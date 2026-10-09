import { createFileRoute } from "@tanstack/react-router";

const SYSTEM_PROMPT = `You are Anya, the friendly official virtual guide of Lakireddy Bali Reddy College of Engineering (LBRCE), https://www.lbrce.ac.in/.
Facts:
- Autonomous institution, NAAC 'A' grade, affiliated with JNTUK (Kakinada), located in Mylavaram, NTR District, Andhra Pradesh.
- EAPCET / ECET / ICET counselling code: LBCE. College code: 76.
- Departments: CSE, CSE (AI&ML), AI&DS, IT, ECE, EEE, Civil, Mechanical, Aerospace, MBA, Freshman Engineering.
- Location & transport: about 46 km from Vijayawada (PNBS bus station). APSRTC bus no. 350 runs directly from Vijayawada to Mylavaram. College buses also serve nearby towns.
- Placements: strong record with recruiters such as Cognizant, Infosys, TCS, HCL, Deloitte and more.
Rules: This is an ongoing conversation. Greet or introduce yourself ONLY if the user's first message is a greeting; never say "Hi", "Hello" or "I'm Anya" in later replies - just answer directly and naturally, continuing from the previous messages. If the user says goodbye or thanks, reply briefly and warmly. Answer concisely (under 120 words), warm and professional, use short markdown lists when helpful. If unsure of a detail (fees, cut-offs, dates), say so and point the user to https://www.lbrce.ac.in/ or the admissions office. Stay on LBRCE / education topics.`;

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

type Msg = { role: "user" | "assistant"; content: string };

export const Route = createFileRoute("/api/public/chat")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      POST: async ({ request }) => {
        let messages: Msg[] = [];
        try {
          const body = await request.json();
          messages = (Array.isArray(body?.messages) ? body.messages : [])
            .filter(
              (m: Msg) =>
                (m?.role === "user" || m?.role === "assistant") &&
                typeof m.content === "string",
            )
            .slice(-20)
            .map((m: Msg) => ({ role: m.role, content: m.content.slice(0, 2000) }));
        } catch {
          /* ignore */
        }
        if (messages[messages.length - 1]?.role !== "user") {
          return new Response("Please send a message.", { status: 400, headers: CORS });
        }
        // Local/own-key mode: set GEMINI_API_KEY in .env to call Google directly.
        const geminiKey = process.env["GEMINI_API_KEY"];
        const lovableKey = process.env["LOVABLE_API_KEY"];
        if (!geminiKey && !lovableKey) {
          return new Response("Assistant is not configured.", { status: 500, headers: CORS });
        }
        const payload = {
          stream: true,
          messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
        };

        let upstream: Response;
        try {
          upstream = geminiKey
            ? await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${geminiKey}` },
                body: JSON.stringify({ ...payload, model: "gemini-2.5-flash" }),
                signal: request.signal,
              })
            : await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Lovable-API-Key": lovableKey!,
                  Authorization: `Bearer ${lovableKey}`,
                  "X-Lovable-AIG-SDK": "fetch",
                },
                body: JSON.stringify({ ...payload, model: "google/gemini-2.5-flash" }),
                signal: request.signal,
              });
        } catch {
          return new Response("Sorry, I couldn't answer right now. Please try again.", {
            status: 502,
            headers: CORS,
          });
        }

        if (!upstream.ok || !upstream.body) {
          const status = upstream.status;
          const msg =
            status === 429
              ? "I'm getting a lot of questions right now. Please try again in a moment."
              : status === 402
                ? "The assistant is temporarily unavailable (usage limit reached)."
                : "Sorry, I couldn't answer right now. Please try again.";
          return new Response(msg, { status, headers: CORS });
        }

        const reader = upstream.body.getReader();
        const dec = new TextDecoder();
        const enc = new TextEncoder();
        const stream = new ReadableStream({
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
                  const data = t.slice(5).trim();
                  if (data === "[DONE]") continue;
                  try {
                    const delta = JSON.parse(data)?.choices?.[0]?.delta?.content;
                    if (delta) controller.enqueue(enc.encode(delta));
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
        return new Response(stream, {
          headers: { ...CORS, "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-cache" },
        });
      },
    },
  },
});
