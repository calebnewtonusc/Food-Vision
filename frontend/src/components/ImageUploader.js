import React, { useRef, useState, useCallback } from 'react';

/* Camera / image SVG icon */
function CameraIcon() {
  return (
    <svg
      style={{ width: 26, height: 26 }}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
        d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  );
}

/* ---- Food type indicators ---- */
const FOOD_TYPES = [
  { label: 'Pizza',  icon: '🍕' },
  { label: 'Steak',  icon: '🥩' },
  { label: 'Sushi',  icon: '🍣' },
];

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
      setFileError('Image must be smaller than 10 MB. Please compress or resize it first.');
      return;
    }
    onImageUpload(file);
  };

  /* ---- Loading state ---- */
  if (loading && preview) {
    return (
      <div
        className="fv-card"
        style={{ padding: 0, overflow: 'hidden', position: 'relative' }}
      >
        {/* Blurred preview */}
        <img
          src={preview}
          alt="Analyzing"
          style={{
            width: '100%',
            maxHeight: 300,
            objectFit: 'cover',
            display: 'block',
            opacity: 0.30,
            filter: 'blur(2px)',
          }}
        />
        {/* Overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 16,
          background: 'rgba(255,255,255,0.60)',
          backdropFilter: 'blur(2px)',
          WebkitBackdropFilter: 'blur(2px)',
        }}>
          <div className="fv-spinner-ring" />
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 16, fontWeight: 700, color: '#1c1c1e', margin: 0 }}>
              Analyzing your food...
            </p>
            <p style={{ fontSize: 13, color: '#8e8e93', margin: '4px 0 0' }}>
              EfficientNetB2 is thinking
            </p>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
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
      <div className="fv-card" style={{ padding: 0, overflow: 'hidden' }}>
        {/* Image — full width, rounded top */}
        <div style={{ position: 'relative' }}>
          <img
            src={preview}
            alt="Food preview"
            style={{
              width: '100%',
              maxHeight: 300,
              objectFit: 'cover',
              display: 'block',
              borderRadius: '20px 20px 0 0',
            }}
          />
          {/* Subtle bottom gradient */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.08) 0%, transparent 50%)',
            borderRadius: '20px 20px 0 0',
            pointerEvents: 'none',
          }} />
        </div>
        {/* Action row */}
        <div style={{ padding: '16px 20px' }}>
          <button onClick={onReset} className="fv-btn-secondary">
            <svg style={{ width: 15, height: 15, marginRight: 7 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
              />
            </svg>
            Try a Different Image
          </button>
        </div>
      </div>
    );
  }

  /* ---- Default drop zone ---- */
  return (
    <div className="fv-card">
      {/* Drop zone */}
      <div
        className={`fv-drop-zone${dragActive ? ' fv-drop-zone--active' : ''}`}
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
        {/* Icon */}
        <div className="fv-upload-icon">
          <CameraIcon />
        </div>

        {dragActive ? (
          <>
            <p style={{ fontSize: 17, fontWeight: 700, color: '#FF9500', margin: '0 0 4px' }}>
              Drop it here!
            </p>
            <p style={{ fontSize: 13, color: '#c47000', margin: 0 }}>
              Release to analyze
            </p>
          </>
        ) : (
          <>
            <p style={{ fontSize: 17, fontWeight: 600, color: '#1c1c1e', margin: '0 0 4px' }}>
              Drop your food photo here
            </p>
            <p style={{ fontSize: 14, color: '#8e8e93', margin: 0 }}>
              or{' '}
              <span style={{
                color: '#FF9500', fontWeight: 600,
                textDecoration: 'underline', textUnderlineOffset: 2,
                cursor: 'pointer',
              }}>
                click to browse
              </span>
            </p>
          </>
        )}

        <p style={{ fontSize: 12, color: '#aeaeb2', margin: '10px 0 0', letterSpacing: 0.1 }}>
          Supports JPG, PNG up to 10 MB
        </p>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleChange}
          style={{ display: 'none' }}
        />
      </div>

      {/* Inline file error */}
      {fileError && (
        <div style={{
          marginTop: 12, padding: '10px 14px',
          background: '#fff5f5',
          border: '1px solid rgba(255,59,48,0.20)',
          borderLeft: '3px solid #FF3B30',
          borderRadius: 12,
          display: 'flex', alignItems: 'flex-start', gap: 10,
          animation: 'fadeInUp 0.35s cubic-bezier(0.25,0.46,0.45,0.94) forwards',
        }}>
          <svg
            style={{ width: 14, height: 14, color: '#FF3B30', flexShrink: 0, marginTop: 1 }}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p style={{ fontSize: 13, color: '#c0392b', margin: 0 }}>{fileError}</p>
        </div>
      )}

      {/* Divider */}
      <div style={{
        height: 1,
        background: 'rgba(60,60,67,0.08)',
        margin: '20px 0 16px',
      }} />

      {/* Analyze button */}
      <button
        className="fv-btn-primary"
        onClick={() => fileInputRef.current.click()}
        style={{ gap: 8 }}
      >
        <svg style={{ width: 18, height: 18 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        Analyze Photo
      </button>

      {/* Food type hints */}
      <div style={{
        marginTop: 16,
        display: 'flex',
        justifyContent: 'center',
        gap: 24,
      }}>
        {FOOD_TYPES.map(({ label, icon }) => (
          <div key={label} style={{
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: 3,
          }}>
            <span style={{ fontSize: 22 }}>{icon}</span>
            <span style={{ fontSize: 11, color: '#aeaeb2', fontWeight: 500 }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ImageUploader;
