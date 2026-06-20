'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

import { UserProfile } from '@/lib/emissions';
import { ChatMessage } from '@/lib/schema';
import { storage } from '@/lib/storage';

const SUGGESTIONS = [
  'What should I focus on first?',
  'How can I cut my transport emissions?',
  'Is my footprint good or bad?',
];

export function FloatingChat() {
  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load the saved profile whenever the panel opens (it may have changed).
  useEffect(() => {
    if (open) {
      setProfile(storage.loadProfile());
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  function scrollToEnd() {
    requestAnimationFrame(() => listRef.current?.scrollTo({ top: listRef.current.scrollHeight }));
  }

  async function send(text: string) {
    const content = text.trim();
    if (!content || loading || !profile) return;

    const next: ChatMessage[] = [...messages, { role: 'user', content }];
    setMessages(next);
    setInput('');
    setLoading(true);
    scrollToEnd();

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile, messages: next }),
      });
      const data = await res.json();
      const reply =
        typeof data?.reply === 'string'
          ? data.reply
          : 'Sorry, I could not respond just now. Please try again.';
      setMessages((m) => [...m, { role: 'model', content: reply }]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: 'model', content: 'Network error — please try again in a moment.' },
      ]);
    } finally {
      setLoading(false);
      scrollToEnd();
    }
  }

  return (
    <>
      {/* Chat panel */}
      {open ? (
        <div
          role="dialog"
          aria-label="Carbon coach chat"
          aria-modal="false"
          className="fixed bottom-24 right-4 z-50 flex h-[70vh] max-h-[560px] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-brand-100 bg-white shadow-2xl sm:right-6"
        >
          {/* Header */}
          <div className="flex items-center gap-3 bg-gradient-to-r from-brand-700 to-brand-500 px-4 py-3 text-white">
            <span
              aria-hidden="true"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-xl"
            >
              🧭
            </span>
            <div className="flex-1">
              <p className="font-semibold leading-tight">Carbon Coach</p>
              <p className="flex items-center gap-1 text-xs text-brand-50">
                <span className="h-2 w-2 rounded-full bg-emerald-300" aria-hidden="true" />
                Online · AI assistant
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="rounded-full p-1 text-white/90 hover:bg-white/20"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M6 6l12 12M18 6L6 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div
            ref={listRef}
            aria-live="polite"
            className="flex-1 space-y-3 overflow-y-auto bg-brand-50/40 px-4 py-4"
          >
            {!profile ? (
              <div className="rounded-xl bg-white p-4 text-sm text-slate-600 shadow-sm">
                👋 Hi! To chat about <em>your</em> footprint, first take the quick calculator.
                <Link
                  href="/calculator"
                  onClick={() => setOpen(false)}
                  className="mt-3 block rounded-lg bg-brand-600 px-4 py-2 text-center font-semibold text-white hover:bg-brand-700"
                >
                  Calculate my footprint
                </Link>
              </div>
            ) : (
              <>
                {messages.length === 0 ? (
                  <div className="rounded-2xl rounded-tl-sm bg-white px-4 py-2 text-sm text-slate-700 shadow-sm">
                    Hi! 🌱 I&apos;m your carbon coach. Ask me anything about your footprint —
                    or tap a suggestion below.
                  </div>
                ) : (
                  messages.map((m, i) => (
                    <div key={i} className={m.role === 'user' ? 'text-right' : 'text-left'}>
                      <span className="sr-only">
                        {m.role === 'user' ? 'You said:' : 'Coach said:'}
                      </span>
                      <p
                        className={`inline-block max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2 text-sm shadow-sm ${
                          m.role === 'user'
                            ? 'rounded-br-sm bg-brand-600 text-white'
                            : 'rounded-tl-sm bg-white text-slate-800'
                        }`}
                      >
                        {m.content}
                      </p>
                    </div>
                  ))
                )}
                {loading ? (
                  <div className="text-left" role="status" aria-label="Coach is typing">
                    <span className="inline-flex gap-1 rounded-2xl rounded-tl-sm bg-white px-4 py-3 shadow-sm">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-brand-400 [animation-delay:-0.3s]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-brand-400 [animation-delay:-0.15s]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-brand-400" />
                    </span>
                  </div>
                ) : null}
              </>
            )}
          </div>

          {/* Suggestions (only before first message) */}
          {profile && messages.length === 0 ? (
            <div className="flex flex-wrap gap-2 border-t border-brand-50 bg-white px-3 py-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => send(s)}
                  className="rounded-full border border-brand-200 px-3 py-1 text-xs text-brand-700 hover:bg-brand-50"
                >
                  {s}
                </button>
              ))}
            </div>
          ) : null}

          {/* Input */}
          {profile ? (
            <form
              className="flex items-center gap-2 border-t border-brand-100 bg-white p-3"
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
            >
              <label htmlFor="floating-chat-input" className="sr-only">
                Message your carbon coach
              </label>
              <input
                id="floating-chat-input"
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                maxLength={2000}
                placeholder="Type a message…"
                className="flex-1 rounded-full border border-slate-300 px-4 py-2 text-sm focus:border-brand-600"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                aria-label="Send message"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-40"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M3 11l18-8-8 18-2-7-8-3z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinejoin="round"
                    fill="currentColor"
                  />
                </svg>
              </button>
            </form>
          ) : null}
        </div>
      ) : null}

      {/* Launcher button */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Close carbon coach chat' : 'Open carbon coach chat'}
        aria-expanded={open}
        className="fixed bottom-5 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-brand-600 to-brand-700 text-white shadow-lg transition hover:scale-105 hover:shadow-xl sm:right-6"
      >
        {open ? (
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M6 6l12 12M18 6L6 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        ) : (
          <span aria-hidden="true" className="text-2xl">
            💬
          </span>
        )}
        {!open ? (
          <span className="absolute -right-0 -top-0 flex h-4 w-4">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-75" />
            <span className="relative inline-flex h-4 w-4 rounded-full bg-emerald-400" />
          </span>
        ) : null}
      </button>
    </>
  );
}
