import React, { useEffect, useState } from 'react';

/* ------------------------------------------------------------------ */
/*  Food metadata                                                        */
/* ------------------------------------------------------------------ */
const FOOD_META = {
  pizza:   { label: 'Pizza',   icon: '🍕' },
  steak:   { label: 'Steak',   icon: '🥩' },
  sushi:   { label: 'Sushi',   icon: '🍣' },
  unknown: { label: 'Unknown', icon: '?' },
};

/* ------------------------------------------------------------------ */
/*  Confidence badge helper                                              */
/* ------------------------------------------------------------------ */
function getConfidenceBadge(conf) {
  if (conf > 0.90) return { text: 'Very High Confidence', cls: 'fv-badge--very-high' };
  if (conf > 0.70) return { text: 'High Confidence',      cls: 'fv-badge--high' };
  if (conf > 0.50) return { text: 'Moderate Confidence',  cls: 'fv-badge--moderate' };
  return               { text: 'Low Confidence',          cls: 'fv-badge--low' };
}

/* ------------------------------------------------------------------ */
/*  ConfidenceBar                                                        */
/* ------------------------------------------------------------------ */
function ConfidenceBar({ className, prob, isTop, animate }) {
  const [barWidth, setBarWidth] = useState(0);
  const meta = FOOD_META[className] || FOOD_META.unknown;
  const isUnknown = className === 'unknown';
  const pct = (prob * 100).toFixed(1);

  useEffect(() => {
    if (animate) {
      const t = setTimeout(() => setBarWidth(prob * 100), 80);
      return () => clearTimeout(t);
    }
  }, [animate, prob]);

  return (
    <div className={`fv-bar-row${isTop ? ' fv-bar-row--top' : ''}`}>
      {/* Name + percentage row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 17, lineHeight: 1 }}>{meta.icon}</span>
          <span style={{
            fontSize: 15,
            fontWeight: isTop ? 600 : 400,
            color: isTop ? '#1c1c1e' : '#8e8e93',
            textTransform: 'capitalize',
          }}>
            {meta.label || className}
          </span>
          {isTop && !isUnknown && (
            <span style={{
              display: 'inline-block',
              padding: '1px 8px',
              background: '#FF9500',
              color: 'white',
              borderRadius: 980,
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}>
              Top
            </span>
          )}
        </div>
        <span style={{
          fontSize: 15,
          fontWeight: 700,
          fontVariantNumeric: 'tabular-nums',
          color: isTop && !isUnknown ? '#FF9500' : '#aeaeb2',
        }}>
          {pct}%
        </span>
      </div>

      {/* Bar */}
      <div className="fv-bar-track">
        <div
          className={`fv-bar-fill${isUnknown ? ' fv-bar-fill--muted' : ''}`}
          style={{ width: `${barWidth}%` }}
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  ResultsDisplay                                                       */
/* ------------------------------------------------------------------ */
function ResultsDisplay({ result, onReset }) {
  const { predicted_class, confidence, probabilities, inference_time_ms, is_unknown } = result;
  const isUnknown = is_unknown || predicted_class === 'unknown';
  const topMeta = FOOD_META[predicted_class] || FOOD_META.unknown;
  const badge = getConfidenceBadge(confidence);

  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 30);
    return () => clearTimeout(t);
  }, []);

  const sorted = Object.entries(probabilities).sort((a, b) => b[1] - a[1]);

  return (
    <div
      className={`fv-results-card${visible ? ' fv-results-card--visible' : ''}`}
      style={{ marginTop: 16 }}
    >

      {/* ---- Hero band ---- */}
      <div
        className="fv-results-hero-band"
        style={{
          background: isUnknown
            ? 'rgba(142,142,147,0.05)'
            : 'rgba(255,149,0,0.06)',
        }}
      >
        {isUnknown ? (
          <div>
            <p style={{
              fontSize: 12, fontWeight: 600, letterSpacing: 1,
              textTransform: 'uppercase', color: '#8e8e93',
              margin: '0 0 10px',
            }}>
              Result
            </p>
            <h2 style={{
              fontSize: 28, fontWeight: 800, color: '#3a3a3c',
              letterSpacing: -0.5, margin: '0 0 8px',
            }}>
              Not quite sure...
            </h2>
            <p style={{ fontSize: 14, color: '#8e8e93', margin: '0 0 12px', lineHeight: 1.5 }}>
              This doesn't look like pizza, steak, or sushi to our model.
            </p>
            <span className={`fv-badge ${badge.cls}`}>
              Best guess: {(confidence * 100).toFixed(1)}% &mdash; below threshold
            </span>
          </div>
        ) : (
          <div>
            {/* Eyebrow */}
            <p style={{
              fontSize: 12, fontWeight: 600, letterSpacing: 1,
              textTransform: 'uppercase', color: '#8e8e93',
              margin: '0 0 10px',
            }}>
              Identified as
            </p>
            {/* Food name + icon */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <span style={{ fontSize: 36, lineHeight: 1 }}>{topMeta.icon}</span>
              <h2 style={{
                fontSize: 28,
                fontWeight: 800,
                color: '#1c1c1e',
                letterSpacing: -0.5,
                margin: 0,
                textTransform: 'capitalize',
              }}>
                {topMeta.label}
              </h2>
            </div>
            {/* Confidence row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span className={`fv-badge ${badge.cls}`}>{badge.text}</span>
              <span style={{
                fontSize: 22,
                fontWeight: 900,
                color: '#FF9500',
                fontVariantNumeric: 'tabular-nums',
                letterSpacing: -0.5,
              }}>
                {(confidence * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ---- Confidence bars ---- */}
      <div style={{ padding: '20px 28px 8px' }}>
        <p style={{
          fontSize: 12, fontWeight: 600, color: '#8e8e93',
          textTransform: 'uppercase', letterSpacing: 1,
          margin: '0 0 4px',
        }}>
          All Predictions
        </p>

        <div style={{ marginTop: 4 }}>
          {sorted.map(([cls, prob], idx) => (
            <ConfidenceBar
              key={cls}
              className={cls}
              prob={prob}
              isTop={idx === 0 && !isUnknown}
              animate={visible}
            />
          ))}
        </div>
      </div>

      {/* ---- Footer ---- */}
      <div style={{
        padding: '14px 28px 20px',
        borderTop: '1px solid rgba(60,60,67,0.10)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
      }}>
        <p style={{ fontSize: 12, color: '#aeaeb2', margin: 0 }}>
          Inference:{' '}
          <span style={{ fontWeight: 600, color: '#8e8e93' }}>
            {inference_time_ms.toFixed(0)} ms
          </span>
          {' '}&middot;{' '}EfficientNetB2
        </p>

        {onReset && (
          <button onClick={onReset} className="fv-btn-ghost">
            <svg style={{ width: 14, height: 14, marginRight: 6 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Try Another
          </button>
        )}
      </div>
    </div>
  );
}

export default ResultsDisplay;
