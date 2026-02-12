import React, { useState } from 'react';
import ImageUploader from './components/ImageUploader';
import ResultsDisplay from './components/ResultsDisplay';
import DemoGallery from './components/DemoGallery';

// API endpoint - change this after deployment
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function App() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleImageUpload = async (file) => {
    setLoading(true);
    setError(null);
    setResult(null);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_URL}/predict`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Prediction failed');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
      console.error('Prediction error:', err);
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Safety Disclaimer */}
        <div className="mb-8 p-6 bg-yellow-50 border-l-4 border-yellow-500 rounded-r-lg shadow-md max-w-5xl mx-auto">
          <div className="flex items-start">
            <svg className="w-8 h-8 text-yellow-600 mr-4 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <h3 className="text-lg font-bold text-yellow-900 mb-2">Educational Demo Only - Not for Safety or Medical Decisions</h3>
              <p className="text-sm text-yellow-800 mb-2">
                <strong>This is a demonstration project for educational purposes only.</strong> The model is trained on only 3 food categories (pizza, steak, sushi) and has significant limitations:
              </p>
              <ul className="text-sm text-yellow-800 space-y-1 ml-4 list-disc">
                <li><strong>DO NOT use for food safety decisions</strong> - The model cannot detect spoilage, contamination, or safety issues</li>
                <li><strong>DO NOT use for dietary or medical decisions</strong> - The model cannot identify ingredients, allergens, or nutritional content</li>
                <li><strong>Limited accuracy</strong> - The model can be wrong and may misclassify images outside its training domain</li>
                <li><strong>No real-world validation</strong> - This model has not been validated for production use cases</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-16 py-8">
          <div className="flex items-center justify-center gap-6 mb-6">
            <img
              src="/foodvision-logo.png"
              alt="Food Vision Logo"
              className="w-32 h-32 md:w-40 md:h-40"
            />
            <div className="text-left">
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-2">
                Food Vision
              </h1>
              <p className="text-xl text-gray-600">
                AI-Powered Food Classifier
              </p>
            </div>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Upload an image and let our EfficientNetB2 model identify pizza, steak, or sushi with 97.20% accuracy
          </p>
        </div>

        {/* Try It Now & Examples Section */}
        <div className="mb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Try It Now - Left Side */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Try It Now</h2>
              <ImageUploader
                onImageUpload={handleImageUpload}
                loading={loading}
                preview={preview}
                onReset={handleReset}
              />

              {error && (
                <div className="mt-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
                  <div className="flex items-center">
                    <svg className="w-6 h-6 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-red-800 font-medium">{error}</p>
                  </div>
                </div>
              )}

              {result && <ResultsDisplay result={result} />}
            </div>

            {/* Quick Examples - Right Side */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Quick Examples</h2>
              <p className="text-gray-600 mb-8">Click any image to see it classified</p>
              <DemoGallery onSelectDemo={handleImageUpload} />
            </div>
          </div>
        </div>

        {/* Performance Section */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">Model Performance</h2>
          <p className="text-center text-gray-600 mb-10 max-w-3xl mx-auto">
            Trained with progressive fine-tuning on EfficientNetB2 using discriminative learning rates.
            Evaluated on 750 test images with comprehensive metrics.
          </p>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto mb-10">
            <div className="bg-white rounded-xl shadow-lg p-6 text-center border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="text-5xl font-bold text-blue-600 mb-2">97.20%</div>
              <div className="text-sm text-gray-600 font-medium uppercase tracking-wide">Accuracy</div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 text-center border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="text-5xl font-bold text-green-600 mb-2">100%</div>
              <div className="text-sm text-gray-600 font-medium uppercase tracking-wide">Top-3</div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 text-center border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="text-5xl font-bold text-purple-600 mb-2">0.972</div>
              <div className="text-sm text-gray-600 font-medium uppercase tracking-wide">F1 Score</div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 text-center border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="text-5xl font-bold text-orange-600 mb-2">0.015</div>
              <div className="text-sm text-gray-600 font-medium uppercase tracking-wide">ECE</div>
            </div>
          </div>

          {/* Evaluation Visualizations */}
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Confusion Matrix</h3>
              <img
                src="/confusion_matrix.png"
                alt="Confusion Matrix"
                className="w-full h-auto rounded-lg"
              />
              <p className="text-sm text-gray-600 mt-4 text-center">
                Model predictions vs. true labels across all 3 classes
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Calibration Analysis</h3>
              <img
                src="/reliability_diagram.png"
                alt="Reliability Diagram"
                className="w-full h-auto rounded-lg"
              />
              <p className="text-sm text-gray-600 mt-4 text-center">
                Well-calibrated model with ECE of 0.0147
              </p>
            </div>
          </div>
        </div>

        {/* Technical Details */}
        <div className="max-w-4xl mx-auto mb-20">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl shadow-lg p-8 border border-blue-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">Technical Details</h2>
            <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-700">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Architecture</h3>
                <ul className="space-y-1">
                  <li>• EfficientNetB2 backbone (pre-trained)</li>
                  <li>• Progressive fine-tuning strategy</li>
                  <li>• Discriminative learning rates</li>
                  <li>• 3-class classifier head</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Training Details</h3>
                <ul className="space-y-1">
                  <li>• 750 train images per class</li>
                  <li>• 250 test images per class</li>
                  <li>• Enhanced data augmentation</li>
                  <li>• 70% confidence threshold</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-20 flex flex-col items-center">
          <a
            href="https://calebnewton.me"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 px-8 py-4 bg-white bg-opacity-60 rounded-full border-2 border-blue-200 shadow-md hover:shadow-xl hover:-translate-y-0.5 hover:border-blue-300 transition-all duration-300 no-underline"
          >
            <img
              src="/caleb-usc.jpg"
              alt="Caleb Newton at USC"
              className="w-12 h-12 rounded-full object-cover border-2 border-blue-300 shadow-md"
              style={{ objectPosition: 'center 30%' }}
            />
            <div className="flex flex-col items-start gap-1">
              <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
                Built by
              </span>
              <span className="text-base text-gray-800 font-bold">
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
