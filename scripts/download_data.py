#!/usr/bin/env python3
"""
Download and prepare Food101 dataset for FoodVision Mini.
Downloads full Food101 dataset and extracts pizza, steak, and sushi classes.
"""

import os
import sys
import tarfile
import hashlib
from pathlib import Path
from urllib.request import urlretrieve
import shutil

# Dataset configuration
FOOD101_URL = "http://data.vision.ee.ethz.ch/cvl/food-101.tar.gz"
DATASET_NAME = "food-101.tar.gz"
CLASSES = ["pizza", "steak", "sushi"]
EXPECTED_FILES_PER_CLASS = {"train": 750, "test": 250}

def compute_sha256(file_path):
    """Compute SHA-256 checksum of a file."""
    sha256_hash = hashlib.sha256()
    with open(file_path, "rb") as f:
        for byte_block in iter(lambda: f.read(4096), b""):
            sha256_hash.update(byte_block)
    return sha256_hash.hexdigest()

def download_progress(block_num, block_size, total_size):
    """Progress callback for urlretrieve."""
    downloaded = block_num * block_size
    percent = min(100.0, (downloaded / total_size) * 100)
    sys.stdout.write(f"\rDownloading: {percent:.1f}%")
    sys.stdout.flush()

def download_food101(data_dir):
    """Download Food101 dataset."""
    data_dir = Path(data_dir)
    data_dir.mkdir(parents=True, exist_ok=True)

    archive_path = data_dir / DATASET_NAME

    if archive_path.exists():
        print(f"Archive already exists at {archive_path}")
    else:
        print(f"Downloading Food101 dataset from {FOOD101_URL}")
        print("This may take several minutes (~5GB)...")
        urlretrieve(FOOD101_URL, archive_path, download_progress)
        print("\nDownload complete!")

    return archive_path

def extract_food101(archive_path, extract_dir):
    """Extract Food101 dataset."""
    extract_dir = Path(extract_dir)

    if (extract_dir / "food-101").exists():
        print(f"Dataset already extracted at {extract_dir / 'food-101'}")
        return extract_dir / "food-101"

    print(f"Extracting dataset to {extract_dir}...")
    with tarfile.open(archive_path, "r:gz") as tar:
        tar.extractall(path=extract_dir)
    print("Extraction complete!")

    return extract_dir / "food-101"

def filter_classes(food101_dir, output_dir, classes):
    """
    Filter Food101 dataset to only include specified classes.
    Organizes into train/ and test/ splits.
    """
    food101_dir = Path(food101_dir)
    output_dir = Path(output_dir)

    # Read train/test splits
    meta_dir = food101_dir / "meta"
    train_file = meta_dir / "train.txt"
    test_file = meta_dir / "test.txt"

    print(f"\nFiltering classes: {classes}")

    # Parse splits
    train_images = {}
    test_images = {}

    with open(train_file, "r") as f:
        for line in f:
            line = line.strip()
            if any(line.startswith(cls) for cls in classes):
                class_name = line.split("/")[0]
                if class_name not in train_images:
                    train_images[class_name] = []
                train_images[class_name].append(line)

    with open(test_file, "r") as f:
        for line in f:
            line = line.strip()
            if any(line.startswith(cls) for cls in classes):
                class_name = line.split("/")[0]
                if class_name not in test_images:
                    test_images[class_name] = []
                test_images[class_name].append(line)

    # Copy images to output directory
    images_dir = food101_dir / "images"

    for class_name in classes:
        print(f"\nProcessing class: {class_name}")

        # Create train directory
        train_class_dir = output_dir / "train" / class_name
        train_class_dir.mkdir(parents=True, exist_ok=True)

        # Copy train images
        if class_name in train_images:
            print(f"  Copying {len(train_images[class_name])} training images...")
            for img_path in train_images[class_name]:
                src = images_dir / f"{img_path}.jpg"
                dst = train_class_dir / f"{img_path.split('/')[-1]}.jpg"
                if src.exists():
                    shutil.copy2(src, dst)

        # Create test directory
        test_class_dir = output_dir / "test" / class_name
        test_class_dir.mkdir(parents=True, exist_ok=True)

        # Copy test images
        if class_name in test_images:
            print(f"  Copying {len(test_images[class_name])} test images...")
            for img_path in test_images[class_name]:
                src = images_dir / f"{img_path}.jpg"
                dst = test_class_dir / f"{img_path.split('/')[-1]}.jpg"
                if src.exists():
                    shutil.copy2(src, dst)

def verify_dataset(output_dir, classes, expected_counts):
    """Verify dataset integrity."""
    output_dir = Path(output_dir)

    print("\n" + "="*50)
    print("Dataset Verification")
    print("="*50)

    all_valid = True

    for split in ["train", "test"]:
        print(f"\n{split.upper()} Split:")
        for class_name in classes:
            class_dir = output_dir / split / class_name
            if not class_dir.exists():
                print(f"  [xmark.circle] {class_name}: Directory not found!")
                all_valid = False
                continue

            count = len(list(class_dir.glob("*.jpg")))
            expected = expected_counts[split]
            status = "[checkmark.circle]" if count == expected else "[exclamationmark.triangle]"
            print(f"  {status} {class_name}: {count} images (expected {expected})")

            if count != expected:
                all_valid = False

    print("\n" + "="*50)
    if all_valid:
        print("[checkmark.circle] Dataset verification PASSED!")
    else:
        print("[exclamationmark.triangle]  Dataset verification found issues")
    print("="*50)

    return all_valid

def main():
    # Paths
    project_root = Path(__file__).parent.parent
    data_raw_dir = project_root / "data" / "raw"
    data_processed_dir = project_root / "data" / "processed"

    print("="*50)
    print("Food Vision Mini - Dataset Preparation")
    print("="*50)
    print(f"Project root: {project_root}")
    print(f"Raw data dir: {data_raw_dir}")
    print(f"Processed data dir: {data_processed_dir}")

    # Step 1: Download dataset
    print("\n[1/4] Downloading Food101 dataset...")
    archive_path = download_food101(data_raw_dir)

    # Step 2: Extract dataset
    print("\n[2/4] Extracting dataset...")
    food101_dir = extract_food101(archive_path, data_raw_dir)

    # Step 3: Filter classes
    print("\n[3/4] Filtering classes...")
    filter_classes(food101_dir, data_processed_dir, CLASSES)

    # Step 4: Verify dataset
    print("\n[4/4] Verifying dataset...")
    verify_dataset(data_processed_dir, CLASSES, EXPECTED_FILES_PER_CLASS)

    print("\n[checkmark.circle] Dataset preparation complete!")
    print(f"\nProcessed dataset location: {data_processed_dir}")
    print(f"  - Train: {data_processed_dir / 'train'}")
    print(f"  - Test: {data_processed_dir / 'test'}")

    # Print dataset summary
    print("\n" + "="*50)
    print("Dataset Summary")
    print("="*50)
    total_train = sum(len(list((data_processed_dir / "train" / cls).glob("*.jpg"))) for cls in CLASSES)
    total_test = sum(len(list((data_processed_dir / "test" / cls).glob("*.jpg"))) for cls in CLASSES)
    print(f"Total training images: {total_train}")
    print(f"Total test images: {total_test}")
    print(f"Total images: {total_train + total_test}")
    print("="*50)

if __name__ == "__main__":
    main()
