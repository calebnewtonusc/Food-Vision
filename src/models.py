"""
Model architecture for FoodVision Mini.
EfficientNetB2-based classifier with support for gradual unfreezing.
"""

import torch
import torch.nn as nn
from torchvision.models import efficientnet_b2, EfficientNet_B2_Weights
from typing import Optional


class FoodVisionModel(nn.Module):
    """
    FoodVision classifier based on EfficientNetB2.

    Architecture:
    - EfficientNetB2 backbone (pretrained on ImageNet)
    - Custom classifier head (dropout + linear)
    - Support for freezing/unfreezing backbone layers
    """

    def __init__(
        self,
        num_classes: int = 3,
        freeze_backbone: bool = True,
        dropout: float = 0.3,
        pretrained: bool = True
    ):
        """
        Initialize FoodVision model.

        Args:
            num_classes: Number of output classes
            freeze_backbone: Whether to freeze backbone weights
            dropout: Dropout probability in classifier
            pretrained: Whether to use pretrained ImageNet weights
        """
        super().__init__()

        # Load EfficientNetB2
        if pretrained:
            weights = EfficientNet_B2_Weights.DEFAULT
            self.backbone = efficientnet_b2(weights=weights)
        else:
            self.backbone = efficientnet_b2(weights=None)

        # Get feature dimension (EfficientNetB2 has 1408 features)
        self.feature_dim = self.backbone.classifier[1].in_features

        # Replace classifier head
        self.backbone.classifier = nn.Sequential(
            nn.Dropout(p=dropout, inplace=True),
            nn.Linear(self.feature_dim, num_classes)
        )

        # Freeze backbone if requested
        if freeze_backbone:
            self.freeze_backbone()

        self.num_classes = num_classes
        self._frozen = freeze_backbone

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """Forward pass."""
        return self.backbone(x)

    def freeze_backbone(self):
        """Freeze all backbone parameters (keep only classifier trainable)."""
        for param in self.backbone.features.parameters():
            param.requires_grad = False
        self._frozen = True

        print("[checkmark.circle] Backbone frozen - only classifier is trainable")

    def unfreeze_backbone(self):
        """Unfreeze all backbone parameters."""
        for param in self.backbone.features.parameters():
            param.requires_grad = True
        self._frozen = False

        print("[checkmark.circle] Backbone unfrozen - all layers are trainable")

    def unfreeze_last_blocks(self, num_blocks: int = 2):
        """
        Unfreeze only the last N blocks of the backbone.
        EfficientNetB2 has 8 blocks (0-7), so unfreezing last 2 means blocks 6-7.

        Args:
            num_blocks: Number of blocks to unfreeze from the end
        """
        # First, ensure everything is frozen
        self.freeze_backbone()

        # Get total number of blocks
        total_blocks = len(self.backbone.features)

        # Unfreeze last N blocks
        for i in range(total_blocks - num_blocks, total_blocks):
            for param in self.backbone.features[i].parameters():
                param.requires_grad = True

        print(f"[checkmark.circle] Unfroze last {num_blocks} blocks (blocks {total_blocks - num_blocks}-{total_blocks - 1})")

    def get_parameter_groups(self, lr_classifier=1e-3, lr_last_blocks=1e-4, lr_mid_layers=1e-5):
        """
        Get parameter groups for discriminative learning rates.

        Args:
            lr_classifier: Learning rate for classifier head
            lr_last_blocks: Learning rate for last 2 blocks
            lr_mid_layers: Learning rate for middle layers

        Returns:
            List of parameter group dicts for optimizer
        """
        # Identify blocks
        total_blocks = len(self.backbone.features)
        last_block_start = total_blocks - 2  # Last 2 blocks

        param_groups = []

        # Group 1: Frozen/mid layers (blocks 0-5)
        mid_params = []
        for i in range(0, last_block_start):
            for param in self.backbone.features[i].parameters():
                if param.requires_grad:
                    mid_params.append(param)

        if mid_params:
            param_groups.append({
                'params': mid_params,
                'lr': lr_mid_layers,
                'name': 'mid_layers'
            })

        # Group 2: Last blocks (blocks 6-7)
        last_block_params = []
        for i in range(last_block_start, total_blocks):
            for param in self.backbone.features[i].parameters():
                if param.requires_grad:
                    last_block_params.append(param)

        if last_block_params:
            param_groups.append({
                'params': last_block_params,
                'lr': lr_last_blocks,
                'name': 'last_blocks'
            })

        # Group 3: Classifier
        classifier_params = [p for p in self.backbone.classifier.parameters() if p.requires_grad]
        if classifier_params:
            param_groups.append({
                'params': classifier_params,
                'lr': lr_classifier,
                'name': 'classifier'
            })

        print("\nParameter groups for discriminative LR:")
        for group in param_groups:
            print(f"  {group['name']}: {len(group['params'])} params, LR = {group['lr']}")

        return param_groups

    def count_parameters(self, trainable_only=False):
        """Count model parameters."""
        if trainable_only:
            return sum(p.numel() for p in self.parameters() if p.requires_grad)
        else:
            return sum(p.numel() for p in self.parameters())

    def get_model_size_mb(self):
        """Get model size in MB."""
        param_size = sum(p.numel() * p.element_size() for p in self.parameters())
        buffer_size = sum(b.numel() * b.element_size() for b in self.buffers())
        size_mb = (param_size + buffer_size) / (1024 ** 2)
        return size_mb

    def print_summary(self):
        """Print model summary."""
        total_params = self.count_parameters(trainable_only=False)
        trainable_params = self.count_parameters(trainable_only=True)
        model_size = self.get_model_size_mb()

        print("\n" + "="*50)
        print("Model Summary")
        print("="*50)
        print(f"Architecture: EfficientNetB2")
        print(f"Number of classes: {self.num_classes}")
        print(f"Feature dimension: {self.feature_dim}")
        print(f"Total parameters: {total_params:,}")
        print(f"Trainable parameters: {trainable_params:,}")
        print(f"Frozen parameters: {total_params - trainable_params:,}")
        print(f"Model size: {model_size:.2f} MB")
        print(f"Backbone frozen: {self._frozen}")
        print("="*50 + "\n")


