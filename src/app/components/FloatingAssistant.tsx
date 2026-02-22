"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

type TicketResult = {
  id: string;
  invoice_number: string | null;
  customer_name: string | null;
  status: string;
  equipment_brand: string | null;
  equipment_type: string | null;
  grand_total: number | null;
};

type Message = {
  role: "user" | "assistant";
  content: string;
  action?: string;
  data?: Record<string, unknown>;
  tickets?: TicketResult[];
  ticketId?: string;
  invoiceNumber?: string;
};

export default function FloatingAssistant() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        'Hi! I\'m your shop assistant. Type or tap the mic 🎙️\n\nTry saying:\n• "Create a ticket for John Smith, Honda mower, won\'t start"\n• "Find tickets for Smith"\n• "How many tickets do I have?"',
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [pendingTicketData, setPendingTicketData] = useState<Record<string, unknown> | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<ReturnType<typeof createRecognition> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  function createRecognition() {
    const w = window as unknown as Record<string, unknown>;
    const SRConstructor = (w.SpeechRecognition || w.webkitSpeechRecognition) as
      | { new (): { continuous: boolean; interimResults: boolean; lang: string; start: () => void; stop: () => void; onresult: ((event: { results: { transcript: string }[][] }) => void) | null; onerror: (() => void) | null; onend: (() => void) | null } }
      | undefined;
    if (!SRConstructor) return null;
    const r = new SRConstructor();
    r.continuous = false;
    r.interimResults = false;
    r.lang = "en-US";
    return r;
  }

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || loading) return;

      const userMsg: Message = { role: "user", content: text.trim() };
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setLoading(true);

      try {
        // Build conversation history (last 10 messages for context)
        const history = messages
          .slice(-10)
          .map((m) => ({ role: m.role, content: m.content }));

        const res = await fetch("/api/ai-assistant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: text.trim(),
            conversationHistory: history,
            pendingTicketData,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: `⚠️ ${data.error || "Something went wrong."}` },
          ]);
          setLoading(false);
          return;
        }

        const assistantMsg: Message = {
          role: "assistant",
          content: data.message || "Done!",
          action: data.action,
          tickets: data.tickets,
          ticketId: data.ticketId,
          invoiceNumber: data.invoiceNumber,
          data: data.data,
        };

        // If AI wants to create a ticket, store the data for confirmation
        if (data.action === "confirm_ticket" && data.data) {
          setPendingTicketData(data.data);
        }

        // If ticket was created, clear pending data
        if (data.action === "ticket_created") {
          setPendingTicketData(null);
        }

        setMessages((prev) => [...prev, assistantMsg]);
      } catch {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "⚠️ Network error. Please try again." },
        ]);
      }

      setLoading(false);
    },
    [loading, messages, pendingTicketData]
  );

  function toggleVoice() {
    if (listening && recognitionRef.current) {
      recognitionRef.current.stop();
      setListening(false);
      return;
    }

    const recognition = createRecognition();
    if (!recognition) {
      alert("Voice input not supported. Try Chrome or Edge.");
      return;
    }

    recognitionRef.current = recognition;

    recognition.onresult = (event: { results: { transcript: string }[][] }) => {
      const transcript = event.results[0][0].transcript;
      if (transcript) {
        setInput(transcript);
        // Auto-send after voice
        setTimeout(() => sendMessage(transcript), 300);
      }
      setListening(false);
    };

    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);

    recognition.start();
    setListening(true);
  }

  function formatStatus(s: string) {
    return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  }

  return (
    <>
      {/* Floating Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full text-2xl shadow-lg transition-all hover:scale-110 active:scale-95"
          style={{
            background: "var(--color-brand, #f59e0b)",
            color: "#000",
            boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
          }}
          title="AI Assistant"
        >
          🤖
        </button>
      )}

      {/* Chat Panel */}
      {open && (
        <div
          className="fixed bottom-6 right-6 z-50 flex flex-col overflow-hidden rounded-2xl shadow-2xl"
          style={{
            width: "380px",
            maxWidth: "calc(100vw - 32px)",
            height: "520px",
            maxHeight: "calc(100vh - 100px)",
            background: "var(--color-surface-0, #1a1a1a)",
            border: "1px solid var(--color-border-subtle, #333)",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{
              background: "var(--color-brand, #f59e0b)",
              color: "#000",
            }}
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">🤖</span>
              <div>
                <p className="text-sm font-bold">Shop Assistant</p>
                <p className="text-[11px] opacity-70">Powered by Claude</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-full text-lg transition-colors hover:bg-black/10"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <div key={i}>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    msg.role === "user" ? "ml-auto" : "mr-auto"
                  }`}
                  style={
                    msg.role === "user"
                      ? {
                          background: "var(--color-brand, #f59e0b)",
                          color: "#000",
                          borderBottomRightRadius: "4px",
                        }
                      : {
                          background: "var(--color-surface-2, #2a2a2a)",
                          color: "var(--color-text-primary, #eee)",
                          borderBottomLeftRadius: "4px",
                        }
                  }
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>

                {/* Ticket preview card */}
                {msg.action === "confirm_ticket" && msg.data && (
                  <div
                    className="mt-2 mr-auto max-w-[85%] rounded-xl p-3 text-xs space-y-1"
                    style={{
                      background: "var(--color-surface-3, #333)",
                      color: "var(--color-text-secondary, #bbb)",
                    }}
                  >
                    {msg.data.customer_name && (
                      <p>👤 <strong>{String(msg.data.customer_name)}</strong></p>
                    )}
                    {(msg.data.equipment_brand || msg.data.equipment_type) && (
                      <p>
                        🔧 {[msg.data.equipment_brand, msg.data.equipment_model, msg.data.equipment_type]
                          .filter(Boolean)
                          .map(String)
                          .join(" ")}
                      </p>
                    )}
                    {msg.data.problem_description && (
                      <p>📋 {String(msg.data.problem_description)}</p>
                    )}
                    {msg.data.customer_phone && (
                      <p>📱 {String(msg.data.customer_phone)}</p>
                    )}
                    <p
                      className="mt-2 text-[11px] font-medium"
                      style={{ color: "var(--color-brand, #f59e0b)" }}
                    >
                      Say &quot;yes&quot; or &quot;create it&quot; to confirm
                    </p>
                  </div>
                )}

                {/* Ticket created — clickable link */}
                {msg.action === "ticket_created" && msg.ticketId && (
                  <button
                    onClick={() => {
                      router.push(`/dashboard/tickets/${msg.ticketId}`);
                      setOpen(false);
                    }}
                    className="mt-2 mr-auto flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-colors hover:brightness-110"
                    style={{
                      background: "var(--color-brand, #f59e0b)",
                      color: "#000",
                    }}
                  >
                    📄 View Ticket {msg.invoiceNumber}
                  </button>
                )}

                {/* Search results */}
                {msg.action === "search_results" && msg.tickets && msg.tickets.length > 0 && (
                  <div className="mt-2 mr-auto max-w-[85%] space-y-1.5">
                    {msg.tickets.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => {
                          router.push(`/dashboard/tickets/${t.id}`);
                          setOpen(false);
                        }}
                        className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs transition-colors hover:brightness-110"
                        style={{
                          background: "var(--color-surface-3, #333)",
                          color: "var(--color-text-primary, #eee)",
                        }}
                      >
                        <div>
                          <span className="font-mono font-medium" style={{ color: "var(--color-brand, #f59e0b)" }}>
                            {t.invoice_number || "—"}
                          </span>{" "}
                          <span>{t.customer_name || "No name"}</span>
                          <p className="mt-0.5 opacity-60">
                            {[t.equipment_brand, t.equipment_type].filter(Boolean).join(" ") || "—"}
                          </p>
                        </div>
                        <span
                          className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                          style={{
                            background: "var(--color-surface-2, #2a2a2a)",
                            color: "var(--color-text-muted, #888)",
                          }}
                        >
                          {formatStatus(t.status || "intake")}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div
                className="mr-auto max-w-[85%] rounded-2xl px-4 py-2.5 text-sm"
                style={{
                  background: "var(--color-surface-2, #2a2a2a)",
                  color: "var(--color-text-muted, #888)",
                  borderBottomLeftRadius: "4px",
                }}
              >
                <span className="animate-pulse">Thinking...</span>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div
            className="flex items-center gap-2 px-3 py-3"
            style={{ borderTop: "1px solid var(--color-border-subtle, #333)" }}
          >
            {/* Mic button */}
            <button
              type="button"
              onClick={toggleVoice}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all"
              style={{
                background: listening ? "rgba(239,68,68,0.2)" : "var(--color-surface-2, #2a2a2a)",
                color: listening ? "#ef4444" : "var(--color-text-muted, #888)",
              }}
              title={listening ? "Stop listening" : "Speak"}
            >
              {listening ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="6" width="12" height="12" rx="2" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="2" width="6" height="12" rx="3" />
                  <path d="M5 10a7 7 0 0 0 14 0" />
                  <line x1="12" y1="19" x2="12" y2="22" />
                </svg>
              )}
            </button>

            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage(input);
                }
              }}
              placeholder={listening ? "Listening..." : "Type or speak..."}
              disabled={loading}
              className="flex-1 rounded-full px-4 py-2.5 text-sm outline-none"
              style={{
                background: "var(--color-surface-2, #2a2a2a)",
                color: "var(--color-text-primary, #eee)",
                border: listening ? "2px solid #ef4444" : "1px solid var(--color-border-subtle, #333)",
              }}
            />

            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || loading}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-black transition-all hover:brightness-110 disabled:opacity-30"
              style={{ background: "var(--color-brand, #f59e0b)" }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}