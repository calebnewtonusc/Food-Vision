"""
Model calibration analysis for FoodVision evaluation.
Measures how well predicted probabilities match actual outcomes.
"""

import numpy as np
import matplotlib.pyplot as plt
from pathlib import Path
from typing import Tuple, List


def compute_expected_calibration_error(
    y_true: np.ndarray,
    y_pred: np.ndarray,
    y_probs: np.ndarray,
    n_bins: int = 10
) -> Tuple[float, np.ndarray, np.ndarray, np.ndarray]:
    """
    Compute Expected Calibration Error (ECE).

    ECE measures the difference between predicted confidence and actual accuracy
    across bins of predictions.

    Args:
        y_true: True labels (N,)
        y_pred: Predicted labels (N,)
        y_probs: Predicted probabilities (N, num_classes)
        n_bins: Number of bins for calibration curve

    Returns:
        Tuple of (ece, bin_accuracies, bin_confidences, bin_counts)
    """
    # Get predicted probabilities for predicted class
    confidences = np.max(y_probs, axis=1)
    predictions = np.argmax(y_probs, axis=1)
    accuracies = (predictions == y_true)

    # Create bins
    bin_boundaries = np.linspace(0, 1, n_bins + 1)
    bin_accuracies = []
    bin_confidences = []
    bin_counts = []

    ece = 0.0
    total_samples = len(y_true)

    for i in range(n_bins):
        # Find samples in this bin
        bin_mask = (confidences > bin_boundaries[i]) & (confidences <= bin_boundaries[i + 1])
        bin_count = bin_mask.sum()

        if bin_count > 0:
            # Compute bin accuracy and confidence
            bin_acc = accuracies[bin_mask].mean()
            bin_conf = confidences[bin_mask].mean()

            # Add to ECE
            ece += np.abs(bin_acc - bin_conf) * bin_count / total_samples

            bin_accuracies.append(bin_acc)
            bin_confidences.append(bin_conf)
            bin_counts.append(bin_count)
        else:
            # Use NaN for empty bins so they don't get plotted
            bin_accuracies.append(np.nan)
            bin_confidences.append(np.nan)
            bin_counts.append(0)

    return ece, np.array(bin_accuracies), np.array(bin_confidences), np.array(bin_counts)


def plot_reliability_diagram(
    y_true: np.ndarray,
    y_pred: np.ndarray,
    y_probs: np.ndarray,
    save_path: str = None,
    n_bins: int = 10
) -> plt.Figure:
    """
    Plot reliability diagram (calibration curve).

    Args:
        y_true: True labels
        y_pred: Predicted labels
        y_probs: Predicted probabilities
        save_path: Path to save figure (optional)
        n_bins: Number of bins

    Returns:
        Matplotlib figure
    """
    # Compute calibration
    ece, bin_accuracies, bin_confidences, bin_counts = compute_expected_calibration_error(
        y_true, y_pred, y_probs, n_bins
    )

    # Filter out empty bins (NaN values) and bins with too few samples (< 10)
    min_samples = 10
    valid_mask = ~np.isnan(bin_confidences) & (bin_counts >= min_samples)
    valid_confidences = bin_confidences[valid_mask]
    valid_accuracies = bin_accuracies[valid_mask]
    valid_counts = bin_counts[valid_mask]

    # Create figure
    fig, ax = plt.subplots(figsize=(10, 8))

    # Plot perfect calibration line
    ax.plot([0, 1], [0, 1], 'k--', label='Perfect Calibration', linewidth=2)

    # Plot model calibration (only non-empty bins)
    ax.plot(valid_confidences, valid_accuracies, 'o-', label='Model Calibration',
            markersize=10, linewidth=2, color='#2E86AB')

    # Add bars showing sample count per bin
    ax2 = ax.twinx()
    bar_width = 1.0 / n_bins * 0.8  # Slightly narrower bars
    ax2.bar(valid_confidences, valid_counts, width=bar_width, alpha=0.3,
            color='gray', label='Sample Count')
    ax2.set_ylabel('Sample Count', fontsize=12)

    # Labels and title
    ax.set_xlabel('Predicted Confidence', fontsize=14, fontweight='bold')
    ax.set_ylabel('Actual Accuracy', fontsize=14, fontweight='bold')
    ax.set_title(f'Reliability Diagram (ECE = {ece:.4f})', fontsize=16, fontweight='bold', pad=20)

    ax.grid(True, alpha=0.3)
    ax.set_xlim([0, 1])
    ax.set_ylim([0, 1])

    # Legend
    lines1, labels1 = ax.get_legend_handles_labels()
    lines2, labels2 = ax2.get_legend_handles_labels()
    ax.legend(lines1 + lines2, labels1 + labels2, loc='upper left', fontsize=12)

    plt.tight_layout()

    if save_path:
        save_path = Path(save_path)
        save_path.parent.mkdir(parents=True, exist_ok=True)
        fig.savefig(save_path, dpi=300, bbox_inches='tight')
        print(f"Reliability diagram saved to {save_path}")

    return fig


