import { ImageResponse } from 'next/og';

export const alt = 'CarbonCompass — understand, track and reduce your carbon footprint';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// Dynamically rendered social-share card (used by LinkedIn, X, etc.).
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #064e3b 0%, #059669 100%)',
          padding: '70px',
          color: '#ecfdf5',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', fontSize: 40, fontWeight: 700 }}>
          <span style={{ fontSize: 56, marginRight: 16 }}>🧭</span>
          CarbonCompass
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 72, fontWeight: 800, lineHeight: 1.1 }}>
            Understand, track &amp; reduce
          </div>
          <div style={{ fontSize: 72, fontWeight: 800, lineHeight: 1.1 }}>
            your carbon footprint
          </div>
          <div style={{ fontSize: 34, marginTop: 28, color: '#a7f3d0' }}>
            AI coach · bill scanning · state-aware insights
          </div>
        </div>

        <div style={{ display: 'flex', gap: 16 }}>
          {['🌱 Personalized', '💬 AI chat', '📈 Streaks & goals'].map((t) => (
            <div
              key={t}
              style={{
                display: 'flex',
                background: 'rgba(255,255,255,0.15)',
                borderRadius: 999,
                padding: '12px 28px',
                fontSize: 28,
              }}
            >
              {t}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size },
  );
}
