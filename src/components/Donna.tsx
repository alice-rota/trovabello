"use client";

import { useEffect, useRef, useState } from "react";

type Msg = { role: "user" | "assistant"; content: string };

export default function Donna() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy, open]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const q = input.trim();
    if (!q || busy) return;
    const next: Msg[] = [...messages, { role: "user", content: q }];
    setMessages(next);
    setInput("");
    setBusy(true);
    try {
      const r = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const d = await r.json();
      setMessages((m) => [...m, { role: "assistant", content: d.reply }]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "Oups, petit souci de mon côté. Réessaie 🥂" },
      ]);
    }
    setBusy(false);
  }

  const suggestions = [
    "Quel lieu est le moins cher ?",
    "Combien j'ai mis en favoris ?",
    "Qu'est-ce qu'il me manque ?",
  ];

  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-3 sm:right-6 z-50 w-[calc(100vw-1.5rem)] sm:w-96 max-h-[72vh] bg-paper rounded-2xl border border-ink/15 shadow-2xl flex flex-col overflow-hidden">
          <header className="flex items-center gap-3 px-4 py-3 border-b border-ink/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/illustrations/donna.png" alt="" className="h-10 w-10 object-contain" />
            <div>
              <p className="font-hand text-wine leading-none text-lg">Donna</p>
              <p className="text-[11px] text-ink/40">ta wedding planneuse</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Fermer"
              className="ml-auto text-ink/40 hover:text-ink text-xl leading-none"
            >
              ×
            </button>
          </header>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 text-sm">
            {messages.length === 0 && (
              <div className="space-y-3">
                <p className="text-ink/60">
                  Coucou ! 🥂 Je connais tous tes prestataires. Pose-moi une
                  question :
                </p>
                <div className="flex flex-col gap-1.5">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      onClick={() => setInput(s)}
                      className="text-left text-wine hover:underline"
                    >
                      → {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={m.role === "user" ? "text-right" : ""}>
                <span
                  className={`inline-block rounded-2xl px-3 py-2 text-left whitespace-pre-wrap ${
                    m.role === "user"
                      ? "bg-wine text-paper"
                      : "bg-paper-soft text-ink/80"
                  }`}
                >
                  {m.content}
                </span>
              </div>
            ))}
            {busy && <p className="text-ink/40">Donna réfléchit…</p>}
            <div ref={endRef} />
          </div>

          <form onSubmit={send} className="p-3 border-t border-ink/10 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Pose ta question…"
              className="flex-1 rounded-full border border-ink/20 px-4 py-2 text-sm focus:border-wine focus:outline-none"
            />
            <button
              type="submit"
              disabled={busy}
              aria-label="Envoyer"
              className="rounded-full bg-wine text-paper w-10 h-10 shrink-0 flex items-center justify-center disabled:opacity-50 hover:bg-wine/90"
            >
              →
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Donna, ta wedding planneuse"
        className="fixed bottom-5 right-3 sm:right-6 z-50 h-16 w-16 rounded-full bg-paper border border-ink/15 shadow-lg flex items-center justify-center hover:shadow-xl hover:-translate-y-0.5 transition"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/illustrations/donna.png" alt="Donna" className="h-12 w-12 object-contain" />
      </button>
    </>
  );
}
