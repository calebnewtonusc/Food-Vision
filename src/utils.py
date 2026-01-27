"""
Utility functions for FoodVision Mini.
"""

import torch
import random
import numpy as np
from pathlib import Path
import json


def set_seed(seed: int, deterministic: bool = True):
    """
    Set random seeds for reproducibility.

    Args:
        seed: Random seed
        deterministic: Whether to use deterministic algorithms
    """
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    torch.cuda.manual_seed_all(seed)

    if deterministic:
        torch.backends.cudnn.deterministic = True
        torch.backends.cudnn.benchmark = False
    else:
        torch.backends.cudnn.benchmark = True


def save_checkpoint(model, optimizer, epoch, metrics, path):
    """
    Save model checkpoint.

    Args:
        model: PyTorch model
        optimizer: Optimizer
        epoch: Current epoch
        metrics: Training metrics dict
        path: Save path
    """
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)

    checkpoint = {
        'epoch': epoch,
        'model_state_dict': model.state_dict(),
        'optimizer_state_dict': optimizer.state_dict(),
        'metrics': metrics
    }

    torch.save(checkpoint, path)


def load_checkpoint(model, optimizer, path, device='cpu'):
    """
    Load model checkpoint.

    Args:
        model: PyTorch model
        optimizer: Optimizer
        path: Checkpoint path
        device: Device to load on

    Returns:
        Tuple of (model, optimizer, epoch, metrics)
    """
    checkpoint = torch.load(path, map_location=device)

    model.load_state_dict(checkpoint['model_state_dict'])
    if optimizer is not None:
        optimizer.load_state_dict(checkpoint['optimizer_state_dict'])

    epoch = checkpoint.get('epoch', 0)
    metrics = checkpoint.get('metrics', {})

    return model, optimizer, epoch, metrics


def count_parameters(model, trainable_only=False):
    """Count model parameters."""
    if trainable_only:
        return sum(p.numel() for p in model.parameters() if p.requires_grad)
    else:
        return sum(p.numel() for p in model.parameters())


def get_model_size_mb(model):
    """Get model size in MB."""
    param_size = sum(p.numel() * p.element_size() for p in model.parameters())
    buffer_size = sum(b.numel() * b.element_size() for b in model.buffers())
    size_mb = (param_size + buffer_size) / (1024 ** 2)
    return size_mb


def save_json(data, path):
    """Save data to JSON file."""
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)

    with open(path, 'w') as f:
        json.dump(data, f, indent=2)


def load_json(path):
    """Load data from JSON file."""
    with open(path, 'r') as f:
        return json.load(f)


class AverageMeter:
    """Computes and stores the average and current value."""

    def __init__(self):
        self.reset()

    def reset(self):
        self.val = 0
        self.avg = 0
        self.sum = 0
        self.count = 0

    def update(self, val, n=1):
        self.val = val
        self.sum += val * n
        self.count += n
        self.avg = self.sum / self.count
