"""
Training script for FoodVision Mini.
Supports baseline and improved training with full reproducibility.
"""

import torch
import torch.nn as nn
import torch.optim as optim
from torch.optim.lr_scheduler import CosineAnnealingLR
from pathlib import Path
import argparse
import json
import time
from tqdm import tqdm
import random
import numpy as np
import subprocess

from config import load_config
from models import create_model
from data import create_dataloaders


def set_seed(seed: int, deterministic: bool = True):
    """Set random seeds for reproducibility."""
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    torch.cuda.manual_seed_all(seed)

    if deterministic:
        torch.backends.cudnn.deterministic = True
        torch.backends.cudnn.benchmark = False
    else:
        torch.backends.cudnn.benchmark = True

    print(f"✅ Random seed set to {seed} (deterministic={deterministic})")


def get_git_commit_hash():
    """Get current git commit hash."""
    try:
        result = subprocess.run(
            ['git', 'rev-parse', 'HEAD'],
            capture_output=True,
            text=True,
            check=True
        )
        return result.stdout.strip()
    except:
        return "unknown"


def train_one_epoch(model, train_loader, criterion, optimizer, device, epoch, total_epochs):
    """Train for one epoch."""
    model.train()
    running_loss = 0.0
    correct = 0
    total = 0

    # Progress bar
    pbar = tqdm(train_loader, desc=f"Epoch {epoch}/{total_epochs} [Train]")

    for batch_idx, (images, labels) in enumerate(pbar):
        images, labels = images.to(device), labels.to(device)

        # Forward pass
        optimizer.zero_grad()
        outputs = model(images)
        loss = criterion(outputs, labels)

        # Backward pass
        loss.backward()
        optimizer.step()

        # Metrics
        running_loss += loss.item()
        _, predicted = outputs.max(1)
        total += labels.size(0)
        correct += predicted.eq(labels).sum().item()

        # Update progress bar
        pbar.set_postfix({
            'loss': f"{running_loss / (batch_idx + 1):.4f}",
            'acc': f"{100.0 * correct / total:.2f}%"
        })

    epoch_loss = running_loss / len(train_loader)
    epoch_acc = 100.0 * correct / total

    return epoch_loss, epoch_acc


def evaluate(model, test_loader, criterion, device, split_name="Test"):
    """Evaluate model on test set."""
    model.eval()
    running_loss = 0.0
    correct = 0
    total = 0

    with torch.no_grad():
        pbar = tqdm(test_loader, desc=f"[{split_name}]")
        for images, labels in pbar:
            images, labels = images.to(device), labels.to(device)

            outputs = model(images)
            loss = criterion(outputs, labels)

            running_loss += loss.item()
            _, predicted = outputs.max(1)
            total += labels.size(0)
            correct += predicted.eq(labels).sum().item()

            pbar.set_postfix({
                'loss': f"{running_loss / len(test_loader):.4f}",
                'acc': f"{100.0 * correct / total:.2f}%"
            })

    epoch_loss = running_loss / len(test_loader)
    epoch_acc = 100.0 * correct / total

    return epoch_loss, epoch_acc


