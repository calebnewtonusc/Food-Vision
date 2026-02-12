# Model Card: FoodVision EfficientNetB2 Classifier

## Model Details

**Model Name:** FoodVision EfficientNetB2 3-Class Food Classifier
**Model Version:** 1.0.0
**Model Type:** Image Classification (Multi-class)
**Architecture:** EfficientNetB2 with custom classification head
**Framework:** PyTorch 2.1.0
**Model Size:** 29.65MB (weights-only), 54.56MB (full checkpoint)
**Parameters:** ~7.7M total, ~4K trainable (classifier head)
**License:** MIT
**Author:** Caleb Newton
**Date:** 2026

## Intended Use

### Primary Intended Use
This model is designed **exclusively for educational and demonstration purposes** to showcase:
- End-to-end machine learning workflow (data preparation, training, evaluation, deployment)
- Transfer learning with EfficientNet architecture
- Model evaluation best practices (calibration, confusion matrices, metrics)
- Full-stack ML deployment (FastAPI backend, React frontend)

### Intended Users
- Students learning machine learning and computer vision
- Developers exploring ML deployment patterns
- Educators demonstrating ML concepts
- Portfolio reviewers evaluating ML engineering skills

### Out-of-Scope Use Cases

**CRITICAL - DO NOT USE FOR:**
1. **Food Safety Decisions**
   - Cannot detect spoilage, contamination, or foodborne pathogens
   - Cannot determine if food is safe to eat
   - Cannot identify food handling or storage issues

2. **Medical or Dietary Decisions**
   - Cannot identify ingredients or allergens
   - Cannot determine nutritional content
   - Cannot provide dietary recommendations
   - Not validated for medical or health applications

3. **Production Food Classification**
   - Only recognizes 3 specific food categories
   - Not validated for real-world commercial applications
   - Limited to Food-101 dataset aesthetic

4. **High-Stakes Decision Making**
   - Not designed for scenarios where misclassification has serious consequences
   - No formal safety validation or certification

## Training Data

### Dataset
- **Source:** Food-101 dataset (subset)
- **Classes:** 3 food categories
  - Pizza (class 0)
  - Steak (class 1)
  - Sushi (class 2)
- **Training Set:** 750 images per class (2,250 total)
- **Test Set:** 250 images per class (750 total)
- **Image Size:** 224x224 RGB
- **Data Split:** Fixed train/test split from Food-101

### Data Characteristics
- Professional food photography aesthetic
- Primarily restaurant-style plating
- Diverse lighting conditions and angles
- High-quality images from Food-101 dataset
- Limited to specific visual styles and presentations

