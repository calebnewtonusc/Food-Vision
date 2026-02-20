import React, { useEffect, useState } from 'react';

/* Food metadata: emoji + gradient accent per class */
const FOOD_META = {
  pizza: {
    emoji: '🍕',
    label: 'Pizza',
    gradient: 'from-orange-500 to-red-500',
    lightBg: 'bg-orange-50',
    border: 'border-orange-200',
    textAccent: 'text-orange-600',
    barColor: 'fv-bar--pizza',
  },
  steak: {
    emoji: '🥩',
    label: 'Steak',
    gradient: 'from-red-700 to-rose-500',
    lightBg: 'bg-red-50',
    border: 'border-red-200',
    textAccent: 'text-red-700',
    barColor: 'fv-bar--steak',
  },
  sushi: {
    emoji: '🍣',
    label: 'Sushi',
    gradient: 'from-pink-500 to-fuchsia-500',
    lightBg: 'bg-pink-50',
    border: 'border-pink-200',
    textAccent: 'text-pink-600',
    barColor: 'fv-bar--sushi',
  },
  unknown: {
    emoji: '🤔',
    label: 'Unknown',
    gradient: 'from-gray-400 to-gray-600',
    lightBg: 'bg-gray-50',
    border: 'border-gray-200',
    textAccent: 'text-gray-600',
    barColor: 'fv-bar--unknown',
  },
};

/* Confidence badge styling */
function confidenceBadge(conf) {
  if (conf > 0.9) return { text: 'Very High', cls: 'fv-badge--high' };
  if (conf > 0.7) return { text: 'High', cls: 'fv-badge--med' };
  if (conf > 0.5) return { text: 'Moderate', cls: 'fv-badge--low' };
  return { text: 'Low', cls: 'fv-badge--very-low' };
}

/* Single animated confidence bar row */
function ConfidenceBar({ className, prob, meta, isTop, animate }) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (animate) {
      const timer = setTimeout(() => setWidth(prob * 100), 80);
      return () => clearTimeout(timer);
    }
  }, [animate, prob]);

  const m = meta || FOOD_META.unknown;
  const pct = (prob * 100).toFixed(1);

  return (
    <div className={`fv-bar-row ${isTop ? 'fv-bar-row--top' : ''}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xl leading-none">{m.emoji}</span>
          <span className={`text-sm font-semibold capitalize ${isTop ? m.textAccent : 'text-gray-600'}`}>
            {className}
          </span>
          {isTop && (
            <span className="fv-tag">Top</span>
          )}
        </div>
        <span className={`text-sm font-bold tabular-nums ${isTop ? m.textAccent : 'text-gray-500'}`}>
          {pct}%
        </span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden shadow-inner">
        <div
          className={`h-3 rounded-full fv-bar-fill ${m.barColor}`}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

function ResultsDisplay({ result, onReset }) {
  const { predicted_class, confidence, probabilities, inference_time_ms, is_unknown } = result;
  const isUnknown = is_unknown || predicted_class === 'unknown';
  const topMeta = FOOD_META[predicted_class] || FOOD_META.unknown;
  const badge = confidenceBadge(confidence);

  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 30);
    return () => clearTimeout(t);
  }, []);

  const sorted = Object.entries(probabilities).sort((a, b) => b[1] - a[1]);

  return (
    <div className={`mt-6 fv-results-card ${visible ? 'fv-results-card--visible' : ''}`}>

      {/* --- Hero prediction --- */}
      <div className={`fv-hero-band ${topMeta.lightBg} ${topMeta.border}`}>
        {/* Big emoji */}
        <div className="fv-hero-emoji">{topMeta.emoji}</div>

        {isUnknown ? (
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-800 mt-3">
              Hmm, not sure...
            </h2>
            <p className="text-base text-gray-500 mt-2 max-w-xs mx-auto">
              This doesn't look like pizza, steak, or sushi to our model.
            </p>
            <span className={`mt-3 inline-block fv-badge ${badge.cls}`}>
              Best guess: {(confidence * 100).toFixed(1)}% — below threshold
            </span>
          </div>
        ) : (
          <div className="text-center">
            <h2 className={`text-4xl font-extrabold capitalize mt-3 ${topMeta.textAccent}`}>
              {topMeta.label}
            </h2>
            <div className="flex items-center justify-center gap-3 mt-3 flex-wrap">
              <span className={`fv-badge ${badge.cls}`}>
                {badge.text} confidence
              </span>
              <span className={`text-2xl font-black tabular-nums ${topMeta.textAccent}`}>
                {(confidence * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        )}
      </div>

      {/* --- Confidence bars --- */}
      <div className="px-6 py-5">
        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">
          All Predictions
        </h3>
        <div className="space-y-5">
          {sorted.map(([cls, prob], idx) => (
            <ConfidenceBar
              key={cls}
              className={cls}
              prob={prob}
              meta={FOOD_META[cls]}
              isTop={idx === 0 && !isUnknown}
              animate={visible}
            />
          ))}
        </div>
      </div>

      {/* --- Footer row --- */}
      <div className="px-6 pb-6 pt-2 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-xs text-gray-400">
          Inference: <span className="font-semibold text-gray-600">{inference_time_ms.toFixed(0)} ms</span>
          &nbsp;&middot;&nbsp;Model: EfficientNetB2
        </p>
        {onReset && (
          <button
            onClick={onReset}
            className="fv-btn-primary text-sm"
          >
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Try Another Image
          </button>
        )}
      </div>
    </div>
  );
}

export default ResultsDisplay;
