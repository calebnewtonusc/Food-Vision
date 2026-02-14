"""
Comprehensive evaluation script for FoodVision models.
Generates detailed evaluation report with all metrics.
"""

import torch
import numpy as np
from pathlib import Path
import argparse
import json
import sys

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from src.models import FoodVisionModel
from src.data import create_dataloaders, CLASS_NAMES
from evalharness.metrics.compute import compute_classification_metrics, print_metrics
from evalharness.confusion.matrix import (
    compute_confusion_matrix,
    plot_confusion_matrix,
    print_confusion_analysis
)
from evalharness.calibration.calibration import (
    compute_expected_calibration_error,
    plot_reliability_diagram,
    print_calibration_summary
)
from evalharness.perf.latency import (
    profile_inference_latency,
    profile_model_size,
    print_latency_report
)


def collect_predictions(model, test_loader, device):
    """
    Collect predictions and probabilities from model.

    Args:
        model: PyTorch model
        test_loader: Test data loader
        device: Device to run on

    Returns:
        Tuple of (y_true, y_pred, y_probs)
    """
    model.eval()
    model = model.to(device)

    all_labels = []
    all_preds = []
    all_probs = []

    print("\nCollecting predictions...")
    with torch.no_grad():
        for images, labels in test_loader:
            images = images.to(device)

            # Get predictions
            outputs = model(images)
            probs = torch.softmax(outputs, dim=1)

            all_labels.append(labels.cpu().numpy())
            all_preds.append(outputs.argmax(dim=1).cpu().numpy())
            all_probs.append(probs.cpu().numpy())

    y_true = np.concatenate(all_labels)
    y_pred = np.concatenate(all_preds)
    y_probs = np.concatenate(all_probs)

    return y_true, y_pred, y_probs


