import React, { useEffect, useState } from 'react';

/* Food metadata — clean iOS style, unified orange bars */
const FOOD_META = {
  pizza: {
    emoji: '🍕',
    label: 'Pizza',
  },
  steak: {
    emoji: '🥩',
    label: 'Steak',
  },
  sushi: {
    emoji: '🍣',
    label: 'Sushi',
  },
  unknown: {
    emoji: '?',
    label: 'Unknown',
  },
};

/* Confidence badge */
function confidenceBadge(conf) {
  if (conf > 0.9) return { text: 'Very High Confidence', cls: 'fv-badge--high' };
  if (conf > 0.7) return { text: 'High Confidence',      cls: 'fv-badge--med' };
  if (conf > 0.5) return { text: 'Moderate Confidence',  cls: 'fv-badge--low' };
  return           { text: 'Low Confidence',             cls: 'fv-badge--very-low' };
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
  const isUnknown = className === 'unknown';

  return (
    <div className={`fv-bar-row ${isTop ? 'fv-bar-row--top' : ''}`}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18, lineHeight: 1 }}>{m.emoji}</span>
          <span style={{
            fontSize: 14,
            fontWeight: isTop ? 700 : 500,
            color: isTop ? '#1c1c1e' : '#8e8e93',
            textTransform: 'capitalize',
          }}>
            {m.label || className}
          </span>
          {isTop && !isUnknown && (
            <span className="fv-tag">Top</span>
          )}
        </div>
        <span style={{
          fontSize: 14,
          fontWeight: 700,
          fontVariantNumeric: 'tabular-nums',
          color: isTop && !isUnknown ? '#FF9500' : '#8e8e93',
        }}>
          {pct}%
        </span>
      </div>
      <div className="fv-bar-track">
        <div
          className={`fv-bar-fill ${isUnknown ? 'fv-bar--unknown' : 'fv-bar--pizza'}`}
          style={{ width: `${width}%`, height: '100%' }}
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
    <div className={`fv-results-card ${visible ? 'fv-results-card--visible' : ''}`} style={{ marginTop: 16 }}>

      {/* --- Hero prediction band --- */}
      <div className="fv-hero-band" style={{
        background: isUnknown
          ? 'rgba(142,142,147,0.06)'
          : 'rgba(255,149,0,0.06)',
      }}>
        <div className="fv-hero-emoji">{topMeta.emoji}</div>

        {isUnknown ? (
          <div style={{ textAlign: 'center', marginTop: 12 }}>
            <h2 style={{
              fontSize: 26, fontWeight: 800, color: '#3a3a3c',
              letterSpacing: -0.5, margin: 0,
            }}>
              Not quite sure...
            </h2>
            <p style={{ fontSize: 14, color: '#8e8e93', marginTop: 6, maxWidth: 260, marginLeft: 'auto', marginRight: 'auto' }}>
              This doesn't look like pizza, steak, or sushi to our model.
            </p>
            <div style={{ marginTop: 10 }}>
              <span className={`fv-badge ${badge.cls}`}>
                Best guess: {(confidence * 100).toFixed(1)}% — below threshold
              </span>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', marginTop: 12 }}>
            <h2 style={{
              fontSize: 32, fontWeight: 900, color: '#FF9500',
              letterSpacing: -0.5, margin: 0, textTransform: 'capitalize',
            }}>
              {topMeta.label}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 10, flexWrap: 'wrap' }}>
              <span className={`fv-badge ${badge.cls}`}>{badge.text}</span>
              <span style={{
                fontSize: 24, fontWeight: 900,
                color: '#FF9500', fontVariantNumeric: 'tabular-nums',
              }}>
                {(confidence * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        )}
      </div>

      {/* --- Confidence bars --- */}
      <div style={{ padding: '20px 20px 4px' }}>
        <p style={{
          fontSize: 11, fontWeight: 600, color: '#8e8e93',
          textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 14,
        }}>
          All Predictions
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
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
      <div style={{
        padding: '14px 20px 20px',
        borderTop: '1px solid rgba(60,60,67,0.12)',
        marginTop: 12,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        flexWrap: 'wrap',
      }}>
        <p style={{ fontSize: 12, color: '#aeaeb2', margin: 0 }}>
          Inference:{' '}
          <span style={{ fontWeight: 600, color: '#8e8e93' }}>
            {inference_time_ms.toFixed(0)} ms
          </span>
          {' '}&middot;{' '}EfficientNetB2
        </p>
        {onReset && (
          <button onClick={onReset} className="fv-btn-primary" style={{ fontSize: 13 }}>
            <svg style={{ width: 14, height: 14, marginRight: 6 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
