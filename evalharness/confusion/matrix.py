"""
Confusion matrix analysis for FoodVision evaluation.
"""

import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import confusion_matrix
from pathlib import Path
from typing import List, Tuple


def compute_confusion_matrix(y_true: np.ndarray, y_pred: np.ndarray, class_names: List[str]) -> np.ndarray:
    """
    Compute confusion matrix.

    Args:
        y_true: True labels
        y_pred: Predicted labels
        class_names: List of class names

    Returns:
        Confusion matrix (num_classes, num_classes)
    """
    cm = confusion_matrix(y_true, y_pred, labels=range(len(class_names)))
    return cm


def plot_confusion_matrix(
    cm: np.ndarray,
    class_names: List[str],
    save_path: str = None,
    normalize: bool = False
) -> plt.Figure:
    """
    Plot confusion matrix as a heatmap.

    Args:
        cm: Confusion matrix
        class_names: List of class names
        save_path: Path to save figure (optional)
        normalize: Whether to normalize by row (true label)

    Returns:
        Matplotlib figure
    """
    if normalize:
        cm = cm.astype('float') / cm.sum(axis=1)[:, np.newaxis]
        fmt = '.2%'
        title = 'Normalized Confusion Matrix'
    else:
        fmt = 'd'
        title = 'Confusion Matrix'

    # Create figure
    fig, ax = plt.subplots(figsize=(10, 8))

    # Plot heatmap
    sns.heatmap(
        cm,
        annot=True,
        fmt=fmt,
        cmap='Blues',
        xticklabels=class_names,
        yticklabels=class_names,
        ax=ax,
        cbar_kws={'label': 'Count' if not normalize else 'Proportion'}
    )

    ax.set_title(title, fontsize=16, fontweight='bold', pad=20)
    ax.set_ylabel('True Label', fontsize=14, fontweight='bold')
    ax.set_xlabel('Predicted Label', fontsize=14, fontweight='bold')

    plt.tight_layout()

    if save_path:
        save_path = Path(save_path)
        save_path.parent.mkdir(parents=True, exist_ok=True)
        fig.savefig(save_path, dpi=300, bbox_inches='tight')
        print(f"Confusion matrix saved to {save_path}")

    return fig


def get_top_confusions(cm: np.ndarray, class_names: List[str], top_k: int = 3) -> List[Tuple]:
    """
    Get top confusion pairs (excluding diagonal).

    Args:
        cm: Confusion matrix
        class_names: List of class names
        top_k: Number of top confusions to return

    Returns:
        List of (true_class, pred_class, count) tuples
    """
    # Mask diagonal
    cm_off_diag = cm.copy()
    np.fill_diagonal(cm_off_diag, 0)

    # Get top k indices
    flat_indices = np.argsort(cm_off_diag.ravel())[::-1][:top_k]
    top_indices = np.unravel_index(flat_indices, cm_off_diag.shape)

    confusions = []
    for i in range(len(flat_indices)):
        true_idx = top_indices[0][i]
        pred_idx = top_indices[1][i]
        count = cm[true_idx, pred_idx]
        if count > 0:  # Only include non-zero confusions
            confusions.append((
                class_names[true_idx],
                class_names[pred_idx],
                int(count)
            ))

    return confusions


def print_confusion_analysis(cm: np.ndarray, class_names: List[str]):
    """Print confusion matrix analysis."""
    print("\n" + "="*60)
    print("Confusion Matrix Analysis")
    print("="*60)

    # Overall statistics
    total = cm.sum()
    correct = np.diag(cm).sum()
    accuracy = correct / total

    print(f"\nOverall:")
    print(f"  Total predictions: {int(total)}")
    print(f"  Correct predictions: {int(correct)}")
    print(f"  Accuracy: {accuracy*100:.2f}%")

    # Per-class statistics
    print(f"\nPer-Class Performance:")
    print(f"{'Class':<15} {'Total':<10} {'Correct':<10} {'Accuracy':<12}")
    print("-" * 50)
    for i, class_name in enumerate(class_names):
        class_total = cm[i].sum()
        class_correct = cm[i, i]
        class_acc = class_correct / class_total if class_total > 0 else 0
        print(
            f"{class_name:<15} {int(class_total):<10} {int(class_correct):<10} {class_acc*100:>10.2f}%"
        )

    # Top confusions
    top_confusions = get_top_confusions(cm, class_names, top_k=5)
    if top_confusions:
        print(f"\nTop Confusion Pairs:")
        print(f"{'True Label':<15} {'Predicted As':<15} {'Count':<10}")
        print("-" * 42)
        for true_class, pred_class, count in top_confusions:
            print(f"{true_class:<15} {pred_class:<15} {count:<10}")

    print("="*60)


if __name__ == "__main__":
    # Test with dummy data
    np.random.seed(42)
    class_names = ["pizza", "steak", "sushi"]
    n_classes = len(class_names)

    # Generate dummy confusion matrix
    # Diagonal should be largest (correct predictions)
    cm = np.array([
        [220, 15, 15],  # pizza: 220 correct, 15 confused with steak, 15 with sushi
        [10, 230, 10],  # steak: 10 confused with pizza, 230 correct, 10 with sushi
        [20, 20, 210]   # sushi: 20 confused with pizza, 20 with steak, 210 correct
    ])

    # Print analysis
    print_confusion_analysis(cm, class_names)

    # Plot confusion matrix
    fig = plot_confusion_matrix(cm, class_names, save_path="test_confusion_matrix.png")
    print("\n[checkmark.circle] Confusion matrix test complete!")

    # Cleanup
    Path("test_confusion_matrix.png").unlink(missing_ok=True)
