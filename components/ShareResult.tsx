'use client';

import { useState } from 'react';

import { Category, CATEGORY_LABELS, FootprintResult } from '@/lib/emissions';

const COLORS: Record<Category, string> = {
  transport: '#047857',
  home: '#059669',
  food: '#10b981',
  lifestyle: '#6ee7b7',
};

/** Draw a square shareable card onto a canvas and return it. */
function drawCard(result: FootprintResult): HTMLCanvasElement {
  const S = 1080;
  const canvas = document.createElement('canvas');
  canvas.width = S;
  canvas.height = S;
  const ctx = canvas.getContext('2d')!;

  // Background gradient.
  const grad = ctx.createLinearGradient(0, 0, S, S);
  grad.addColorStop(0, '#064e3b');
  grad.addColorStop(1, '#059669');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, S, S);

  ctx.fillStyle = '#ecfdf5';
  ctx.textBaseline = 'top';

  ctx.font = '700 44px system-ui, sans-serif';
  ctx.fillText('🧭 CarbonCompass', 80, 80);

  ctx.font = '500 40px system-ui, sans-serif';
  ctx.fillStyle = '#a7f3d0';
  ctx.fillText('My monthly carbon footprint', 80, 200);

  // Big number.
  ctx.fillStyle = '#ffffff';
  ctx.font = '800 150px system-ui, sans-serif';
  ctx.fillText(`${result.totalMonthly}`, 80, 260);
  ctx.font = '700 56px system-ui, sans-serif';
  ctx.fillStyle = '#a7f3d0';
  ctx.fillText('kg CO₂e / month', 80, 430);

  ctx.font = '500 36px system-ui, sans-serif';
  ctx.fillStyle = '#d1fae5';
  ctx.fillText(
    `${result.comparison.vsIndiaPct}% of the India average · ${result.totalAnnual} kg/year`,
    80,
    510,
  );

  // Breakdown bars.
  const entries = (Object.keys(result.breakdown) as Category[])
    .map((k) => ({ k, v: result.breakdown[k] }))
    .sort((a, b) => b.v - a.v);
  const max = Math.max(...entries.map((e) => e.v), 1);
  let y = 610;
  entries.forEach((e) => {
    ctx.fillStyle = '#ecfdf5';
    ctx.font = '600 30px system-ui, sans-serif';
    ctx.fillText(`${CATEGORY_LABELS[e.k]} — ${e.v} kg`, 80, y);
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.fillRect(80, y + 42, S - 160, 26);
    ctx.fillStyle = COLORS[e.k];
    ctx.fillRect(80, y + 42, (S - 160) * (e.v / max), 26);
    y += 100;
  });

  ctx.fillStyle = '#a7f3d0';
  ctx.font = '500 32px system-ui, sans-serif';
  ctx.fillText('Calculate yours · #CarbonCompass', 80, S - 90);

  return canvas;
}

export function ShareResult({ result }: { result: FootprintResult }) {
  const [status, setStatus] = useState('');

  function download() {
    const canvas = drawCard(result);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'my-carbon-footprint.png';
      a.click();
      URL.revokeObjectURL(url);
      setStatus('Card downloaded ✓');
    }, 'image/png');
  }

  async function share() {
    const text = `My monthly carbon footprint is ${result.totalMonthly} kg CO₂e — ${result.comparison.vsIndiaPct}% of the India average. Calculate yours with CarbonCompass!`;
    const url = typeof window !== 'undefined' ? window.location.origin : '';
    try {
      if (navigator.share) {
        await navigator.share({ title: 'CarbonCompass', text, url });
        setStatus('Shared ✓');
      } else {
        await navigator.clipboard.writeText(`${text} ${url}`);
        setStatus('Copied to clipboard ✓');
      }
    } catch {
      setStatus('');
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={share}
        className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
      >
        Share my footprint
      </button>
      <button
        type="button"
        onClick={download}
        className="rounded-lg border border-brand-200 bg-white px-4 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-50"
      >
        Download card
      </button>
      {status ? (
        <span role="status" className="text-sm text-brand-700">
          {status}
        </span>
      ) : null}
    </div>
  );
}
