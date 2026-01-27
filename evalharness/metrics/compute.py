"""
Classification metrics computation for FoodVision evaluation.
"""

import numpy as np
from sklearn.metrics import (
    accuracy_score,
    f1_score,
    precision_score,
    recall_score,
    top_k_accuracy_score
)
from typing import Dict, List


def compute_classification_metrics(
    y_true: np.ndarray,
    y_pred: np.ndarray,
    y_probs: np.ndarray,
    class_names: List[str]
) -> Dict:
    """
    Compute comprehensive classification metrics.

    Args:
        y_true: True labels (N,)
        y_pred: Predicted labels (N,)
        y_probs: Predicted probabilities (N, num_classes)
        class_names: List of class names

    Returns:
        Dictionary of metrics
    """
    num_classes = len(class_names)

    # Overall metrics
    accuracy = accuracy_score(y_true, y_pred)
    f1_macro = f1_score(y_true, y_pred, average='macro')
    f1_weighted = f1_score(y_true, y_pred, average='weighted')

    # Per-class metrics
    f1_per_class = f1_score(y_true, y_pred, average=None, labels=range(num_classes))
    precision_per_class = precision_score(y_true, y_pred, average=None, labels=range(num_classes), zero_division=0)
    recall_per_class = recall_score(y_true, y_pred, average=None, labels=range(num_classes), zero_division=0)

    # Top-k accuracy (for k <= num_classes)
    top_k_acc = {}
    for k in range(1, min(num_classes + 1, 6)):  # up to top-5
        top_k_acc[f'top_{k}'] = top_k_accuracy_score(y_true, y_probs, k=k, labels=range(num_classes))

    # Per-class accuracy
    per_class_acc = []
    for i in range(num_classes):
        class_mask = y_true == i
        if class_mask.sum() > 0:
            class_acc = (y_pred[class_mask] == i).sum() / class_mask.sum()
        else:
            class_acc = 0.0
        per_class_acc.append(class_acc)

    # Build metrics dictionary
    metrics = {
        'overall': {
            'accuracy': float(accuracy),
            'f1_macro': float(f1_macro),
            'f1_weighted': float(f1_weighted)
        },
        'top_k_accuracy': {k: float(v) for k, v in top_k_acc.items()},
        'per_class': {}
    }

    for i, class_name in enumerate(class_names):
        metrics['per_class'][class_name] = {
            'accuracy': float(per_class_acc[i]),
            'f1': float(f1_per_class[i]),
            'precision': float(precision_per_class[i]),
            'recall': float(recall_per_class[i])
        }

    return metrics


def print_metrics(metrics: Dict):
    """Print metrics in a readable format."""
    print("\n" + "="*60)
    print("Classification Metrics")
    print("="*60)

    # Overall metrics
    print("\nOverall:")
    print(f"  Accuracy:     {metrics['overall']['accuracy']*100:.2f}%")
    print(f"  F1 (macro):   {metrics['overall']['f1_macro']:.4f}")
    print(f"  F1 (weighted): {metrics['overall']['f1_weighted']:.4f}")

    # Top-k accuracy
    print("\nTop-k Accuracy:")
    for k, acc in metrics['top_k_accuracy'].items():
        print(f"  {k.replace('_', '-')}: {acc*100:.2f}%")

    # Per-class metrics
    print("\nPer-Class Metrics:")
    print(f"{'Class':<15} {'Accuracy':<12} {'F1':<12} {'Precision':<12} {'Recall':<12}")
    print("-" * 63)
    for class_name, class_metrics in metrics['per_class'].items():
        print(
            f"{class_name:<15} "
            f"{class_metrics['accuracy']*100:>10.2f}%  "
            f"{class_metrics['f1']:>10.4f}  "
            f"{class_metrics['precision']:>10.4f}  "
            f"{class_metrics['recall']:>10.4f}"
        )

    print("="*60)


if __name__ == "__main__":
    # Test with dummy data
    np.random.seed(42)
    n_samples = 750
    n_classes = 3
    class_names = ["pizza", "steak", "sushi"]

    # Generate dummy predictions (90% accuracy)
    y_true = np.random.randint(0, n_classes, n_samples)
    y_pred = y_true.copy()
    # Add 10% errors
    error_indices = np.random.choice(n_samples, size=int(n_samples * 0.1), replace=False)
    y_pred[error_indices] = np.random.randint(0, n_classes, len(error_indices))

    # Generate dummy probabilities
    y_probs = np.random.dirichlet(np.ones(n_classes), n_samples)

    # Compute metrics
    metrics = compute_classification_metrics(y_true, y_pred, y_probs, class_names)
    print_metrics(metrics)