def evaluate_model(
    model_path: str,
    data_dir: str,
    output_dir: str,
    device: str = None,
    batch_size: int = 32
):
    """
    Run comprehensive evaluation on a trained model.

    Args:
        model_path: Path to trained model checkpoint (.pth)
        data_dir: Path to processed data directory
        output_dir: Output directory for evaluation artifacts
        device: Device to run on (default: auto-detect)
        batch_size: Batch size for evaluation
    """
    print("="*70)
    print("FoodVision Model Evaluation")
    print("="*70)

    # Set device
    if device is None:
        device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"Device: {device}")

    # Create output directory
    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    print(f"Output directory: {output_dir}")

    # Load model
    print(f"\nLoading model from {model_path}...")
    model = FoodVisionModel(num_classes=3)

    checkpoint = torch.load(model_path, map_location=device)
    if 'model_state_dict' in checkpoint:
        model.load_state_dict(checkpoint['model_state_dict'])
    else:
        model.load_state_dict(checkpoint)

    model = model.to(device)
    model.eval()
    print("[checkmark.circle] Model loaded successfully")

    # Print model summary
    model.print_summary()

    # Create data loader
    print("\nLoading test data...")
    _, test_loader, _ = create_dataloaders(
        data_dir=data_dir,
        batch_size=batch_size,
        augmentation_level="basic",
        num_workers=4,
        val_split=0.0
    )

    # Collect predictions
    y_true, y_pred, y_probs = collect_predictions(model, test_loader, device)
    print(f"[checkmark.circle] Collected predictions for {len(y_true)} samples")

    # =========================================================================
    # 1. Classification Metrics
    # =========================================================================
    print("\n" + "="*70)
    print("1. Computing Classification Metrics")
    print("="*70)

    metrics = compute_classification_metrics(y_true, y_pred, y_probs, CLASS_NAMES)
    print_metrics(metrics)

    # Save metrics
    metrics_path = output_dir / "metrics.json"
    with open(metrics_path, 'w') as f:
        json.dump(metrics, f, indent=2)
    print(f"\n[checkmark.circle] Metrics saved to {metrics_path}")

    # =========================================================================
    # 2. Confusion Matrix
    # =========================================================================
    print("\n" + "="*70)
    print("2. Generating Confusion Matrix")
    print("="*70)

    cm = compute_confusion_matrix(y_true, y_pred, CLASS_NAMES)
    print_confusion_analysis(cm, CLASS_NAMES)

    # Plot and save confusion matrix
    cm_path = output_dir / "confusion_matrix.png"
    plot_confusion_matrix(cm, CLASS_NAMES, save_path=str(cm_path), normalize=False)

    cm_norm_path = output_dir / "confusion_matrix_normalized.png"
    plot_confusion_matrix(cm, CLASS_NAMES, save_path=str(cm_norm_path), normalize=True)

    print(f"[checkmark.circle] Confusion matrices saved to {output_dir}")

    # =========================================================================
    # 3. Calibration Analysis
    # =========================================================================
    print("\n" + "="*70)
    print("3. Analyzing Model Calibration")
    print("="*70)

    ece, _, _, _ = compute_expected_calibration_error(y_true, y_pred, y_probs, n_bins=10)
    print_calibration_summary(y_true, y_pred, y_probs, n_bins=10)

    # Plot reliability diagram
    reliability_path = output_dir / "reliability_diagram.png"
    plot_reliability_diagram(y_true, y_pred, y_probs, save_path=str(reliability_path))

    print(f"[checkmark.circle] Calibration plots saved to {output_dir}")

    # =========================================================================
    # 4. Performance Profiling
    # =========================================================================
    print("\n" + "="*70)
    print("4. Profiling Inference Performance")
    print("="*70)

    # Model size
    model_stats = profile_model_size(model)

    # Latency profiling
    latency_stats = profile_inference_latency(
        model,
        test_loader,
        device='cpu',  # Always profile on CPU for consistency
        n_runs=100,
        warmup_runs=5
    )

    print_latency_report(latency_stats, model_stats)

    # Save performance report
    perf_report = {
        'model_size': model_stats,
        'latency': latency_stats
    }
    perf_path = output_dir / "performance.json"
    with open(perf_path, 'w') as f:
        json.dump(perf_report, f, indent=2)

    print(f"[checkmark.circle] Performance report saved to {perf_path}")

    # =========================================================================
    # 5. Summary Report
    # =========================================================================
    print("\n" + "="*70)
    print("Evaluation Summary")
    print("="*70)

    summary = {
        'model_path': str(model_path),
        'data_dir': str(data_dir),
        'device': device,
        'total_samples': int(len(y_true)),
        'accuracy': float(metrics['overall']['accuracy']),
        'f1_macro': float(metrics['overall']['f1_macro']),
        'ece': float(ece),
        'latency_p50_ms': float(latency_stats['p50_ms']),
        'latency_p95_ms': float(latency_stats['p95_ms']),
        'model_size_mb': float(model_stats['total_size_mb']),
        'throughput_images_per_sec': float(latency_stats['throughput_images_per_sec'])
    }

    print("\nKey Results:")
    print(f"  Accuracy:        {summary['accuracy']*100:.2f}%")
    print(f"  F1 (macro):      {summary['f1_macro']:.4f}")
    print(f"  ECE:             {summary['ece']:.4f}")
    print(f"  Latency (P50):   {summary['latency_p50_ms']:.2f} ms")
    print(f"  Latency (P95):   {summary['latency_p95_ms']:.2f} ms")
    print(f"  Model Size:      {summary['model_size_mb']:.2f} MB")
    print(f"  Throughput:      {summary['throughput_images_per_sec']:.2f} images/sec")

    # Save summary
    summary_path = output_dir / "evaluation_summary.json"
    with open(summary_path, 'w') as f:
        json.dump(summary, f, indent=2)

    print("\n" + "="*70)
    print("[checkmark.circle] Evaluation Complete!")
    print("="*70)
    print(f"\nAll artifacts saved to: {output_dir}")
    print(f"  - Classification metrics: metrics.json")
    print(f"  - Confusion matrix: confusion_matrix.png")
    print(f"  - Calibration plot: reliability_diagram.png")
    print(f"  - Performance report: performance.json")
    print(f"  - Summary: evaluation_summary.json")
    print("="*70)


def main():
    parser = argparse.ArgumentParser(description="Evaluate FoodVision model")
    parser.add_argument(
        "--model",
        type=str,
        required=True,
        help="Path to trained model checkpoint (.pth)"
    )
    parser.add_argument(
        "--data-dir",
        type=str,
        default="data/processed",
        help="Path to processed data directory (default: data/processed)"
    )
    parser.add_argument(
        "--output-dir",
        type=str,
        default=None,
        help="Output directory for evaluation artifacts (default: same as model dir)"
    )
    parser.add_argument(
        "--device",
        type=str,
        default=None,
        choices=["cpu", "cuda"],
        help="Device to run on (default: auto-detect)"
    )
    parser.add_argument(
        "--batch-size",
        type=int,
        default=32,
        help="Batch size for evaluation (default: 32)"
    )

    args = parser.parse_args()

    # Set output directory
    if args.output_dir is None:
        model_path = Path(args.model)
        if model_path.parent.name in ["baseline", "improved"]:
            args.output_dir = str(model_path.parent)
        else:
            args.output_dir = str(model_path.parent / "evaluation")

    # Run evaluation
    evaluate_model(
        model_path=args.model,
        data_dir=args.data_dir,
        output_dir=args.output_dir,
        device=args.device,
        batch_size=args.batch_size
    )


if __name__ == "__main__":
    main()
