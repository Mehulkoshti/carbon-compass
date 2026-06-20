'use client';

import { useRef, useState } from 'react';

import { UserProfile } from '@/lib/emissions';
import { ChatMessage } from '@/lib/schema';

const SUGGESTIONS = [
  'What should I focus on first?',
  'How can I cut my transport emissions?',
  'Is my footprint good or bad?',
];

export function ChatCoach({ profile }: { profile: UserProfile }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  async function send(text: string) {
    const content = text.trim();
    if (!content || loading) return;

    const next: ChatMessage[] = [...messages, { role: 'user', content }];
    setMessages(next);
    setInput('');
    setLoading(true);

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
      requestAnimationFrame(() => {
        listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
      });
    }
  }

  return (
    <section
      aria-labelledby="chat-heading"
      className="flex flex-col rounded-xl border border-brand-100 bg-white p-6 shadow-sm"
    >
      <h2 id="chat-heading" className="text-xl font-bold text-slate-900">
        💬 Ask your coach
      </h2>
      <p className="mt-1 text-slate-600">
        A live assistant that answers using <em>your</em> footprint data.
      </p>

      <div
        ref={listRef}
        aria-live="polite"
        aria-atomic="false"
        className="mt-4 max-h-72 flex-1 space-y-3 overflow-y-auto"
      >
        {messages.length === 0 ? (
          <p className="text-sm text-slate-400">
            Ask anything about your footprint — try a suggestion below.
          </p>
        ) : (
          messages.map((m, i) => (
            <div
              key={i}
              className={m.role === 'user' ? 'text-right' : 'text-left'}
            >
              <span className="sr-only">{m.role === 'user' ? 'You said:' : 'Coach said:'}</span>
              <p
                className={`inline-block max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
                  m.role === 'user'
                    ? 'bg-brand-600 text-white'
                    : 'bg-brand-50 text-slate-800'
                }`}
              >
                {m.content}
              </p>
            </div>
          ))
        )}
        {loading ? (
          <p className="text-left text-sm text-slate-400" role="status">
            Coach is typing…
          </p>
        ) : null}
      </div>

      {messages.length === 0 ? (
        <ul className="mt-4 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <li key={s}>
              <button
                type="button"
                onClick={() => send(s)}
                className="rounded-full border border-brand-200 px-3 py-1 text-xs text-brand-700 hover:bg-brand-50"
              >
                {s}
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <form
        className="mt-4 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
      >
        <label htmlFor="chat-input" className="sr-only">
          Ask the coach a question
        </label>
        <input
          id="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          maxLength={2000}
          placeholder="Type your question…"
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-600"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-40"
        >
          Send
        </button>
      </form>
    </section>
  );
}
