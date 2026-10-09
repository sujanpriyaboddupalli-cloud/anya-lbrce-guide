import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Anya — LBRCE AI Assistant Widget" },
      { name: "description", content: "Embeddable AI chatbot with voice for Lakireddy Bali Reddy College of Engineering." },
      { property: "og:title", content: "Anya — LBRCE AI Assistant Widget" },
      { property: "og:description", content: "Embeddable AI chatbot with voice for LBRCE's website." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

function Index() {
  useEffect(() => {
    const s = document.createElement("script");
    s.src = "/lbrce-assistant.js";
    s.defer = true;
    document.body.appendChild(s);
  }, []);
  const [origin, setOrigin] = useState("https://YOUR-APP-DOMAIN");
  useEffect(() => setOrigin(window.location.origin), []);
  return (
    <main className="min-h-screen bg-background px-6 py-16 text-foreground">
      <div className="mx-auto max-w-2xl space-y-8">
        <header className="space-y-3">
          <p className="text-sm uppercase tracking-widest text-muted-foreground">LBRCE · Mylavaram</p>
          <h1 className="text-4xl font-semibold tracking-tight">Anya, the LBRCE Guide</h1>
          <p className="text-muted-foreground">
            A voice-enabled AI assistant for the college website. Try it with the chat button in the bottom-right corner.
          </p>
        </header>
        <section className="space-y-3 rounded-2xl border border-border bg-card p-6">
          <h2 className="font-semibold">Add it to lbrce.ac.in</h2>
          <p className="text-sm text-muted-foreground">Paste this one line before the closing body tag of any page:</p>
          <pre className="overflow-x-auto rounded-lg bg-primary p-4 text-sm text-primary-foreground">
            {`<script src="${origin}/lbrce-assistant.js" defer></script>`}
          </pre>
          <p className="text-xs text-muted-foreground">Use your published app address once you publish.</p>
        </section>
      </div>
    </main>
  );
}