### Data Preprocessing
- Resize to 224x224
- Normalize with ImageNet statistics (mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
- Training augmentation: RandomHorizontalFlip, RandomRotation, ColorJitter

### Known Data Limitations
- **Limited diversity:** Only 3 food categories from Food-101
- **Aesthetic bias:** Professional photography may not generalize to casual photos
- **Western bias:** Dataset skews toward Western food presentation styles
- **Class imbalance:** Equal representation across 3 classes (not representative of real-world distribution)

## Model Performance

### Test Set Metrics (750 images)
| Metric | Value |
|--------|-------|
| Overall Accuracy | 97.20% |
| Macro F1 Score | 0.9720 |
| Expected Calibration Error (ECE) | 0.0147 |
| Top-3 Accuracy | 100% (trivial for 3 classes) |

### Per-Class Performance
| Class | Precision | Recall | F1 Score | Support |
|-------|-----------|--------|----------|---------|
| Pizza | 0.976 | 0.976 | 0.976 | 250 |
| Steak | 0.964 | 0.976 | 0.970 | 250 |
| Sushi | 0.976 | 0.964 | 0.970 | 250 |

### Inference Performance
- **CPU (Local):** ~3.4 seconds per image (MacBook/Linux)
- **GPU (Estimated):** <200ms per image (untested in production)
- **Production (HF Spaces):** ~3.4 seconds (CPU deployment)

### Confidence Calibration
- Well-calibrated with ECE of 0.0147
- Model confidence scores generally reflect true accuracy
- See `reliability_diagram.png` for calibration visualization

## Limitations

### Technical Limitations

1. **Extremely Limited Scope**
   - Only recognizes 3 food categories (pizza, steak, sushi)
   - Will attempt to classify ANY image into one of these 3 classes
   - No "unknown" or "other" category - will force prediction even for non-food images

2. **Domain Mismatch**
   - Trained on professional Food-101 photography
   - May perform poorly on casual smartphone photos
   - May struggle with unconventional plating or presentations
   - Performance degrades on foods outside the 3 training classes

3. **Visual Similarity Issues**
   - May confuse visually similar foods (e.g., raw tuna vs. sushi)
   - May misclassify close-up or unusual angles
   - May struggle with mixed dishes (e.g., steak on pizza)

4. **No Safety Detection**
   - Cannot detect food spoilage or contamination
   - Cannot identify food safety issues
   - Cannot determine food freshness
   - Cannot detect allergens or ingredients

5. **Model Architecture Constraints**
   - EfficientNetB2 designed for 224x224 images (lower resolution than larger models)
   - ~7.7M parameters (smaller than state-of-the-art vision models)
   - CPU inference is slow (~3.4s per image)

### Known Failure Modes

Based on evaluation and testing, the model is known to fail in these scenarios:

1. **Non-Food Images**
   - Will still predict one of the 3 classes even for non-food images
   - Example: Uploading a sunset photo may predict "pizza" with high confidence

2. **Ambiguous Images**
   - Close-up texture shots without clear food context
   - Images with multiple food items from different classes

3. **Out-of-Domain Foods**
   - Any food outside {pizza, steak, sushi} will be forced into one of these classes
   - Example: A burger will likely be classified as pizza or steak

4. **Unusual Presentations**
   - Deconstructed dishes
   - Raw ingredients before cooking
   - Heavily processed or stylized food photography

5. **Low-Quality Images**
   - Blurry or low-resolution images
   - Poor lighting conditions
   - Extreme angles or cropping

### Statistical Limitations

1. **Small Test Set:** 750 images may not capture all real-world variation
2. **No Cross-Dataset Validation:** Only evaluated on Food-101 test split
3. **No Adversarial Testing:** Not tested against adversarial examples
4. **No Robustness Testing:** Not evaluated for robustness to image corruptions

## Ethical Considerations

### Potential Harms

1. **Misuse for Safety Decisions**
   - Users may incorrectly rely on predictions for food safety
   - Could lead to foodborne illness if used to assess food freshness
   - **Mitigation:** Prominent disclaimers in UI and documentation

2. **Medical Misuse**
   - Users may attempt to use for dietary or allergy decisions
   - Could cause allergic reactions if used to identify ingredients
   - **Mitigation:** Clear warnings that model cannot identify ingredients/allergens

3. **Over-Reliance on Model**
   - 97.20% accuracy means ~3% error rate (21 errors in 750 test images)
   - Users may trust predictions more than warranted
   - **Mitigation:** Display confidence scores and explain limitations

4. **Cultural Bias**
   - Food-101 dataset may not represent global food diversity
   - Limited to Western-style presentations of selected foods
   - **Mitigation:** Document dataset limitations clearly

### Responsible Use Guidelines

1. **Always include disclaimers** when deploying or sharing this model
2. **Never use for safety-critical applications** (food safety, medical, dietary)
3. **Display confidence scores** to help users understand prediction uncertainty
4. **Provide educational context** about model limitations
5. **Monitor for misuse** if deploying publicly

## Training Procedure

### Model Architecture
- **Base Model:** EfficientNetB2 (pretrained on ImageNet)
- **Classifier Head:** Dropout(0.3) + Linear(1408 → 3)
- **Fine-tuning Strategy:** Progressive unfreezing
  - Baseline: Freeze backbone, train head only
  - Improved: Unfreeze last 2 blocks + head

### Training Hyperparameters
**Improved Model (97.20% accuracy):**
- Optimizer: Adam
- Learning Rate: Discriminative (1e-5 for backbone, 1e-3 for head)
- Scheduler: Cosine annealing
- Batch Size: 32
- Epochs: 15
- Dropout: 0.3
- Weight Decay: 1e-4

### Reproducibility
- Python seed: 42
- NumPy seed: 42
- PyTorch seed: 42
- Deterministic mode enabled
- Dataset SHA-256 checksums verified
- Configuration saved in `configs/improved.yaml`

## Evaluation Methodology

### Metrics Computed
- Accuracy (overall and per-class)
- Precision, Recall, F1 (macro and per-class)
- Confusion Matrix
- Expected Calibration Error (ECE)
- Confidence distributions
- Inference latency (p50, p95, p99)

### Evaluation Tools
- Custom `EvalHarness` library
- scikit-learn for metrics
- Matplotlib/Seaborn for visualizations
- PyTorch for inference

### Evaluation Dataset
- Food-101 test split (fixed)
- 250 images per class (750 total)
- Same preprocessing as training
- No data augmentation during evaluation

## Deployment

### Backend
- **Framework:** FastAPI 0.104.1
- **Platform:** Hugging Face Spaces (Docker)
- **Inference Device:** CPU
- **CORS:** Locked to specific origins (https://foodvis.in, localhost)
- **Model Loading:** Lazy loading on first request

### Frontend
- **Framework:** React 18.2.0
- **Platform:** Vercel
- **Domain:** https://foodvis.in
- **Features:** Drag-and-drop upload, confidence visualization, safety disclaimers

### Security Considerations
- CORS restricted to specific origins (no wildcard)
- File size limit: 10MB
- File type validation: JPEG, PNG only
- No user data retention

## Model Card Contact

**Author:** Caleb Newton
**Purpose:** Educational demonstration for ML portfolio
**Feedback:** Please open an issue on the project repository for questions or concerns

## Model Card Updates

**Version 1.0.0 (2026-02-12)**
- Initial model card creation
- Documented limitations and intended use
- Added safety disclaimers and ethical considerations

---

**References:**
- Food-101 Dataset: Bossard, Lukas et al. "Food-101 – Mining Discriminative Components with Random Forests." ECCV 2014.
- EfficientNet: Tan, Mingxing, and Quoc V. Le. "EfficientNet: Rethinking Model Scaling for Convolutional Neural Networks." ICML 2019.
- Model Cards: Mitchell, Margaret et al. "Model Cards for Model Reporting." FAT* 2019.