def create_model(
    num_classes: int = 3,
    freeze_backbone: bool = True,
    dropout: float = 0.3,
    pretrained: bool = True,
    device: str = "cpu"
) -> FoodVisionModel:
    """
    Create and initialize FoodVision model.

    Args:
        num_classes: Number of output classes
        freeze_backbone: Whether to freeze backbone
        dropout: Dropout probability
        pretrained: Whether to use pretrained weights
        device: Device to put model on

    Returns:
        Initialized model
    """
    model = FoodVisionModel(
        num_classes=num_classes,
        freeze_backbone=freeze_backbone,
        dropout=dropout,
        pretrained=pretrained
    )

    model = model.to(device)
    model.print_summary()

    return model


if __name__ == "__main__":
    # Test model creation
    print("Testing model creation...\n")

    # Test 1: Frozen baseline model
    print("Test 1: Frozen backbone model")
    model1 = create_model(freeze_backbone=True, device="cpu")

    # Test 2: Unfrozen model
    print("\nTest 2: Unfrozen backbone model")
    model2 = create_model(freeze_backbone=False, device="cpu")

    # Test 3: Partially unfrozen model
    print("\nTest 3: Partially unfrozen model (last 2 blocks)")
    model3 = create_model(freeze_backbone=True, device="cpu")
    model3.unfreeze_last_blocks(num_blocks=2)
    model3.print_summary()

    # Test 4: Discriminative learning rates
    print("\nTest 4: Discriminative learning rate groups")
    param_groups = model3.get_parameter_groups(
        lr_classifier=1e-3,
        lr_last_blocks=1e-4,
        lr_mid_layers=1e-5
    )

    # Test 5: Forward pass
    print("\nTest 5: Forward pass")
    dummy_input = torch.randn(2, 3, 224, 224)
    output = model1(dummy_input)
    print(f"Input shape: {dummy_input.shape}")
    print(f"Output shape: {output.shape}")
    print(f"Output range: [{output.min():.3f}, {output.max():.3f}]")

    print("\n[checkmark.circle] All model tests passed!")
