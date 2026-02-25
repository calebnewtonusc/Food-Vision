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
      <div className="fv-card" style={{ position: 'relative', overflow: 'hidden', padding: 0 }}>
        <img
          src={preview}
          alt="Analyzing"
          style={{
            width: '100%', maxHeight: 300, objectFit: 'contain',
            borderRadius: 20, opacity: 0.35, display: 'block',
          }}
        />
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 16,
        }}>
          {/* Fork & knife spinner */}
          <div className="fv-spinner">
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: 52, height: 52 }}>
              <path d="M12 4v10a6 6 0 0012 0V4" stroke="#FF9500" strokeWidth="3" strokeLinecap="round"/>
              <path d="M18 4v18M18 22v22" stroke="#FF9500" strokeWidth="3" strokeLinecap="round"/>
              <path d="M30 4c0 0 6 4 6 10s-6 8-6 8v22" stroke="#FF9500" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
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
        <div style={{ position: 'relative' }}>
          <img
            src={preview}
            alt="Food preview"
            style={{
              width: '100%', maxHeight: 300, objectFit: 'contain',
              display: 'block', borderRadius: '20px 20px 0 0',
            }}
          />
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.06) 0%, transparent 60%)',
            borderRadius: '20px 20px 0 0',
            pointerEvents: 'none',
          }} />
        </div>
        <div style={{ padding: '14px 16px' }}>
          <button onClick={onReset} className="fv-btn-secondary">
            <svg style={{ width: 15, height: 15, marginRight: 7 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
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
          <svg style={{ width: 26, height: 26 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>

        <div style={{ marginTop: 16, textAlign: 'center' }}>
          {dragActive ? (
            <>
              <p style={{ fontSize: 17, fontWeight: 700, color: '#FF9500', margin: 0 }}>
                Drop it here!
              </p>
              <p style={{ fontSize: 13, color: '#c47000', margin: '4px 0 0' }}>
                Release to analyze
              </p>
            </>
          ) : (
            <>
              <p style={{ fontSize: 15, fontWeight: 600, color: '#3a3a3c', margin: 0 }}>
                Drag and drop your food image
              </p>
              <p style={{ fontSize: 13, color: '#8e8e93', margin: '5px 0 0' }}>
                or{' '}
                <span style={{
                  color: '#FF9500', fontWeight: 600,
                  textDecoration: 'underline', textUnderlineOffset: 2, cursor: 'pointer',
                }}>
                  browse files
                </span>
              </p>
            </>
          )}
        </div>

        <p style={{ marginTop: 14, fontSize: 11, color: '#aeaeb2', letterSpacing: 0.2 }}>
          JPEG, PNG, WebP &middot; max 10 MB
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
        <div className="animate-fv-fadein" style={{
          marginTop: 12, padding: '10px 14px',
          background: '#fff5f5',
          border: '1px solid rgba(255,59,48,0.2)',
          borderLeft: '3px solid #FF3B30',
          borderRadius: 12,
          display: 'flex', alignItems: 'flex-start', gap: 10,
        }}>
          <svg style={{ width: 15, height: 15, color: '#FF3B30', flexShrink: 0, marginTop: 1 }}
            fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p style={{ fontSize: 13, color: '#c0392b', margin: 0 }}>{fileError}</p>
        </div>
      )}

      {/* Food types hint */}
      <div style={{ marginTop: 18, display: 'flex', justifyContent: 'center', gap: 28 }}>
        {[
          { emoji: '🍕', label: 'Pizza' },
          { emoji: '🥩', label: 'Steak' },
          { emoji: '🍣', label: 'Sushi' },
        ].map(({ emoji, label }) => (
          <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
            <span style={{ fontSize: 22 }}>{emoji}</span>
            <span style={{ fontSize: 11, color: '#aeaeb2', fontWeight: 500 }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ImageUploader;
