# FoodVision

Food101 image classifier demonstrating end-to-end ML workflow: data preparation, training, evaluation, and full-stack deployment.

**🚀 Live Demo:** [https://foodvis.in](https://foodvis.in)

## Project Overview

Uses EfficientNetB2 on a 3-class subset of Food101 (pizza, steak, sushi) with FastAPI backend and React frontend.

- **Classifies** food images into 3 categories with confidence scores
- **Trains** with reproducibility (locked seeds, versioned datasets, documented configs)
- **Evaluates** with multiple metrics (accuracy, F1, confusion matrix, calibration, latency profiling)
- **Deploys** with FastAPI on Hugging Face Spaces and React on Vercel

## Core Results

| Metric | Baseline | Improved | Target |
|--------|----------|----------|--------|
| **Accuracy** | 94.27% | **97.20%** | >90% |
| **F1 Score** | N/A | **0.9720** | >0.90 |
| **ECE (Calibration)** | N/A | **0.0147** | <0.05 |
| **Model Size** | 30MB | **29.65MB** | <50MB ✓ |
| **Inference (Production)** | N/A | **~94ms** | <200ms ✓ |
| **Inference (CPU Local)** | N/A | ~3.3s | - |

*Production deployment on Hugging Face Spaces uses GPU acceleration for fast inference*

## Tech Stack

**Training & Evaluation:**
- PyTorch 2.1.0 + torchvision 0.16.0
- EfficientNetB2 (pretrained on ImageNet)
- Custom EvalHarness for evaluation
- scikit-learn, matplotlib, seaborn

**Backend:**
- FastAPI 0.104.1
- Hugging Face Spaces (Docker deployment with GPU acceleration)
- Production inference: ~94ms per image (GPU)
- Local CPU inference: ~3.3s per image

**Frontend:**
- React 18.2.0
- Tailwind CSS (via CDN)
- Vercel deployment
- Custom domain (foodvis.in)

## Project Structure

```
FoodVision/
├── src/                   # Core training code
│   ├── train.py           # Main training script
│   ├── models.py          # EfficientNetB2 model
│   ├── data.py            # Dataset and data loaders
│   └── config.py          # Config loader
├── evalharness/           # Evaluation library
│   ├── metrics/           # Classification metrics
│   ├── confusion/         # Confusion matrix
│   ├── calibration/       # Calibration analysis (ECE)
│   └── perf/              # Latency profiling
├── scripts/
│   ├── download_data.py   # Download Food101 subset
│   └── evaluate.py        # Run evaluation
├── configs/
│   ├── baseline.yaml      # Frozen backbone config
│   └── improved.yaml      # Fine-tuning config
├── backend/               # FastAPI server
│   ├── app.py             # FastAPI application
│   ├── model.py           # Model inference
│   └── Dockerfile         # Docker config
└── frontend/              # React web app
    ├── src/
    └── vercel.json        # Vercel config
```

## Training Pipeline

### Baseline Model
- EfficientNetB2 (pretrained on ImageNet)
- Freeze backbone, train classifier head only
- Dropout(0.3) + Linear(1408 → 3)
- 10 epochs, Adam (LR=1e-3)
- Target: 88-92% accuracy

### Improved Model
- Unfreeze last 2 blocks of EfficientNetB2
- Discriminative learning rates (1e-5 to 1e-3)
- 15 epochs, cosine annealing
- Enhanced augmentation
- Target: 92-95% accuracy

### Reproducibility
- Deterministic seeds (Python=42, NumPy=42, PyTorch=42)
- Dataset SHA-256 checksums
- Locked class order (pizza=0, steak=1, sushi=2)
- Config YAML saved with every run
- Git commit hash captured

## Evaluation

### Metrics
- Accuracy (overall and per-class)
- F1 (macro and per-class)
- Confusion matrix with top confusions

### Calibration
- Confidence histogram
- Expected Calibration Error (ECE)
- Overconfident examples

### Performance
- Model size (MB)
- Parameter count
- Inference latency (p50, p95) on CPU

## Production Deployment

### Architecture
```
┌─────────────────────────────────────┐
│        foodvis.in                   │
│    (Vercel - React Frontend)        │
│  • Drag-and-drop upload             │
│  • Real-time predictions            │
│  • Confidence visualization         │
└────────────┬────────────────────────┘
             │ HTTPS/CORS
             ▼
┌─────────────────────────────────────┐
│      Hugging Face Spaces            │
│      (FastAPI Backend)              │
│  • /predict endpoint                │
│  • Model inference (CPU)            │
│  • ~3.4s latency                    │
│  • Automatic scaling                │
└─────────────────────────────────────┘
```

### Backend (FastAPI + HF Spaces)
- FastAPI 0.104.1
- Docker deployment on Hugging Face Spaces
- Lazy model loading on first request
- CORS configured for custom domain
- Endpoints: `/`, `/health`, `/predict`, `/docs`

### Frontend (React + Vercel)
- React 18.2.0 (Create React App)
- Tailwind CSS styling
- Auto-deploy from GitHub
- Custom domain via GoDaddy DNS
- Features: drag-and-drop upload, real-time predictions, confidence bars

### Deployment Cost
~$1/month (domain only, HF Spaces + Vercel free tiers)

## License

MIT

---

Part of the 2026 ML Engineering Portfolio
