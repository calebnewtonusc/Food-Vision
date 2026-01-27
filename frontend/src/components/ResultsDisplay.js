import React from 'react';

// Emoji mapping
const EMOJI_MAP = {
  pizza: '🍕',
  steak: '🥩',
  sushi: '🍣',
  unknown: '❓'
};

// Color mapping for confidence levels
const getConfidenceColor = (confidence) => {
  if (confidence > 0.9) return 'bg-green-500';
  if (confidence > 0.7) return 'bg-yellow-500';
  return 'bg-red-500';
};

const getConfidenceTextColor = (confidence) => {
  if (confidence > 0.9) return 'text-green-700';
  if (confidence > 0.7) return 'text-yellow-700';
  return 'text-red-700';
};

function ResultsDisplay({ result }) {
  const { predicted_class, confidence, probabilities, inference_time_ms, is_unknown } = result;

  const isUnknown = is_unknown || predicted_class === 'unknown';

  return (
    <div className="mt-8 bg-white rounded-2xl shadow-lg p-8 animate-fadeIn">
      {/* Main Prediction */}
      <div className="text-center mb-8 pb-8 border-b border-gray-200">
        <div className="text-7xl mb-4">{EMOJI_MAP[predicted_class] || '❓'}</div>
        {isUnknown ? (
          <>
            <h2 className="text-4xl font-bold text-gray-900 mb-3">
              Unknown Food
            </h2>
            <p className="text-lg text-gray-600 mb-3">
              This doesn't appear to be pizza, steak, or sushi
            </p>
            <div className="inline-flex items-center px-4 py-2 rounded-full text-orange-700 bg-orange-100">
              <span className="font-semibold text-lg">
                Highest confidence: {(confidence * 100).toFixed(1)}%
              </span>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-4xl font-bold text-gray-900 mb-3 capitalize">
              {predicted_class}
            </h2>
            <div className={`inline-flex items-center px-4 py-2 rounded-full ${getConfidenceTextColor(confidence)} bg-opacity-10`}>
              <span className="font-semibold text-lg">
                {(confidence * 100).toFixed(1)}% confident
              </span>
            </div>
          </>
        )}
      </div>

      {/* Probability Bars */}
      <div className="space-y-5 mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">
          All Predictions
        </h3>
        {Object.entries(probabilities)
          .sort((a, b) => b[1] - a[1])
          .map(([className, prob]) => (
            <div key={className} className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium text-gray-700 capitalize flex items-center">
                  <span className="text-2xl mr-2">{EMOJI_MAP[className]}</span>
                  {className}
                </span>
                <span className="text-gray-600 font-semibold">
                  {(prob * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-3 rounded-full transition-all duration-500 ease-out ${getConfidenceColor(prob)}`}
                  style={{
                    width: `${prob * 100}%`,
                    transition: 'width 0.8s ease-out'
                  }}
                />
              </div>
            </div>
          ))}
      </div>

      {/* Inference Time */}
      <div className="mt-6 pt-6 border-t border-gray-200 text-center">
        <p className="text-sm text-gray-500">
          Inference time: <span className="font-semibold text-gray-700">{inference_time_ms.toFixed(0)}ms</span>
        </p>
      </div>
    </div>
  );
}

export default ResultsDisplay;
