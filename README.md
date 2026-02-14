# FoodVision

Food101 image classifier demonstrating end-to-end ML workflow: data preparation, training, evaluation, and full-stack deployment.

**􀙭 Live Demo:** [https://foodvis.in](https://foodvis.in)

## 􀇾 Safety Disclaimer

**This is an educational demonstration project only. DO NOT use for:**
- Food safety decisions (cannot detect spoilage, contamination, or safety issues)
- Dietary or medical decisions (cannot identify ingredients, allergens, or nutritional content)
- Production applications without extensive validation

**Limitations:**
- Only recognizes 3 food categories (pizza, steak, sushi)
- Model can be wrong and may misclassify images outside its training domain
- Not validated for real-world safety or medical applications
- See MODEL_CARD.md for detailed limitations and intended use

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
| **Model Size (weights-only)** | 30MB | **29.65MB** | <50MB ✓ |
| **Model Size (full checkpoint)** | - | **54.56MB** | - |
| **Inference (CPU Local)** | N/A | **~3.4s** | - |
| **Inference (GPU - estimated)** | N/A | **<200ms (untested)** | <200ms |

*Note: GPU inference time is estimated based on typical EfficientNetB2 performance. Production deployment uses CPU inference (~3.4s per image).*

## Tech Stack

**Training & Evaluation:**
- PyTorch 2.1.0 + torchvision 0.16.0
- EfficientNetB2 (pretrained on ImageNet)
- Custom EvalHarness for evaluation
- scikit-learn, matplotlib, seaborn

**Backend:**
- FastAPI 0.104.1
- Hugging Face Spaces (Docker deployment)
- CPU inference: ~3.4s per image
- GPU inference: Estimated <200ms (untested)

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
│  • CPU inference (no GPU)           │
│  • ~3.4s latency per image          │
│  • Automatic scaling                │
└─────────────────────────────────────┘
```

### Backend (FastAPI + HF Spaces)
- FastAPI 0.104.1
- Docker deployment on Hugging Face Spaces (CPU inference)
- Lazy model loading on first request
- CORS configured for specific origins (no wildcard)
- Endpoints: `/`, `/health`, `/predict`, `/docs`
- Inference latency: ~3.4s per image (CPU)

### Frontend (React + Vercel)
- React 18.2.0 (Create React App)
- Tailwind CSS styling
- Auto-deploy from GitHub
- Custom domain via GoDaddy DNS
- Features: drag-and-drop upload, real-time predictions, confidence bars

### Deployment Cost
~$1/month (domain only, HF Spaces + Vercel free tiers)

## Limitations

### Model Limitations
- **Limited scope**: Only trained on 3 food categories (pizza, steak, sushi) from Food-101 dataset
- **Domain mismatch**: Performance degrades significantly on foods outside these 3 classes
- **No safety detection**: Cannot detect food spoilage, contamination, allergens, or safety issues
- **Visual similarity bias**: May confuse visually similar foods (e.g., raw fish vs. sushi)
- **Training data bias**: Limited to Food-101 dataset aesthetic (professional food photography)

### Deployment Limitations
- **CPU inference**: Current deployment uses CPU only (~3.4s latency)
- **No GPU acceleration**: GPU inference time (<200ms) is estimated but not tested in production
- **Single-region**: Deployed on HF Spaces with potential geographic latency
- **Free tier constraints**: Subject to HF Spaces and Vercel free tier limitations

### Ethical Considerations
- **Not for medical use**: This model should never be used for dietary, nutritional, or medical decisions
- **Not for safety use**: This model cannot make food safety determinations
- **Educational only**: Intended for demonstrating ML workflows, not production food classification

For detailed model limitations and intended use cases, see [MODEL_CARD.md](MODEL_CARD.md).

## License

MIT

---

Part of the 2026 ML Engineering Portfolio
