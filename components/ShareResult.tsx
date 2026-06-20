'use client';

import { useState } from 'react';

import { Category, CATEGORY_LABELS, FootprintResult } from '@/lib/emissions';

// Brighter palette so every segment stays legible on the dark card background.
const COLORS: Record<Category, string> = {
  transport: '#6ee7b7',
  home: '#34d399',
  food: '#a7f3d0',
  lifestyle: '#d1fae5',
};

/** Draw a square shareable card (with a donut chart) onto a canvas. */
function drawCard(result: FootprintResult): HTMLCanvasElement {
  const S = 1080;
  const canvas = document.createElement('canvas');
  canvas.width = S;
  canvas.height = S;
  const ctx = canvas.getContext('2d')!;

  // Background gradient.
  const grad = ctx.createLinearGradient(0, 0, S, S);
  grad.addColorStop(0, '#064e3b');
  grad.addColorStop(1, '#047857');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, S, S);

  ctx.textBaseline = 'top';

  // Brand.
  ctx.fillStyle = '#ecfdf5';
  ctx.font = '700 46px system-ui, sans-serif';
  ctx.fillText('🧭 CarbonCompass', 80, 72);

  ctx.font = '500 38px system-ui, sans-serif';
  ctx.fillStyle = '#a7f3d0';
  ctx.fillText('My monthly carbon footprint', 80, 150);

  // Donut chart.
  const cx = 320;
  const cy = 520;
  const radius = 175;
  const lineW = 64;
  const entries = (Object.keys(result.breakdown) as Category[])
    .map((k) => ({ k, v: result.breakdown[k] }))
    .sort((a, b) => b.v - a.v);
  const total = result.totalMonthly > 0 ? result.totalMonthly : 1;

  // Track ring.
  ctx.lineWidth = lineW;
  ctx.strokeStyle = 'rgba(255,255,255,0.12)';
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.stroke();

  // Segments.
  let start = -Math.PI / 2;
  entries.forEach((e) => {
    const angle = (e.v / total) * Math.PI * 2;
    ctx.strokeStyle = COLORS[e.k];
    ctx.lineCap = 'butt';
    ctx.beginPath();
    ctx.arc(cx, cy, radius, start, start + angle);
    ctx.stroke();
    start += angle;
  });

  // Donut center: big number.
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffffff';
  ctx.font = '800 96px system-ui, sans-serif';
  ctx.fillText(`${result.totalMonthly}`, cx, cy - 60);
  ctx.font = '600 34px system-ui, sans-serif';
  ctx.fillStyle = '#a7f3d0';
  ctx.fillText('kg CO₂e / mo', cx, cy + 40);
  ctx.textAlign = 'left';

  // Legend.
  let ly = 360;
  entries.forEach((e) => {
    const pct = Math.round((e.v / total) * 100);
    ctx.fillStyle = COLORS[e.k];
    ctx.beginPath();
    ctx.arc(640, ly + 18, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ecfdf5';
    ctx.font = '600 34px system-ui, sans-serif';
    ctx.fillText(CATEGORY_LABELS[e.k], 675, ly);
    ctx.fillStyle = '#a7f3d0';
    ctx.font = '500 30px system-ui, sans-serif';
    ctx.fillText(`${e.v} kg · ${pct}%`, 675, ly + 40);
    ly += 100;
  });

  // Comparison strip.
  ctx.fillStyle = 'rgba(255,255,255,0.10)';
  ctx.fillRect(80, 800, S - 160, 110);
  ctx.fillStyle = '#ffffff';
  ctx.font = '600 36px system-ui, sans-serif';
  ctx.fillText(`${result.comparison.vsIndiaPct}% of the India average`, 110, 828);
  ctx.fillStyle = '#a7f3d0';
  ctx.font = '500 30px system-ui, sans-serif';
  ctx.fillText(`${result.totalAnnual} kg CO₂e per year`, 110, 872);

  // Footer.
  ctx.fillStyle = '#a7f3d0';
  ctx.font = '600 34px system-ui, sans-serif';
  ctx.fillText('Calculate yours · #CarbonCompass', 80, S - 88);

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
