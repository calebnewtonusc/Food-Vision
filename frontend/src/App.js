import React, { useState } from 'react';
import ImageUploader from './components/ImageUploader';
import ResultsDisplay from './components/ResultsDisplay';
import DemoGallery from './components/DemoGallery';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

/* ------------------------------------------------------------------ */
/*  StatCard                                                            */
/* ------------------------------------------------------------------ */
function StatCard({ value, label, sublabel }) {
  return (
    <div className="fv-stat-card">
      <div className="fv-stat-value">{value}</div>
      <div className="fv-stat-label">{label}</div>
      {sublabel && <div className="fv-stat-sublabel">{sublabel}</div>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  TechPill                                                            */
/* ------------------------------------------------------------------ */
function TechPill({ children }) {
  return <span className="fv-tech-pill">{children}</span>;
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
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '0 20px 100px' }}>

        {/* ---- Disclaimer Banner ---- */}
        {!disclaimerDismissed && (
          <div
            className="fv-disclaimer"
            style={{ maxWidth: 860, margin: '24px auto 0' }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <svg
                style={{ width: 15, height: 15, color: '#FF9500', flexShrink: 0, marginTop: 1 }}
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
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
                aria-label="Dismiss disclaimer"
              >
                <svg style={{ width: 14, height: 14 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* ================================================================
            HERO SECTION
        ================================================================ */}
        <div style={{
          textAlign: 'center',
          padding: '80px 0 64px',
          maxWidth: 700,
          margin: '0 auto',
        }}>
          {/* Eyebrow */}
          <p className="fv-hero-eyebrow animate-in delay-1">
            Computer Vision &middot; PyTorch &middot; EfficientNetB2
          </p>

          {/* Title */}
          <h1 className="fv-hero-title animate-in delay-2" style={{ margin: '16px 0' }}>
            Food<span className="fv-hero-accent">Vision</span>
          </h1>

          {/* Subtitle */}
          <p className="fv-hero-sub animate-in delay-3" style={{ margin: '20px auto' }}>
            Upload a photo of any food. Get identified in under a second with 97.2% accuracy.
          </p>

          {/* Accuracy badge */}
          <div className="animate-in delay-4" style={{ marginTop: 20 }}>
            <span className="fv-accuracy-badge">
              <svg style={{ width: 12, height: 12 }} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              97.20% Accurate &middot; EfficientNetB2
            </span>
          </div>
        </div>

        {/* ================================================================
            UPLOAD + RESULTS / DEMO SECTION
        ================================================================ */}
        <div style={{ marginBottom: 80 }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 28,
            alignItems: 'start',
          }}>

            {/* Left column: Uploader + error + results */}
            <div>
              <span className="fv-section-eyebrow">Try It Now</span>

              <ImageUploader
                onImageUpload={handleImageUpload}
                loading={loading}
                preview={preview}
                onReset={handleReset}
              />

              {/* API error state */}
              {error && !loading && (
                <div className="fv-error-card" style={{ marginTop: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <svg
                      style={{ width: 15, height: 15, color: '#FF3B30', flexShrink: 0, marginTop: 1 }}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div style={{ flex: 1 }}>
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

            {/* Right column: Demo gallery */}
            <div>
              <span className="fv-section-eyebrow">Quick Examples</span>
              <p style={{ fontSize: 13, color: '#8e8e93', marginBottom: 14, marginTop: 4 }}>
                No image handy? Click a sample to classify it instantly.
              </p>
              <DemoGallery onSelectDemo={handleImageUpload} />
            </div>

          </div>
        </div>

        {/* ================================================================
            PERFORMANCE STATS SECTION
        ================================================================ */}
        <div style={{ marginBottom: 80 }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <span className="fv-section-eyebrow">Model Performance</span>
            <h2 className="fv-section-title">Built on Real Accuracy</h2>
            <p style={{
              fontSize: 15,
              color: '#8e8e93',
              maxWidth: 480,
              margin: '0 auto',
              lineHeight: 1.55,
            }}>
              Evaluated on 750 held-out test images using progressive fine-tuning
              and discriminative learning rates.
            </p>
          </div>

          {/* Stat cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: 14,
            maxWidth: 720,
            margin: '0 auto 52px',
          }}>
            <StatCard value="97.20%" label="Accuracy" sublabel="Top-1 Recognition" />
            <StatCard value="100%"   label="Top-3 Accuracy" sublabel="Always in top 3" />
            <StatCard value="0.972"  label="F1 Score" sublabel="Near-perfect balance" />
            <StatCard value="0.015"  label="ECE" sublabel="Calibration error" />
          </div>

          {/* Visualizations */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 16,
            maxWidth: 880,
            margin: '0 auto',
          }}>
            <div className="fv-viz-card">
              <h3 style={{
                fontSize: 15, fontWeight: 700, color: '#1c1c1e',
                marginBottom: 16, textAlign: 'center', letterSpacing: -0.3,
              }}>
                Confusion Matrix
              </h3>
              <img
                src="/confusion_matrix.png"
                alt="Confusion Matrix"
                style={{ width: '100%', height: 'auto', borderRadius: 12, display: 'block' }}
              />
              <p style={{ fontSize: 11, color: '#aeaeb2', marginTop: 10, textAlign: 'center', margin: '10px 0 0' }}>
                Predictions vs. true labels across all 3 classes
              </p>
            </div>
            <div className="fv-viz-card">
              <h3 style={{
                fontSize: 15, fontWeight: 700, color: '#1c1c1e',
                marginBottom: 16, textAlign: 'center', letterSpacing: -0.3,
              }}>
                Calibration Analysis
              </h3>
              <img
                src="/reliability_diagram.png"
                alt="Reliability Diagram"
                style={{ width: '100%', height: 'auto', borderRadius: 12, display: 'block' }}
              />
              <p style={{ fontSize: 11, color: '#aeaeb2', marginTop: 10, textAlign: 'center', margin: '10px 0 0' }}>
                Well-calibrated model &mdash; ECE of 0.0147
              </p>
            </div>
          </div>
        </div>

        {/* ================================================================
            TECHNICAL DETAILS SECTION
        ================================================================ */}
        <div style={{ maxWidth: 800, margin: '0 auto 80px' }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <span className="fv-section-eyebrow">Under the Hood</span>
            <h2 className="fv-section-title">Technical Details</h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 16,
          }}>
            {/* Architecture card */}
            <div className="fv-tech-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: 'rgba(255,149,0,0.10)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg style={{ width: 17, height: 17, color: '#FF9500' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                      d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: '#1c1c1e', margin: 0 }}>
                  Architecture
                </h3>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  'EfficientNetB2 backbone',
                  'ImageNet pre-trained weights',
                  'Progressive fine-tuning strategy',
                  'Discriminative learning rates',
                  '3-class classifier head',
                ].map((item) => (
                  <li key={item} style={{
                    fontSize: 14, color: '#3a3a3c',
                    display: 'flex', alignItems: 'baseline', gap: 8,
                  }}>
                    <span style={{
                      width: 5, height: 5, borderRadius: '50%',
                      background: '#FF9500', flexShrink: 0,
                      display: 'inline-block', marginTop: 5,
                    }} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Training card */}
            <div className="fv-tech-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: 'rgba(255,149,0,0.10)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg style={{ width: 17, height: 17, color: '#FF9500' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                      d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"
                    />
                  </svg>
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: '#1c1c1e', margin: 0 }}>
                  Training
                </h3>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  '750 train images per class',
                  '250 held-out test images per class',
                  'Enhanced data augmentation',
                  '70% confidence threshold',
                  'PyTorch + torchvision',
                ].map((item) => (
                  <li key={item} style={{
                    fontSize: 14, color: '#3a3a3c',
                    display: 'flex', alignItems: 'baseline', gap: 8,
                  }}>
                    <span style={{
                      width: 5, height: 5, borderRadius: '50%',
                      background: '#FF9500', flexShrink: 0,
                      display: 'inline-block', marginTop: 5,
                    }} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Tech stack pills */}
          <div style={{
            marginTop: 16,
            background: '#ffffff',
            borderRadius: 16,
            border: '0.5px solid rgba(60,60,67,0.10)',
            boxShadow: '0 2px 16px rgba(0,0,0,0.08)',
            padding: '20px 24px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            flexWrap: 'wrap',
          }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#8e8e93', marginRight: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Stack
            </span>
            {['PyTorch', 'EfficientNetB2', 'FastAPI', 'React', 'Vercel', 'Python'].map((t) => (
              <TechPill key={t}>{t}</TechPill>
            ))}
          </div>
        </div>

        {/* ================================================================
            FOOTER
        ================================================================ */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 12,
          paddingBottom: 16,
        }}>
          <a
            href="https://calebnewton.me"
            target="_blank"
            rel="noopener noreferrer"
            className="fv-footer-link"
          >
            <img
              src="/caleb-usc.jpg"
              alt="Caleb Newton"
              style={{
                width: 34, height: 34, borderRadius: '50%',
                objectFit: 'cover', objectPosition: 'center 30%',
                border: '2px solid rgba(255,149,0,0.28)',
              }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <span style={{
                fontSize: 10, color: '#aeaeb2',
                textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600,
              }}>
                Built by
              </span>
              <span style={{ fontSize: 14, color: '#1c1c1e', fontWeight: 700, letterSpacing: -0.2 }}>
                Caleb Newton
              </span>
            </div>
          </a>
          <p style={{ fontSize: 11, color: '#aeaeb2', margin: 0, letterSpacing: 0.1 }}>
            &copy; 2025 FoodVision &middot; EfficientNetB2 &middot; PyTorch
          </p>
        </div>

      </main>
    </div>
  );
}

export default App;
