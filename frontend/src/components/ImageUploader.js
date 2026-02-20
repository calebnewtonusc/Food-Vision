import React, { useRef, useState, useCallback } from 'react';

function ImageUploader({ onImageUpload, loading, preview, onReset }) {
  const [dragActive, setDragActive] = useState(false);
  const [fileError, setFileError] = useState(null);
  const fileInputRef = useRef(null);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      // Only deactivate if leaving the drop zone itself, not a child
      if (!e.currentTarget.contains(e.relatedTarget)) {
        setDragActive(false);
      }
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []); // eslint-disable-line

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    setFileError(null);
    if (!file.type.startsWith('image/')) {
      setFileError('Please upload an image file (JPEG, PNG, WebP, etc.)');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setFileError('Image must be smaller than 10MB. Please compress or resize it first.');
      return;
    }
    onImageUpload(file);
  };

  /* ---- Loading overlay ---- */
  if (loading && preview) {
    return (
      <div className="fv-card relative overflow-hidden">
        <img
          src={preview}
          alt="Analyzing"
          className="w-full max-h-80 object-contain rounded-xl opacity-40"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
          {/* Fork & knife spinner */}
          <div className="fv-spinner">
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-16 h-16">
              <path d="M12 4v10a6 6 0 0012 0V4" stroke="#e8622a" strokeWidth="3" strokeLinecap="round"/>
              <path d="M18 4v18M18 22v22" stroke="#e8622a" strokeWidth="3" strokeLinecap="round"/>
              <path d="M30 4c0 0 6 4 6 10s-6 8-6 8v22" stroke="#e8622a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-warm-700">Analyzing your food...</p>
            <p className="text-sm text-warm-500 mt-1">EfficientNetB2 is thinking</p>
          </div>
          <div className="flex gap-1.5 mt-1">
            <span className="fv-dot" style={{ animationDelay: '0s' }} />
            <span className="fv-dot" style={{ animationDelay: '0.2s' }} />
            <span className="fv-dot" style={{ animationDelay: '0.4s' }} />
          </div>
        </div>
      </div>
    );
  }

  /* ---- Preview state (not loading) ---- */
  if (preview) {
    return (
      <div className="fv-card">
        <div className="relative group">
          <img
            src={preview}
            alt="Food preview"
            className="w-full max-h-80 object-contain rounded-xl shadow-inner border border-orange-100"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent rounded-xl pointer-events-none" />
        </div>
        <button
          onClick={onReset}
          className="fv-btn-secondary w-full mt-4"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Try a Different Image
        </button>
      </div>
    );
  }

  /* ---- Default drop zone ---- */
  return (
    <div className="fv-card">
      <div
        className={`fv-drop-zone ${dragActive ? 'fv-drop-zone--active' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current.click()}
        aria-label="Upload food image"
      >
        {/* Upload icon */}
        <div className={`fv-upload-icon ${dragActive ? 'fv-upload-icon--active' : ''}`}>
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>

        <div className="mt-4 text-center">
          {dragActive ? (
            <>
              <p className="text-xl font-bold text-orange-600">Drop it here!</p>
              <p className="text-sm text-orange-400 mt-1">Release to analyze</p>
            </>
          ) : (
            <>
              <p className="text-lg font-semibold text-gray-700">
                Drag & drop your food image
              </p>
              <p className="text-sm text-gray-500 mt-1">
                or{' '}
                <span className="text-orange-500 font-semibold underline underline-offset-2 cursor-pointer hover:text-orange-600">
                  browse files
                </span>
              </p>
            </>
          )}
        </div>

        <p className="mt-4 text-xs text-gray-400">
          JPEG, PNG, WebP  &middot;  max 10 MB
        </p>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleChange}
          className="hidden"
        />
      </div>

      {/* Inline file error */}
      {fileError && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 animate-fv-fadein">
          <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-red-700">{fileError}</p>
        </div>
      )}

      {/* Food types hint */}
      <div className="mt-5 flex justify-center gap-6">
        {[
          { emoji: '🍕', label: 'Pizza' },
          { emoji: '🥩', label: 'Steak' },
          { emoji: '🍣', label: 'Sushi' },
        ].map(({ emoji, label }) => (
          <div key={label} className="flex flex-col items-center gap-1">
            <span className="text-2xl">{emoji}</span>
            <span className="text-xs text-gray-400 font-medium">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ImageUploader;