def train(config_path: str, output_dir: str = None, device: str = None):
    """
    Main training function.

    Args:
        config_path: Path to config YAML file
        output_dir: Output directory for artifacts (default: artifacts/{config_name})
        device: Device to train on (default: auto-detect)
    """
    # Load configuration
    config = load_config(config_path)
    config.print_summary()

    # Set output directory
    if output_dir is None:
        output_dir = Path("artifacts") / config.name
    else:
        output_dir = Path(output_dir)

    output_dir.mkdir(parents=True, exist_ok=True)
    print(f"Output directory: {output_dir}")

    # Save config
    config.save(output_dir / "config.yaml")

    # Set device
    if device is None:
        device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"Device: {device}")

    # Set random seeds
    set_seed(
        config.reproducibility.seed,
        config.reproducibility.deterministic
    )

    # Get git commit hash
    git_hash = get_git_commit_hash()
    print(f"Git commit: {git_hash}")

    # Create data loaders
    print("\nCreating data loaders...")
    project_root = Path(__file__).parent.parent
    train_loader, test_loader, val_loader = create_dataloaders(
        data_dir=str(project_root / config.data.train_path).replace("/train", ""),
        batch_size=config.training.batch_size,
        augmentation_level=config.data.augmentation,
        image_size=config.data.image_size,
        num_workers=config.data.num_workers,
        val_split=config.data.val_split
    )

    # Create model
    print("Creating model...")
    model = create_model(
        num_classes=config.model.num_classes,
        freeze_backbone=config.model.freeze_backbone,
        dropout=config.model.dropout,
        pretrained=config.model.pretrained,
        device=device
    )

    # Unfreeze last blocks if specified
    if config.model.unfreeze_last_blocks > 0:
        model.unfreeze_last_blocks(config.model.unfreeze_last_blocks)

    # Create optimizer
    print("\nSetting up optimizer...")
    if config.training.discriminative_lr:
        # Use discriminative learning rates
        param_groups = model.get_parameter_groups(
            lr_classifier=config.training.discriminative_lr.get('classifier', config.training.learning_rate),
            lr_last_blocks=config.training.discriminative_lr.get('last_blocks', config.training.learning_rate / 10),
            lr_mid_layers=config.training.discriminative_lr.get('mid_layers', config.training.learning_rate / 100)
        )
        optimizer = optim.Adam(
            param_groups,
            weight_decay=config.training.weight_decay
        )
    else:
        # Standard optimizer
        optimizer = optim.Adam(
            model.parameters(),
            lr=config.training.learning_rate,
            weight_decay=config.training.weight_decay
        )

    # Create scheduler
    scheduler = None
    if config.training.scheduler == "cosine_annealing":
        scheduler = CosineAnnealingLR(
            optimizer,
            T_max=config.training.epochs,
            eta_min=1e-6
        )
        print(f"Using CosineAnnealingLR scheduler")

    # Loss function
    criterion = nn.CrossEntropyLoss()

    # Training metrics
    history = {
        'train_loss': [],
        'train_acc': [],
        'test_loss': [],
        'test_acc': []
    }

    best_test_acc = 0.0
    best_epoch = 0
    epochs_without_improvement = 0

    # Training loop
    print("\n" + "="*50)
    print("Starting Training")
    print("="*50)
    start_time = time.time()

    for epoch in range(1, config.training.epochs + 1):
        # Train
        train_loss, train_acc = train_one_epoch(
            model, train_loader, criterion, optimizer, device, epoch, config.training.epochs
        )

        # Evaluate
        test_loss, test_acc = evaluate(model, test_loader, criterion, device, split_name="Test")

        # Update scheduler
        if scheduler is not None:
            scheduler.step()
            current_lr = scheduler.get_last_lr()[0]
        else:
            current_lr = config.training.learning_rate

        # Save metrics
        history['train_loss'].append(train_loss)
        history['train_acc'].append(train_acc)
        history['test_loss'].append(test_loss)
        history['test_acc'].append(test_acc)

        # Print epoch summary
        print(f"\nEpoch {epoch}/{config.training.epochs}:")
        print(f"  Train Loss: {train_loss:.4f} | Train Acc: {train_acc:.2f}%")
        print(f"  Test Loss:  {test_loss:.4f} | Test Acc:  {test_acc:.2f}%")
        print(f"  LR: {current_lr:.6f}")

        # Save best model
        if test_acc > best_test_acc:
            best_test_acc = test_acc
            best_epoch = epoch
            epochs_without_improvement = 0

            # Save checkpoint
            checkpoint_path = output_dir / "best_model.pth"
            torch.save({
                'epoch': epoch,
                'model_state_dict': model.state_dict(),
                'optimizer_state_dict': optimizer.state_dict(),
                'test_acc': test_acc,
                'test_loss': test_loss,
                'config': config.to_dict()
            }, checkpoint_path)

            print(f"  ✅ New best model saved! (Test Acc: {test_acc:.2f}%)")
        else:
            epochs_without_improvement += 1

        # Early stopping
        if config.training.early_stopping and epochs_without_improvement >= config.training.patience:
            print(f"\n⚠️  Early stopping triggered after {epoch} epochs")
            print(f"  No improvement for {config.training.patience} epochs")
            break

        print("-" * 50)

    # Training complete
    training_time = time.time() - start_time

    print("\n" + "="*50)
    print("Training Complete!")
    print("="*50)
    print(f"Total time: {training_time / 60:.2f} minutes")
    print(f"Best test accuracy: {best_test_acc:.2f}% (epoch {best_epoch})")
    print("="*50)

    # Save training history
    history_path = output_dir / "training_history.json"
    with open(history_path, 'w') as f:
        json.dump(history, f, indent=2)

    # Save final metrics
    metrics = {
        'best_test_acc': best_test_acc,
        'best_epoch': best_epoch,
        'total_epochs': epoch,
        'training_time_minutes': training_time / 60,
        'final_train_acc': history['train_acc'][-1],
        'final_test_acc': history['test_acc'][-1],
        'git_commit': git_hash,
        'config_name': config.name
    }

    metrics_path = output_dir / "metrics.json"
    with open(metrics_path, 'w') as f:
        json.dump(metrics, f, indent=2)

    print(f"\nArtifacts saved to: {output_dir}")
    print(f"  - Config: config.yaml")
    print(f"  - Best model: best_model.pth")
    print(f"  - Training history: training_history.json")
    print(f"  - Metrics: metrics.json")

    return model, history, metrics


def main():
    parser = argparse.ArgumentParser(description="Train FoodVision model")
    parser.add_argument(
        "--config",
        type=str,
        required=True,
        help="Path to config YAML file"
    )
    parser.add_argument(
        "--output-dir",
        type=str,
        default=None,
        help="Output directory for artifacts (default: artifacts/{config_name})"
    )
    parser.add_argument(
        "--device",
        type=str,
        default=None,
        choices=["cpu", "cuda"],
        help="Device to train on (default: auto-detect)"
    )

    args = parser.parse_args()

    # Train
    train(
        config_path=args.config,
        output_dir=args.output_dir,
        device=args.device
    )


if __name__ == "__main__":
    main()
