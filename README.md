# FoodVision

![PyTorch](https://img.shields.io/badge/PyTorch-2.1-EE4C2C?logo=pytorch&logoColor=white)
![EfficientNetB2](https://img.shields.io/badge/model-EfficientNetB2-orange)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104-009688?logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-18-61dafb?logo=react&logoColor=white)
![HuggingFace](https://img.shields.io/badge/HF%20Spaces-deployed-FFD21E?logo=huggingface&logoColor=black)
![Vercel](https://img.shields.io/badge/Vercel-deployed-000000?logo=vercel&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-yellow)

End-to-end food image classifier built on EfficientNetB2, with a FastAPI inference backend on Hugging Face Spaces and a drag-and-drop React frontend. Demonstrates the full ML workflow from training to production deployment.

**Live demo:** [foodvis.in](https://foodvis.in)

> Screenshot

## Features

- **97.2% accuracy** on a 3-class Food-101 subset (pizza, steak, sushi) using fine-tuned EfficientNetB2
- **Drag-and-drop upload** in the React frontend with real-time confidence bar visualization
- **Calibrated predictions**: Expected Calibration Error (ECE) of 0.0147, meaning confidence scores are reliable
- **Reproducible training**: deterministic seeds, SHA-256 dataset checksums, YAML configs, and Git commit capture
- **Custom EvalHarness**: per-class accuracy/F1, confusion matrix, calibration analysis, and CPU latency profiling
- **Low-cost deployment**: ~$1/month (domain only); HF Spaces and Vercel run on free tiers

## Model Performance

| Metric | Value |
|---|---|
| Accuracy | 97.20% |
| F1 Score (macro) | 0.9720 |
| ECE (calibration) | 0.0147 |
| Model size (weights) | 29.65 MB |
| Inference latency (CPU) | ~3.4s |

## Tech Stack

| Layer | Technology |
|---|---|
| Model | EfficientNetB2, pretrained on ImageNet, fine-tuned on Food-101 |
| Training | PyTorch 2.1, torchvision 0.16, cosine annealing, discriminative LR |
| Evaluation | Custom EvalHarness (metrics, calibration, confusion, latency) |
| Backend | FastAPI 0.104 on Hugging Face Spaces (Docker, CPU inference) |
| Frontend | React 18, Tailwind CSS, deployed on Vercel |

## Getting Started

### Run the frontend locally

```bash
cd frontend
npm install
REACT_APP_API_URL=https://calebnewtonusc-food-vision-api.hf.space npm start
```

### Run the backend locally

```bash
cd backend
pip install -r requirements.txt
uvicorn app:app --reload
# API: http://localhost:8000
# Docs: http://localhost:8000/docs
```

### Retrain the model

```bash
# Download dataset
python scripts/download_data.py

# Baseline (frozen backbone)
python src/train.py --config configs/baseline.yaml

# Improved (fine-tuned, discriminative LR)
python src/train.py --config configs/improved.yaml

# Evaluate
python scripts/evaluate.py --checkpoint artifacts/improved/model.pt
```

## Project Structure

```
FoodVision/
├── src/               # Training code (train.py, models.py, data.py, config.py)
├── configs/           # baseline.yaml and improved.yaml training configs
├── evalharness/       # Evaluation library (metrics, calibration, confusion, perf)
├── scripts/           # download_data.py, evaluate.py
├── backend/           # FastAPI app, model inference, Dockerfile
└── frontend/          # React app (drag-and-drop UI, confidence visualization)
```

## Deployment Architecture

```
foodvis.in  (Vercel, React frontend)
     |
     | HTTPS
     v
Hugging Face Spaces  (FastAPI backend, CPU inference)
  /predict  /health  /docs
```

## Author

**Caleb Newton** | [calebnewton.me](https://calebnewton.me) | [GitHub](https://github.com/calebnewtonusc)
