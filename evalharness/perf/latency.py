"""
Performance profiling for FoodVision inference.
Measures CPU latency and throughput.
"""

import torch
import time
import numpy as np
from pathlib import Path
from typing import Dict
from tqdm import tqdm


def profile_inference_latency(
    model: torch.nn.Module,
    test_loader: torch.utils.data.DataLoader,
    device: str = 'cpu',
    n_runs: int = 100,
    warmup_runs: int = 5
) -> Dict:
    """
    Profile model inference latency on CPU.

    Args:
        model: PyTorch model
        test_loader: Test data loader
        device: Device to run on (should be 'cpu' for accurate profiling)
        n_runs: Number of inference runs to measure
        warmup_runs: Number of warmup runs (excluded from measurements)

    Returns:
        Dictionary of latency statistics
    """
    model.eval()
    model = model.to(device)

    latencies = []
    batch_sizes = []

    print(f"\nProfiling inference latency on {device.upper()}...")
    print(f"Warmup runs: {warmup_runs}, Measurement runs: {n_runs}")

    with torch.no_grad():
        # Warmup
        print("Warming up...")
        for i, (images, _) in enumerate(test_loader):
            if i >= warmup_runs:
                break
            images = images.to(device)
            _ = model(images)

        # Measure latency
        print("Measuring latency...")
        pbar = tqdm(test_loader, total=min(n_runs, len(test_loader)), desc="Profiling")
        for i, (images, _) in enumerate(pbar):
            if i >= n_runs:
                break

            images = images.to(device)
            batch_size = images.size(0)

            # Synchronize (important for accurate timing)
            if device == 'cuda':
                torch.cuda.synchronize()

            # Measure inference time
            start = time.perf_counter()
            _ = model(images)
            if device == 'cuda':
                torch.cuda.synchronize()
            end = time.perf_counter()

            latency_ms = (end - start) * 1000
            latencies.append(latency_ms)
            batch_sizes.append(batch_size)

            pbar.set_postfix({
                'latency': f"{latency_ms:.2f}ms",
                'batch': batch_size
            })

    latencies = np.array(latencies)
    batch_sizes = np.array(batch_sizes)

    # Compute statistics
    stats = {
        'mean_ms': float(np.mean(latencies)),
        'std_ms': float(np.std(latencies)),
        'min_ms': float(np.min(latencies)),
        'max_ms': float(np.max(latencies)),
        'p50_ms': float(np.percentile(latencies, 50)),
        'p95_ms': float(np.percentile(latencies, 95)),
        'p99_ms': float(np.percentile(latencies, 99)),
        'mean_batch_size': float(np.mean(batch_sizes)),
        'throughput_images_per_sec': float(np.sum(batch_sizes) / (np.sum(latencies) / 1000))
    }

    return stats


def profile_model_size(model: torch.nn.Module) -> Dict:
    """
    Profile model size and parameter count.

    Args:
        model: PyTorch model

    Returns:
        Dictionary of model size statistics
    """
    # Count parameters
    total_params = sum(p.numel() for p in model.parameters())
    trainable_params = sum(p.numel() for p in model.parameters() if p.requires_grad)

    # Compute size in MB
    param_size = sum(p.numel() * p.element_size() for p in model.parameters())
    buffer_size = sum(b.numel() * b.element_size() for b in model.buffers())
    total_size_bytes = param_size + buffer_size
    total_size_mb = total_size_bytes / (1024 ** 2)

    return {
        'total_params': int(total_params),
        'trainable_params': int(trainable_params),
        'total_size_mb': float(total_size_mb),
        'total_size_bytes': int(total_size_bytes)
    }


def print_latency_report(latency_stats: Dict, model_stats: Dict):
    """Print latency profiling report."""
    print("\n" + "="*60)
    print("Performance Profiling Report")
    print("="*60)

    print("\nModel Size:")
    print(f"  Total parameters: {model_stats['total_params']:,}")
    print(f"  Trainable parameters: {model_stats['trainable_params']:,}")
    print(f"  Model size: {model_stats['total_size_mb']:.2f} MB")

    print("\nInference Latency (CPU):")
    print(f"  Mean:   {latency_stats['mean_ms']:.2f} ms")
    print(f"  Std:    {latency_stats['std_ms']:.2f} ms")
    print(f"  Min:    {latency_stats['min_ms']:.2f} ms")
    print(f"  Max:    {latency_stats['max_ms']:.2f} ms")
    print(f"  P50:    {latency_stats['p50_ms']:.2f} ms")
    print(f"  P95:    {latency_stats['p95_ms']:.2f} ms")
    print(f"  P99:    {latency_stats['p99_ms']:.2f} ms")

    print("\nThroughput:")
    print(f"  Images/second: {latency_stats['throughput_images_per_sec']:.2f}")
    print(f"  Mean batch size: {latency_stats['mean_batch_size']:.1f}")

    print("="*60)


def save_latency_report(latency_stats: Dict, model_stats: Dict, output_path: str):
    """Save latency report to JSON."""
    output_path = Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    report = {
        'model_size': model_stats,
        'latency': latency_stats
    }

    import json
    with open(output_path, 'w') as f:
        json.dump(report, f, indent=2)

    print(f"\nLatency report saved to {output_path}")


if __name__ == "__main__":
    # Test with dummy model
    import torch.nn as nn
    from torch.utils.data import TensorDataset, DataLoader

    print("Testing latency profiling...\n")

    # Create dummy model
    class DummyModel(nn.Module):
        def __init__(self):
            super().__init__()
            self.conv = nn.Conv2d(3, 64, 3, padding=1)
            self.fc = nn.Linear(64 * 224 * 224, 3)

        def forward(self, x):
            x = self.conv(x)
            x = x.view(x.size(0), -1)
            return self.fc(x)

    model = DummyModel()

    # Create dummy data
    dummy_images = torch.randn(100, 3, 224, 224)
    dummy_labels = torch.randint(0, 3, (100,))
    dataset = TensorDataset(dummy_images, dummy_labels)
    loader = DataLoader(dataset, batch_size=16, shuffle=False)

    # Profile model size
    model_stats = profile_model_size(model)

    # Profile latency
    latency_stats = profile_inference_latency(
        model, loader, device='cpu', n_runs=20, warmup_runs=3
    )

    # Print report
    print_latency_report(latency_stats, model_stats)

    print("\n✅ Latency profiling test complete!")
