---
title: Food Vision API
emoji: 🍕
colorFrom: blue
colorTo: green
sdk: docker
pinned: false
---

# Food Vision API

EfficientNetB2-based food classifier that identifies pizza, steak, and sushi from images.

## Model

- Architecture: EfficientNetB2 (pretrained on ImageNet)
- Training: Progressive fine-tuning with discriminative learning rates
- Classes: 3 (pizza, steak, sushi)
- Accuracy: 97.20% on test set
- Inference latency: ~500ms on CPU (optimizable with TorchScript/quantization)

## API Endpoints

### POST /predict

Upload an image to classify it.

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body: Image file (JPEG, PNG, max 10MB)

**Response:**
```json
{
  "predicted_class": "pizza",
  "confidence": 0.95,
  "probabilities": {
    "pizza": 0.95,
    "steak": 0.03,
    "sushi": 0.02
  },
  "inference_time_ms": 85.3
}
```

### GET /health

Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "model_loaded": true,
  "classes": ["pizza", "steak", "sushi"]
}
```

## Usage

```bash
# Test the API
curl -X POST \
  -F "file=@your_image.jpg" \
  https://your-space.hf.space/predict
```

## Model Training

This model was trained using:
- Baseline: Frozen EfficientNetB2 backbone, 10 epochs
- Improved: Gradual unfreezing of last 2 blocks with discriminative LR, 15 epochs
- Data augmentation: Random crops, flips, color jitter
- Optimizer: Adam with cosine annealing scheduler

## Credits

Built with PyTorch, FastAPI, and deployed on Hugging Face Spaces.
