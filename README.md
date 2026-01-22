# FoodVisionMini

**Food101 Image Classifier with Rigorous Evaluation**

A production-quality image classification project demonstrating end-to-end ML workflow: data preparation, training, evaluation, and deployment. Uses EfficientNetB2 on a 3-class subset of Food101 (pizza, steak, sushi).

## What It Does

- **Classifies food images** into 3 categories with confidence scores
- **Trains with reproducibility** - Locked seeds, versioned datasets, documented configs
- **Evaluates rigorously** - Metrics, confusion matrix, calibration, slicing, robustness tests
- **Deploys to Gradio** - Interactive demo on Hugging Face Spaces
- **Documents honestly** - Failure modes, limitations, and "what would change my mind"

## Core Results

| Metric | Baseline | Improved | Target |
|--------|----------|----------|--------|
| **Accuracy** | TBD | TBD | >90% |
| **Latency (p50)** | TBD | TBD | <100ms |
| **Model Size** | ~28MB | TBD | <50MB |

## Tech Stack

- **ML Framework:** PyTorch + torchvision
- **Model:** EfficientNetB2 (pretrained on ImageNet)
- **Evaluation:** Custom EvalHarness
- **Demo:** Gradio
- **Deployment:** Hugging Face Spaces
- **CI/CD:** GitHub Actions

## Project Structure

```
FoodVisionMini/
├── src/
│   ├── train.py           # Main training script
│   ├── models.py          # Model definitions
│   ├── data.py            # Dataset and transforms
│   ├── config.py          # Configuration
│   └── utils.py           # Helper functions
├── evalharness/           # Custom evaluation library
│   ├── metrics/           # Accuracy, F1, precision/recall
│   ├── confusion/         # Confusion matrix analysis
│   ├── calibration/       # Confidence calibration
│   ├── slicing/           # Performance by slice
│   ├── robustness/        # Corruption tests
│   ├── perf/              # Latency profiling
│   └── report/            # Report generation
├── demos/
│   └── foodvision_mini/   # Gradio demo app
├── artifacts/             # Run outputs (gitignored)
├── data/
│   ├── raw/               # Original Food101 subset
│   └── processed/         # Preprocessed data
├── docs/                  # Documentation
└── tests/                 # Tests
```

## Getting Started

### Prerequisites

- Python 3.11+
- CUDA-capable GPU (optional, CPU works)

### Quick Start

```bash
# Clone the repository
git clone https://github.com/calebnewtonusc/FoodVisionMini.git
cd FoodVisionMini

# Create virtual environment
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows

# Install dependencies
pip install -r requirements.txt

# Download data (Food101 subset)
python scripts/download_data.py

# Train baseline model
python src/train.py --config configs/baseline.yaml

# Evaluate
python scripts/evaluate.py --run_id <run_id>

# Run Gradio demo
python demos/foodvision_mini/app.py
```

## Training Pipeline

### Baseline Model
- **Architecture:** EfficientNetB2 with frozen backbone
- **Head:** Single linear layer (3-class)
- **Training:** 10 epochs, Adam optimizer, cross-entropy loss
- **Augmentation:** Basic (resize, center crop, normalize)

### Improved Model (One Meaningful Change)
Options to explore:
- Unfreeze last block of backbone
- Add data augmentation (rotation, color jitter)
- Test-time augmentation
- Class balancing (weighted loss)
- Model quantization (int8)

### Reproducibility Guarantees
- Deterministic seeds (Python, NumPy, PyTorch, CUDA)
- Dataset version with checksum
- Locked class order (pizza=0, steak=1, sushi=2)
- Config saved with every run
- Git commit hash recorded

## Evaluation with EvalHarness

Every run produces a comprehensive evaluation report:

### Metrics
- Accuracy (overall and per-class)
- F1 (macro and per-class)
- Confusion matrix with top confusions

### Calibration
- Confidence histogram
- Expected Calibration Error (ECE)
- Overconfident examples (high confidence, wrong prediction)

### Slicing
Performance breakdown by:
- Image resolution (low/medium/high)
- Brightness (dark/normal/bright)
- Confidence deciles

### Robustness
Degradation under:
- Gaussian blur
- Gaussian noise
- JPEG compression

### Performance
- Model size (MB)
- Parameter count
- Inference latency (p50, p95) on CPU

### Failure Cases
12 curated examples (4 per class):
- True label, predicted label, confidence
- Why it failed (similar textures, occlusion, etc.)
- Link to raw image

## Gradio Demo

Interactive web app with:
- Image upload
- Example images (1 per class)
- Prediction with probability bars
- Inference time display
- Model info

**Live Demo:** [Hugging Face Space](https://huggingface.co/spaces/calebnewton/foodvision-mini) (TBD)

## Failure Modes Taxonomy

### 1. Data Failures
- Class imbalance (if present)
- Ambiguous images (e.g., pizza with steak topping)
- Low resolution or poor lighting

### 2. Model/Representation Failures
- Texture bias (similar colors across classes)
- Background confusion (plate vs food)
- Fine-grained differences (raw vs cooked steak)

### 3. Optimization Failures
- Underfitting (if baseline is too simple)
- Overfitting (if training accuracy >> test accuracy)

### 4. Systems/Deployment Failures
- Latency spikes on CPU
- Out-of-distribution inputs (non-food images)
- Model size too large for edge deployment

## Development Roadmap

🚧 **Under Active Development** - Week 0-2 Project

- [ ] Data download and preprocessing
- [ ] Baseline model training
- [ ] EvalHarness implementation
- [ ] Improved model (one meaningful change)
- [ ] Gradio demo app
- [ ] Failure analysis and documentation
- [ ] CI/CD with smoke tests
- [ ] Deployment to Hugging Face Spaces

## What Would Change My Mind

**Current hypothesis:** EfficientNetB2 frozen backbone + linear head can achieve >90% accuracy on 3-class Food101 subset.

**What would invalidate this:**
- Accuracy <85% after proper hyperparameter tuning
- Latency >200ms p95 on CPU (making it impractical for real-time use)
- Robustness degradation >20% under mild corruption
- Failure to generalize to similar food images outside Food101

## License

MIT

---

**Part of the 2026 ML/AI Engineering Portfolio**
End-to-end image classification with honest evaluation and deployment.
