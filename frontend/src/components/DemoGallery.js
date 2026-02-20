import React, { useState } from 'react';

const DEMO_IMAGES = [
  {
    id: 'pizza',
    name: 'Pizza',
    emoji: '🍕',
    description: 'Classic Neapolitan pizza',
    url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=80',
    accent: 'from-orange-400 to-red-400',
    hoverBorder: 'hover:border-orange-400',
    activeBg: 'bg-orange-50',
  },
  {
    id: 'steak',
    name: 'Steak',
    emoji: '🥩',
    description: 'Juicy ribeye steak',
    url: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=600&q=80',
    accent: 'from-red-600 to-rose-500',
    hoverBorder: 'hover:border-red-400',
    activeBg: 'bg-red-50',
  },
  {
    id: 'sushi',
    name: 'Sushi',
    emoji: '🍣',
    description: 'Fresh Japanese sushi',
    url: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=600&q=80',
    accent: 'from-pink-500 to-fuchsia-500',
    hoverBorder: 'hover:border-pink-400',
    activeBg: 'bg-pink-50',
  },
];

function DemoGallery({ onSelectDemo }) {
  const [loadingId, setLoadingId] = useState(null);
  const [errorId, setErrorId] = useState(null);

  const handleDemoClick = async (demo) => {
    if (loadingId) return; // prevent double-click
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
    <div className="space-y-4">
      {DEMO_IMAGES.map((demo) => {
        const isLoading = loadingId === demo.id;
        const isError = errorId === demo.id;

        return (
          <button
            key={demo.id}
            onClick={() => handleDemoClick(demo)}
            disabled={!!loadingId}
            className={`
              w-full group relative rounded-2xl overflow-hidden
              border-2 border-transparent ${demo.hoverBorder}
              shadow-md hover:shadow-xl
              transition-all duration-300
              disabled:cursor-not-allowed disabled:opacity-70
              focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2
              ${isError ? 'border-red-400' : ''}
            `}
            aria-label={`Try ${demo.name} example`}
          >
            {/* Image */}
            <div className="h-28 sm:h-32 relative overflow-hidden">
              <img
                src={demo.url}
                alt={demo.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              {/* Gradient overlay */}
              <div className={`absolute inset-0 bg-gradient-to-r ${demo.accent} opacity-0 group-hover:opacity-20 transition-opacity duration-300`} />
              {/* Dark scrim for text */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/20 to-transparent" />

              {/* Left text block */}
              <div className="absolute left-4 top-0 bottom-0 flex items-center gap-3">
                <span className="text-3xl drop-shadow-lg">{demo.emoji}</span>
                <div className="text-left">
                  <p className="text-white font-bold text-lg leading-tight drop-shadow-md">
                    {demo.name}
                  </p>
                  <p className="text-white/80 text-xs font-medium drop-shadow-sm">
                    {demo.description}
                  </p>
                </div>
              </div>

              {/* Right CTA */}
              <div className="absolute right-4 top-0 bottom-0 flex items-center">
                {isLoading ? (
                  <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : isError ? (
                  <div className="fv-demo-error-icon">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                ) : (
                  <div className="fv-demo-arrow">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                )}
              </div>
            </div>

            {/* Error label below image */}
            {isError && (
              <div className="px-4 py-2 bg-red-50 text-xs text-red-600 font-medium text-left">
                Failed to load — check your connection and try again.
              </div>
            )}
          </button>
        );
      })}

      <p className="text-center text-xs text-gray-400 pt-1">
        Click any card to classify it instantly
      </p>
    </div>
  );
}

export default DemoGallery;
