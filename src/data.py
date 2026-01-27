"""
Dataset and data loading utilities for FoodVision Mini.
"""

import torch
from torch.utils.data import DataLoader, Dataset
from torchvision import datasets, transforms
from torchvision.models import EfficientNet_B2_Weights
from pathlib import Path
from typing import Tuple, Optional

# Class names
CLASS_NAMES = ["pizza", "steak", "sushi"]


def get_transforms(augmentation_level="basic", image_size=224):
    """
    Get image transforms for training and testing.

    Args:
        augmentation_level: "basic" or "enhanced"
        image_size: Target image size (default: 224 for EfficientNetB2)

    Returns:
        Tuple of (train_transform, test_transform)
    """
    # Test transform (no augmentation)
    test_transform = transforms.Compose([
        transforms.Resize(256),
        transforms.CenterCrop(image_size),
        transforms.ToTensor(),
        transforms.Normalize(
            mean=[0.485, 0.456, 0.406],
            std=[0.229, 0.224, 0.225]
        )
    ])

    if augmentation_level == "basic":
        # Basic training transform (minimal augmentation)
        train_transform = transforms.Compose([
            transforms.Resize(256),
            transforms.CenterCrop(image_size),
            transforms.ToTensor(),
            transforms.Normalize(
                mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225]
            )
        ])
    elif augmentation_level == "enhanced":
        # Enhanced training transform (with augmentation)
        train_transform = transforms.Compose([
            transforms.RandomResizedCrop(image_size, scale=(0.8, 1.0)),
            transforms.RandomHorizontalFlip(p=0.5),
            transforms.ColorJitter(
                brightness=0.2,
                contrast=0.2,
                saturation=0.2,
                hue=0.1
            ),
            transforms.RandomRotation(degrees=15),
            transforms.ToTensor(),
            transforms.Normalize(
                mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225]
            )
        ])
    else:
        raise ValueError(f"Unknown augmentation level: {augmentation_level}")

    return train_transform, test_transform


def get_efficientnet_transforms():
    """
    Get EfficientNet_B2 default transforms.
    Uses the official EfficientNet preprocessing.
    """
    weights = EfficientNet_B2_Weights.DEFAULT
    return weights.transforms()


def create_dataloaders(
    data_dir: str,
    batch_size: int = 32,
    augmentation_level: str = "basic",
    image_size: int = 224,
    num_workers: int = 4,
    pin_memory: bool = True,
    val_split: float = 0.0
) -> Tuple[DataLoader, DataLoader, Optional[DataLoader]]:
    """
    Create train and test dataloaders.

    Args:
        data_dir: Path to processed data directory (contains train/ and test/)
        batch_size: Batch size for training
        augmentation_level: "basic" or "enhanced"
        image_size: Target image size
        num_workers: Number of worker processes for data loading
        pin_memory: Whether to pin memory for GPU training
        val_split: Fraction of training data to use for validation (0.0-1.0)

    Returns:
        Tuple of (train_loader, test_loader, val_loader)
        val_loader is None if val_split == 0.0
    """
    data_dir = Path(data_dir)
    train_dir = data_dir / "train"
    test_dir = data_dir / "test"

    if not train_dir.exists() or not test_dir.exists():
        raise FileNotFoundError(
            f"Data directories not found. Please run scripts/download_data.py first.\n"
            f"Expected: {train_dir} and {test_dir}"
        )

    # Get transforms
    train_transform, test_transform = get_transforms(
        augmentation_level=augmentation_level,
        image_size=image_size
    )

    # Create datasets
    full_train_dataset = datasets.ImageFolder(
        root=train_dir,
        transform=train_transform
    )

    test_dataset = datasets.ImageFolder(
        root=test_dir,
        transform=test_transform
    )

    # Create validation split if requested
    val_loader = None
    if val_split > 0.0:
        # Split training data
        train_size = int((1.0 - val_split) * len(full_train_dataset))
        val_size = len(full_train_dataset) - train_size

        train_dataset, val_dataset = torch.utils.data.random_split(
            full_train_dataset,
            [train_size, val_size],
            generator=torch.Generator().manual_seed(42)
        )

        # Create validation loader
        val_loader = DataLoader(
            val_dataset,
            batch_size=batch_size,
            shuffle=False,
            num_workers=num_workers,
            pin_memory=pin_memory
        )

        print(f"Created validation split: {val_size} samples ({val_split*100:.1f}%)")
    else:
        train_dataset = full_train_dataset

    # Create dataloaders
    train_loader = DataLoader(
        train_dataset,
        batch_size=batch_size,
        shuffle=True,
        num_workers=num_workers,
        pin_memory=pin_memory
    )

    test_loader = DataLoader(
        test_dataset,
        batch_size=batch_size,
        shuffle=False,
        num_workers=num_workers,
        pin_memory=pin_memory
    )

    # Print dataset info
    print("\n" + "="*50)
    print("Dataset Information")
    print("="*50)
    print(f"Train samples: {len(train_dataset)}")
    if val_loader:
        print(f"Val samples: {len(val_dataset)}")
    print(f"Test samples: {len(test_dataset)}")
    print(f"Classes: {CLASS_NAMES}")
    print(f"Batch size: {batch_size}")
    print(f"Augmentation: {augmentation_level}")
    print("="*50 + "\n")

    return train_loader, test_loader, val_loader


def get_class_weights(data_dir: str, device: str = "cpu") -> torch.Tensor:
    """
    Compute class weights for handling class imbalance.
    Weights are inversely proportional to class frequencies.

    Args:
        data_dir: Path to processed data directory
        device: Device to put weights on

    Returns:
        Tensor of class weights
    """
    data_dir = Path(data_dir)
    train_dir = data_dir / "train"

    # Count samples per class
    class_counts = []
    for class_name in CLASS_NAMES:
        class_dir = train_dir / class_name
        count = len(list(class_dir.glob("*.jpg")))
        class_counts.append(count)

    # Compute weights (inverse of frequency)
    total = sum(class_counts)
    weights = [total / count for count in class_counts]

    # Normalize weights
    weights = torch.tensor(weights, dtype=torch.float32, device=device)
    weights = weights / weights.sum() * len(weights)

    print("Class weights:")
    for i, class_name in enumerate(CLASS_NAMES):
        print(f"  {class_name}: {weights[i]:.4f} ({class_counts[i]} samples)")

    return weights


if __name__ == "__main__":
    # Test data loading
    import sys
    from pathlib import Path

    project_root = Path(__file__).parent.parent
    data_dir = project_root / "data" / "processed"

    print("Testing data loading...")

    try:
        train_loader, test_loader, _ = create_dataloaders(
            data_dir=str(data_dir),
            batch_size=32,
            augmentation_level="basic",
            num_workers=0  # 0 for testing
        )

        # Test one batch
        images, labels = next(iter(train_loader))
        print(f"\nBatch shape: {images.shape}")
        print(f"Labels shape: {labels.shape}")
        print(f"Image range: [{images.min():.3f}, {images.max():.3f}]")
        print(f"Label values: {labels.unique()}")

        print("\n✅ Data loading test passed!")

    except Exception as e:
        print(f"\n❌ Data loading test failed: {e}")
        sys.exit(1)
