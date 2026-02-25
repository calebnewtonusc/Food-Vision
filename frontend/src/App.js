import React, { useState } from 'react';
import ImageUploader from './components/ImageUploader';
import ResultsDisplay from './components/ResultsDisplay';
import DemoGallery from './components/DemoGallery';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

/* ------------------------------------------------------------------ */
/*  Stat card — Apple card style, all orange accent                    */
/* ------------------------------------------------------------------ */
function StatCard({ value, label, sublabel }) {
  return (
    <div className="fv-stat-card">
      <div className="fv-stat-value">{value}</div>
      <div className="fv-stat-label">{label}</div>
      {sublabel && (
        <div style={{ fontSize: 11, color: '#aeaeb2', marginTop: 3 }}>{sublabel}</div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Inline tech pill                                                    */
/* ------------------------------------------------------------------ */
function TechPill({ children }) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '2px 10px',
      background: 'rgba(255,149,0,0.10)',
      color: '#c47000',
      borderRadius: 980,
      fontSize: 12,
      fontWeight: 600,
      marginRight: 6,
      marginBottom: 6,
    }}>
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  App                                                                 */
/* ------------------------------------------------------------------ */
function App() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(null);
  const [disclaimerDismissed, setDisclaimerDismissed] = useState(false);

  const handleImageUpload = async (file) => {
    setLoading(true);
    setError(null);
    setResult(null);

    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_URL}/predict`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        let msg = 'Prediction failed. Please try again.';
        try {
          const err = await response.json();
          msg = err.detail || msg;
        } catch { /* ignore parse errors */ }
        throw new Error(msg);
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
    setPreview(null);
  };

  return (
    <div className="fv-app-bg">
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '0 16px 80px' }}>

        {/* ---- Disclaimer banner ---- */}
        {!disclaimerDismissed && (
          <div className="fv-disclaimer animate-fv-fadein" style={{ maxWidth: 900, margin: '20px auto 0' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <svg style={{ width: 16, height: 16, color: '#FF9500', flexShrink: 0, marginTop: 2 }}
                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#1c1c1e' }}>
                  Educational demo only.
                </span>
                <span style={{ fontSize: 13, color: '#8e8e93', marginLeft: 6 }}>
                  Trained on 3 categories (pizza, steak, sushi). Not for safety or medical decisions.
                </span>
              </div>
              <button
                onClick={() => setDisclaimerDismissed(true)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#8e8e93', padding: '0 2px', flexShrink: 0,
                  display: 'flex', alignItems: 'center',
                }}
                aria-label="Dismiss"
              >
                <svg style={{ width: 14, height: 14 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* ---- Hero ---- */}
        <div style={{ textAlign: 'center', padding: '56px 0 52px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, marginBottom: 16 }}>
            <img
              src="/foodvision-logo.png"
              alt="Food Vision Logo"
              style={{ width: 80, height: 80, objectFit: 'contain', filter: 'drop-shadow(0 4px 12px rgba(255,149,0,0.22))' }}
            />
            <div style={{ textAlign: 'left' }}>
              <h1 className="fv-hero-title" style={{ fontSize: 'clamp(2.75rem, 6vw, 4.25rem)', lineHeight: 1.0, margin: 0 }}>
                Food<span className="fv-hero-title-accent"> Vision</span>
              </h1>
              <p style={{ fontSize: 16, color: '#8e8e93', margin: '6px 0 0', fontWeight: 500, letterSpacing: -0.1 }}>
                AI-Powered Food Classifier
              </p>
            </div>
          </div>

          <p style={{
            fontSize: 16,
            color: '#3a3a3c',
            maxWidth: 480,
            margin: '0 auto',
            lineHeight: 1.55,
            letterSpacing: -0.1,
          }}>
            Drop any food photo and our EfficientNetB2 model classifies it in milliseconds
            — with{' '}
            <span style={{ color: '#FF9500', fontWeight: 700 }}>97.20% accuracy</span>.
          </p>
        </div>

        {/* ---- Try It / Examples ---- */}
        <div style={{ marginBottom: 72 }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 32,
            alignItems: 'start',
          }}>
            {/* Left: Uploader + Results */}
            <div>
              <div style={{ marginBottom: 12 }}>
                <span className="fv-section-label">Try It Now</span>
              </div>

              <ImageUploader
                onImageUpload={handleImageUpload}
                loading={loading}
                preview={preview}
                onReset={handleReset}
              />

              {/* API error state */}
              {error && !loading && (
                <div className="fv-error-card animate-fv-fadein" style={{ marginTop: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <svg style={{ width: 16, height: 16, color: '#FF3B30', flexShrink: 0, marginTop: 2 }}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 700, color: '#c0392b', margin: 0 }}>
                        Something went wrong
                      </p>
                      <p style={{ fontSize: 13, color: '#c0392b', margin: '3px 0 0', opacity: 0.85 }}>
                        {error}
                      </p>
                      <p style={{ fontSize: 11, color: '#c0392b', margin: '4px 0 0', opacity: 0.6 }}>
                        Make sure the API server is running, then try again.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleReset}
                    style={{
                      marginTop: 10, fontSize: 12, fontWeight: 600,
                      color: '#FF3B30', background: 'none', border: 'none',
                      cursor: 'pointer', textDecoration: 'underline', padding: 0,
                    }}
                  >
                    Clear and try again
                  </button>
                </div>
              )}

              {/* Results */}
              {result && !loading && (
                <ResultsDisplay result={result} onReset={handleReset} />
              )}
            </div>

            {/* Right: Demo gallery */}
            <div>
              <div style={{ marginBottom: 8 }}>
                <span className="fv-section-label">Quick Examples</span>
              </div>
              <p style={{ fontSize: 13, color: '#8e8e93', marginBottom: 16, marginTop: 4 }}>
                No image handy? Click a card to classify a sample photo.
              </p>
              <DemoGallery onSelectDemo={handleImageUpload} />
            </div>
          </div>
        </div>

        {/* ---- Performance Stats ---- */}
        <div style={{ marginBottom: 72 }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <span className="fv-section-label">Model Performance</span>
            <p style={{ fontSize: 14, color: '#8e8e93', marginTop: 6, maxWidth: 480, marginLeft: 'auto', marginRight: 'auto' }}>
              Evaluated on 750 held-out test images using progressive fine-tuning and
              discriminative learning rates.
            </p>
          </div>

          {/* Stat cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: 12,
            maxWidth: 700,
            margin: '0 auto 48px',
          }}>
            <StatCard value="97.20%" label="Accuracy" sublabel="Top-1" />
            <StatCard value="100%" label="Top-3" sublabel="All classes" />
            <StatCard value="0.972" label="F1 Score" sublabel="Weighted avg" />
            <StatCard value="0.015" label="ECE" sublabel="Calibration error" />
          </div>

          {/* Visualizations */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 16,
            maxWidth: 860,
            margin: '0 auto',
          }}>
            <div className="fv-viz-card">
              <h3 style={{
                fontSize: 14, fontWeight: 700, color: '#1c1c1e',
                marginBottom: 16, textAlign: 'center', letterSpacing: -0.2,
              }}>
                Confusion Matrix
              </h3>
              <img
                src="/confusion_matrix.png"
                alt="Confusion Matrix"
                style={{ width: '100%', height: 'auto', borderRadius: 12 }}
              />
              <p style={{ fontSize: 11, color: '#aeaeb2', marginTop: 10, textAlign: 'center' }}>
                Predictions vs. true labels across all 3 classes
              </p>
            </div>
            <div className="fv-viz-card">
              <h3 style={{
                fontSize: 14, fontWeight: 700, color: '#1c1c1e',
                marginBottom: 16, textAlign: 'center', letterSpacing: -0.2,
              }}>
                Calibration Analysis
              </h3>
              <img
                src="/reliability_diagram.png"
                alt="Reliability Diagram"
                style={{ width: '100%', height: 'auto', borderRadius: 12 }}
              />
              <p style={{ fontSize: 11, color: '#aeaeb2', marginTop: 10, textAlign: 'center' }}>
                Well-calibrated model — ECE of 0.0147
              </p>
            </div>
          </div>
        </div>

        {/* ---- Technical Details ---- */}
        <div style={{ maxWidth: 720, margin: '0 auto 72px' }}>
          <div className="fv-tech-card">
            <h2 style={{
              fontSize: 18, fontWeight: 800, color: '#1c1c1e',
              marginBottom: 20, textAlign: 'center', letterSpacing: -0.4,
            }}>
              Technical Details
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24 }}>
              <div>
                <h3 style={{
                  fontSize: 12, fontWeight: 700, color: '#8e8e93',
                  textTransform: 'uppercase', letterSpacing: 0.5,
                  marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#FF9500', display: 'inline-block' }} />
                  Architecture
                </h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {[
                    'EfficientNetB2 backbone',
                    'ImageNet pre-trained',
                    'Progressive fine-tuning',
                    'Discriminative learning rates',
                    '3-class classifier head',
                  ].map((item) => (
                    <li key={item} style={{
                      fontSize: 13, color: '#3a3a3c', paddingBottom: 6,
                      display: 'flex', alignItems: 'baseline', gap: 7,
                    }}>
                      <span style={{ color: '#FF9500', fontSize: 10, flexShrink: 0 }}>&#9679;</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 style={{
                  fontSize: 12, fontWeight: 700, color: '#8e8e93',
                  textTransform: 'uppercase', letterSpacing: 0.5,
                  marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#FF9500', display: 'inline-block' }} />
                  Training Details
                </h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {[
                    '750 train images per class',
                    '250 test images per class',
                    'Enhanced data augmentation',
                    '70% confidence threshold',
                    'PyTorch + torchvision',
                  ].map((item) => (
                    <li key={item} style={{
                      fontSize: 13, color: '#3a3a3c', paddingBottom: 6,
                      display: 'flex', alignItems: 'baseline', gap: 7,
                    }}>
                      <span style={{ color: '#FF9500', fontSize: 10, flexShrink: 0 }}>&#9679;</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div style={{ marginTop: 20, borderTop: '1px solid rgba(60,60,67,0.12)', paddingTop: 16 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                {['PyTorch', 'EfficientNetB2', 'FastAPI', 'React', 'Vercel'].map((t) => (
                  <TechPill key={t}>{t}</TechPill>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ---- Footer ---- */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: 16 }}>
          <a
            href="https://calebnewton.me"
            target="_blank"
            rel="noopener noreferrer"
            className="fv-footer-link"
          >
            <img
              src="/caleb-usc.jpg"
              alt="Caleb Newton at USC"
              style={{
                width: 36, height: 36, borderRadius: '50%',
                objectFit: 'cover', objectPosition: 'center 30%',
                border: '2px solid rgba(255,149,0,0.3)',
              }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 1 }}>
              <span style={{ fontSize: 10, color: '#aeaeb2', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
                Built by
              </span>
              <span style={{ fontSize: 14, color: '#1c1c1e', fontWeight: 700, letterSpacing: -0.2 }}>
                Caleb Newton
              </span>
            </div>
          </a>
        </div>

      </main>
    </div>
  );
}

export default App;