def analyze_confidence_errors(
    y_true: np.ndarray,
    y_pred: np.ndarray,
    y_probs: np.ndarray,
    top_k: int = 10
) -> Tuple[List, List]:
    """
    Find overconfident and underconfident predictions.

    Args:
        y_true: True labels
        y_pred: Predicted labels
        y_probs: Predicted probabilities
        top_k: Number of examples to return for each category

    Returns:
        Tuple of (overconfident_indices, underconfident_indices)
    """
    confidences = np.max(y_probs, axis=1)
    predictions = np.argmax(y_probs, axis=1)

    # Overconfident: high confidence, wrong prediction
    wrong_mask = predictions != y_true
    overconfident_scores = confidences * wrong_mask
    overconfident_indices = np.argsort(overconfident_scores)[::-1][:top_k]
    overconfident_indices = overconfident_indices[overconfident_scores[overconfident_indices] > 0]

    # Underconfident: low confidence, correct prediction
    correct_mask = predictions == y_true
    underconfident_scores = (1 - confidences) * correct_mask
    underconfident_indices = np.argsort(underconfident_scores)[::-1][:top_k]
    underconfident_indices = underconfident_indices[underconfident_scores[underconfident_indices] > 0]

    return overconfident_indices.tolist(), underconfident_indices.tolist()


def print_calibration_summary(
    y_true: np.ndarray,
    y_pred: np.ndarray,
    y_probs: np.ndarray,
    n_bins: int = 10
):
    """Print calibration analysis summary."""
    # Compute ECE
    ece, bin_accuracies, bin_confidences, bin_counts = compute_expected_calibration_error(
        y_true, y_pred, y_probs, n_bins
    )

    # Get confidence statistics
    confidences = np.max(y_probs, axis=1)
    predictions = np.argmax(y_probs, axis=1)
    correct_mask = predictions == y_true

    mean_conf_correct = confidences[correct_mask].mean()
    mean_conf_wrong = confidences[~correct_mask].mean() if (~correct_mask).any() else 0.0

    print("\n" + "="*60)
    print("Calibration Analysis")
    print("="*60)

    print(f"\nExpected Calibration Error (ECE): {ece:.4f}")
    print(f"  Lower is better (0 = perfect calibration)")

    print(f"\nConfidence Statistics:")
    print(f"  Mean confidence (correct predictions): {mean_conf_correct:.4f}")
    print(f"  Mean confidence (wrong predictions):   {mean_conf_wrong:.4f}")
    print(f"  Overall mean confidence:               {confidences.mean():.4f}")

    print(f"\nCalibration Bins:")
    print(f"{'Bin Range':<20} {'Confidence':<15} {'Accuracy':<15} {'Count':<10}")
    print("-" * 62)
    for i in range(n_bins):
        bin_start = i / n_bins
        bin_end = (i + 1) / n_bins
        if bin_counts[i] > 0:
            print(
                f"{f'[{bin_start:.2f}, {bin_end:.2f}]':<20} "
                f"{bin_confidences[i]:>13.4f}  "
                f"{bin_accuracies[i]:>13.4f}  "
                f"{int(bin_counts[i]):<10}"
            )

    print("="*60)


if __name__ == "__main__":
    # Test with dummy data
    np.random.seed(42)
    n_samples = 750
    n_classes = 3

    # Generate dummy predictions (90% accuracy, well-calibrated)
    y_true = np.random.randint(0, n_classes, n_samples)
    y_pred = y_true.copy()

    # Add 10% errors
    error_indices = np.random.choice(n_samples, size=int(n_samples * 0.1), replace=False)
    y_pred[error_indices] = np.random.randint(0, n_classes, len(error_indices))

    # Generate probabilities (higher for correct predictions)
    y_probs = np.zeros((n_samples, n_classes))
    for i in range(n_samples):
        if y_pred[i] == y_true[i]:
            # Correct prediction: high confidence
            y_probs[i, y_pred[i]] = np.random.uniform(0.7, 0.95)
        else:
            # Wrong prediction: moderate confidence
            y_probs[i, y_pred[i]] = np.random.uniform(0.4, 0.7)

        # Distribute remaining probability
        remaining = 1 - y_probs[i, y_pred[i]]
        other_classes = [j for j in range(n_classes) if j != y_pred[i]]
        y_probs[i, other_classes] = np.random.dirichlet(np.ones(len(other_classes))) * remaining

    # Print analysis
    print_calibration_summary(y_true, y_pred, y_probs)

    # Plot reliability diagram
    fig = plot_reliability_diagram(y_true, y_pred, y_probs, save_path="test_reliability.png")
    print("\n✅ Calibration test complete!")

    # Cleanup
    Path("test_reliability.png").unlink(missing_ok=True)
