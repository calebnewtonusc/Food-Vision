# FoodVisionMini Dataset

## Overview

FoodVisionMini uses a **3-class subset of Food101** dataset:
- **Pizza** (class 0)
- **Steak** (class 1)
- **Sushi** (class 2)

## Source

- **Original Dataset:** [Food101](https://data.vision.ee.ethz.ch/cvl/datasets_extra/food-101/)
- **Paper:** Bossard, L., Guillaumin, M., & Van Gool, L. (2014). Food-101 – Mining Discriminative Components with Random Forests. ECCV 2014.
- **License:** MIT-like (free for research and commercial use)

## Data Splits

### Original Food101 Split
- **Train:** 750 images per class
- **Test:** 250 images per class

### FoodVisionMini (3 classes)
- **Train:** 2,250 images (750 per class)
- **Test:** 750 images (250 per class)
- **Total:** 3,000 images

## Class Distribution

| Class | Train | Test | Total | Balance |
|-------|-------|------|-------|---------|
| Pizza | 750 | 250 | 1000 | 33.3% |
| Steak | 750 | 250 | 1000 | 33.3% |
| Sushi | 750 | 250 | 1000 | 33.3% |

**Status:** ✅ Perfectly balanced

## Download Instructions

```bash
# Run the download script
python scripts/download_data.py

# This will:
# 1. Download Food101 dataset
# 2. Extract pizza, steak, sushi images
# 3. Organize into train/test folders
# 4. Compute dataset checksum
```

## Dataset Structure

```
data/
├── raw/
│   └── food-101/
│       ├── images/
│       │   ├── pizza/
│       │   ├── steak/
│       │   └── sushi/
│       └── meta/
│           ├── train.txt
│           └── test.txt
└── processed/
    ├── train/
    │   ├── pizza/    # 750 images
    │   ├── steak/    # 750 images
    │   └── sushi/    # 750 images
    └── test/
        ├── pizza/    # 250 images
        ├── steak/    # 250 images
        └── sushi/    # 250 images
```

## Image Properties

- **Format:** JPEG
- **Resolution:** Variable (will be resized during training)
- **Typical size:** 512x512 pixels (varies)
- **Color:** RGB
- **Typical file size:** 50-200KB

## Preprocessing

### Training Transforms (Baseline)
1. Resize to 256x256
2. Center crop to 224x224
3. Normalize (ImageNet mean/std)

### Test Transforms
1. Resize to 256x256
2. Center crop to 224x224
3. Normalize (ImageNet mean/std)

### Improved Model (Optional)
- Random horizontal flip
- Random rotation (±15°)
- Color jitter
- Random resized crop

## Dataset Version

- **Version:** 1.0
- **Checksum (SHA256):** TBD (computed after download)
- **Created:** January 2026
- **Last Modified:** January 2026

## Known Issues

### Potential Challenges
1. **Ambiguous images:** Some dishes may have multiple components (e.g., pizza with steak)
2. **Variation within class:** Raw vs cooked steak, different pizza styles
3. **Background noise:** Plates, tables, utensils in images
4. **Lighting variation:** Restaurant lighting, outdoor, studio

### Quality Notes
- All images are real-world photos from Foodspotting.com
- Some images may have text overlays or watermarks
- Image quality varies (some low resolution or blurry)

## Citation

```bibtex
@inproceedings{bossard14,
  title = {Food-101 -- Mining Discriminative Components with Random Forests},
  author = {Bossard, Lukas and Guillaumin, Matthieu and Van Gool, Luc},
  booktitle = {European Conference on Computer Vision},
  year = {2014}
}
```

## License

Food101 dataset is free for research and commercial use with attribution.

---

**Last Updated:** January 2026
