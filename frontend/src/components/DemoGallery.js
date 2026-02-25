import React, { useState } from 'react';

const DEMO_IMAGES = [
  {
    id: 'pizza',
    name: 'Pizza',
    description: 'Classic Neapolitan pizza',
    icon: '🍕',
    url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=80',
  },
  {
    id: 'steak',
    name: 'Steak',
    description: 'Juicy ribeye steak',
    icon: '🥩',
    url: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=600&q=80',
  },
  {
    id: 'sushi',
    name: 'Sushi',
    description: 'Fresh Japanese sushi',
    icon: '🍣',
    url: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=600&q=80',
  },
];

function DemoGallery({ onSelectDemo }) {
  const [loadingId, setLoadingId] = useState(null);
  const [errorId, setErrorId] = useState(null);

  const handleDemoClick = async (demo) => {
    if (loadingId) return;
    setLoadingId(demo.id);
    setErrorId(null);

    try {
      const response = await fetch(demo.url);
      if (!response.ok) throw new Error('Fetch failed');
      const blob = await response.blob();
      const file = new File([blob], `${demo.id}.jpg`, { type: 'image/jpeg' });
      onSelectDemo(file);
    } catch {
      setErrorId(demo.id);
      setTimeout(() => setErrorId(null), 3000);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {DEMO_IMAGES.map((demo) => {
        const isLoading = loadingId === demo.id;
        const isError = errorId === demo.id;

        return (
          <button
            key={demo.id}
            className={`fv-demo-card${isError ? ' fv-demo-card--error' : ''}`}
            onClick={() => handleDemoClick(demo)}
            disabled={!!loadingId}
            aria-label={`Try ${demo.name} sample`}
          >
            {/* Image */}
            <div style={{ height: 112, position: 'relative', overflow: 'hidden' }}>
              <img
                src={demo.url}
                alt={demo.name}
                loading="lazy"
                style={{
                  width: '100%', height: '100%',
                  objectFit: 'cover', display: 'block',
                  transition: 'transform 0.4s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.04)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
              />

              {/* Left-to-right dark gradient scrim */}
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to right, rgba(0,0,0,0.54) 0%, rgba(0,0,0,0.16) 55%, transparent 100%)',
                pointerEvents: 'none',
              }} />

              {/* Left: icon + name */}
              <div style={{
                position: 'absolute', left: 14, top: 0, bottom: 0,
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <span style={{
                  fontSize: 26,
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.30))',
                }}>
                  {demo.icon}
                </span>
                <div style={{ textAlign: 'left' }}>
                  <p style={{
                    fontSize: 15, fontWeight: 700, color: 'white',
                    margin: 0, lineHeight: 1.2,
                    textShadow: '0 1px 4px rgba(0,0,0,0.30)',
                    letterSpacing: -0.2,
                  }}>
                    {demo.name}
                  </p>
                  <p style={{
                    fontSize: 11, color: 'rgba(255,255,255,0.75)',
                    margin: '2px 0 0', fontWeight: 500,
                  }}>
                    {demo.description}
                  </p>
                </div>
              </div>

              {/* Right: CTA icon */}
              <div style={{
                position: 'absolute', right: 14, top: 0, bottom: 0,
                display: 'flex', alignItems: 'center',
              }}>
                {isLoading ? (
                  <div style={{
                    width: 28, height: 28,
                    border: '2.5px solid rgba(255,255,255,0.35)',
                    borderTopColor: 'white',
                    borderRadius: '50%',
                    animation: 'fv-spin 0.7s linear infinite',
                  }} />
                ) : isError ? (
                  <div className="fv-demo-error-icon">
                    <svg style={{ width: 13, height: 13 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                ) : (
                  <div className="fv-demo-arrow">
                    <svg style={{ width: 13, height: 13 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                )}
              </div>
            </div>

            {/* Error label */}
            {isError && (
              <div style={{
                padding: '8px 14px',
                background: '#fff5f5',
                fontSize: 12, color: '#c0392b',
                fontWeight: 500, textAlign: 'left',
              }}>
                Failed to load &mdash; check your connection and try again.
              </div>
            )}
          </button>
        );
      })}

      <p style={{
        textAlign: 'center', fontSize: 11,
        color: '#aeaeb2', marginTop: 4, letterSpacing: 0.1,
      }}>
        Click any card to classify it instantly
      </p>
    </div>
  );
}

export default DemoGallery;
