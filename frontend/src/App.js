import React, { useState } from 'react';
import ImageUploader from './components/ImageUploader';
import ResultsDisplay from './components/ResultsDisplay';
import DemoGallery from './components/DemoGallery';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

/* Stat card for the performance section */
function StatCard({ value, label, color }) {
  return (
    <div className="fv-stat-card">
      <div className={`text-4xl md:text-5xl font-extrabold ${color} mb-1 tabular-nums`}>
        {value}
      </div>
      <div className="text-xs text-gray-500 font-semibold uppercase tracking-widest">
        {label}
      </div>
    </div>
  );
}

function App() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleImageUpload = async (file) => {
    setLoading(true);
    setError(null);
    setResult(null);

    // Show preview immediately
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
    <div className="fv-app-bg min-h-screen">
      <main className="container mx-auto px-4 py-8 max-w-6xl">

        {/* ---- Disclaimer banner ---- */}
        <div className="fv-disclaimer mb-8 max-w-5xl mx-auto">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="text-sm font-bold text-amber-900">Educational Demo Only — Not for Safety or Medical Decisions</p>
              <p className="text-xs text-amber-800 mt-0.5">
                Trained on 3 categories (pizza, steak, sushi). Cannot detect spoilage, allergens, or nutritional content.
                Model accuracy may vary on out-of-distribution images.
              </p>
            </div>
          </div>
        </div>

        {/* ---- Hero ---- */}
        <div className="text-center mb-14 pt-2">
          <div className="flex items-center justify-center gap-5 mb-4">
            <img
              src="/foodvision-logo.png"
              alt="Food Vision Logo"
              className="w-24 h-24 md:w-32 md:h-32 drop-shadow-lg"
            />
            <div className="text-left">
              <h1 className="text-5xl md:text-6xl font-extrabold fv-hero-title leading-none">
                Food Vision
              </h1>
              <p className="text-base md:text-lg text-warm-600 mt-1 font-medium tracking-wide">
                AI-Powered Food Classifier
              </p>
            </div>
          </div>
          <p className="text-gray-500 text-base max-w-xl mx-auto mt-2">
            Drop any food photo and our EfficientNetB2 model identifies it in milliseconds with&nbsp;
            <span className="font-bold text-orange-600">97.20% accuracy</span>.
          </p>
        </div>

        {/* ---- Try It / Examples ---- */}
        <div className="mb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-start">

            {/* Left: Uploader + Results */}
            <div>
              <h2 className="fv-section-label mb-5">Try It Now</h2>

              <ImageUploader
                onImageUpload={handleImageUpload}
                loading={loading}
                preview={preview}
                onReset={handleReset}
              />

              {/* API error state */}
              {error && !loading && (
                <div className="mt-4 fv-error-card animate-fv-fadein">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-sm font-bold text-red-800">Something went wrong</p>
                      <p className="text-sm text-red-700 mt-0.5">{error}</p>
                      <p className="text-xs text-red-500 mt-1">
                        Make sure the API server is running, then try again.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleReset}
                    className="mt-3 text-xs font-semibold text-red-600 hover:text-red-800 underline underline-offset-2"
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
              <h2 className="fv-section-label mb-2">Quick Examples</h2>
              <p className="text-sm text-gray-500 mb-5">
                No image handy? Click a card to classify a sample photo.
              </p>
              <DemoGallery onSelectDemo={handleImageUpload} />
            </div>
          </div>
        </div>

        {/* ---- Performance ---- */}
        <div className="mb-20">
          <h2 className="fv-section-label text-center mb-2">Model Performance</h2>
          <p className="text-center text-sm text-gray-500 mb-10 max-w-2xl mx-auto">
            Evaluated on 750 held-out test images using progressive fine-tuning and
            discriminative learning rates.
          </p>

          {/* Stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-12">
            <StatCard value="97.20%" label="Accuracy" color="text-orange-600" />
            <StatCard value="100%" label="Top-3" color="text-emerald-600" />
            <StatCard value="0.972" label="F1 Score" color="text-rose-600" />
            <StatCard value="0.015" label="ECE" color="text-violet-600" />
          </div>

          {/* Visualizations */}
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            <div className="fv-viz-card">
              <h3 className="text-base font-bold text-gray-800 mb-4 text-center">
                Confusion Matrix
              </h3>
              <img
                src="/confusion_matrix.png"
                alt="Confusion Matrix"
                className="w-full h-auto rounded-xl"
              />
              <p className="text-xs text-gray-400 mt-3 text-center">
                Predictions vs. true labels across all 3 classes
              </p>
            </div>
            <div className="fv-viz-card">
              <h3 className="text-base font-bold text-gray-800 mb-4 text-center">
                Calibration Analysis
              </h3>
              <img
                src="/reliability_diagram.png"
                alt="Reliability Diagram"
                className="w-full h-auto rounded-xl"
              />
              <p className="text-xs text-gray-400 mt-3 text-center">
                Well-calibrated — ECE of 0.0147
              </p>
            </div>
          </div>
        </div>

        {/* ---- Technical Details ---- */}
        <div className="max-w-3xl mx-auto mb-20">
          <div className="fv-tech-card">
            <h2 className="text-xl font-extrabold text-gray-900 mb-5 text-center">
              Technical Details
            </h2>
            <div className="grid sm:grid-cols-2 gap-6 text-sm text-gray-700">
              <div>
                <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-orange-500 inline-block" />
                  Architecture
                </h3>
                <ul className="space-y-1 text-gray-600">
                  <li>EfficientNetB2 backbone (ImageNet pre-trained)</li>
                  <li>Progressive fine-tuning strategy</li>
                  <li>Discriminative learning rates</li>
                  <li>3-class classifier head</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
                  Training Details
                </h3>
                <ul className="space-y-1 text-gray-600">
                  <li>750 train images per class</li>
                  <li>250 test images per class</li>
                  <li>Enhanced data augmentation</li>
                  <li>70% confidence threshold</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* ---- Footer ---- */}
        <div className="flex flex-col items-center pb-10">
          <a
            href="https://calebnewton.me"
            target="_blank"
            rel="noopener noreferrer"
            className="fv-footer-link"
          >
            <img
              src="/caleb-usc.jpg"
              alt="Caleb Newton at USC"
              className="w-11 h-11 rounded-full object-cover border-2 border-orange-300 shadow"
              style={{ objectPosition: 'center 30%' }}
            />
            <div className="flex flex-col items-start gap-0.5">
              <span className="text-xs text-gray-400 uppercase tracking-widest font-semibold">
                Built by
              </span>
              <span className="text-sm text-gray-800 font-bold">
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
