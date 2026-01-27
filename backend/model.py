"""
Model loading and inference for FoodVision API.
"""

import torch
import torch.nn as nn
from torchvision import transforms
from torchvision.models import efficientnet_b2
from PIL import Image
from pathlib import Path


# Class names
CLASS_NAMES = ["pizza", "steak", "sushi"]


class FoodVisionModel(nn.Module):
    """FoodVision classifier based on EfficientNetB2."""

    def __init__(self, num_classes=3, dropout=0.3):
        super().__init__()
        self.backbone = efficientnet_b2(weights=None)
        feature_dim = self.backbone.classifier[1].in_features

        self.backbone.classifier = nn.Sequential(
            nn.Dropout(p=dropout, inplace=True),
            nn.Linear(feature_dim, num_classes)
        )

    def forward(self, x):
        return self.backbone(x)


# Image preprocessing pipeline
preprocess = transforms.Compose([
    transforms.Resize(256),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])


def load_model(model_path: str, device: str = "cpu") -> FoodVisionModel:
    """
    Load trained FoodVision model.

    Args:
        model_path: Path to model checkpoint (.pth)
        device: Device to load model on

    Returns:
        Loaded model in eval mode
    """
    model = FoodVisionModel(num_classes=3)

    # Load checkpoint
    checkpoint = torch.load(model_path, map_location=device)
    if 'model_state_dict' in checkpoint:
        model.load_state_dict(checkpoint['model_state_dict'])
    else:
        model.load_state_dict(checkpoint)

    model = model.to(device)
    model.eval()

    return model


def preprocess_image(image: Image.Image) -> torch.Tensor:
    """
    Preprocess PIL image for model inference.

    Args:
        image: PIL Image (RGB)

    Returns:
        Preprocessed tensor (1, 3, 224, 224)
    """
    tensor = preprocess(image)
    return tensor.unsqueeze(0)  # Add batch dimension


def predict(model: FoodVisionModel, image: Image.Image, device: str = "cpu", threshold: float = 0.7) -> dict:
    """
    Make prediction on a single image.

    Args:
        model: Trained model
        image: PIL Image (RGB)
        device: Device to run on
        threshold: Minimum confidence threshold (default 0.7)

    Returns:
        Dictionary with prediction results
    """
    # Preprocess
    image_tensor = preprocess_image(image).to(device)

    # Inference
    with torch.no_grad():
        logits = model(image_tensor)
        probs = torch.softmax(logits, dim=1)[0]

    # Get prediction
    predicted_idx = torch.argmax(probs).item()
    confidence = probs[predicted_idx].item()

    # Check if confidence is above threshold
    if confidence < threshold:
        predicted_class = "unknown"
        is_unknown = True
    else:
        predicted_class = CLASS_NAMES[predicted_idx]
        is_unknown = False

    # Format results
    results = {
        "predicted_class": predicted_class,
        "confidence": float(confidence),
        "is_unknown": is_unknown,
        "probabilities": {
            CLASS_NAMES[i]: float(probs[i].item())
            for i in range(len(CLASS_NAMES))
        },
        "threshold": threshold
    }

    return results


if __name__ == "__main__":
    # Test model loading
    print("Testing model loading...\n")

    # Create dummy model for testing
    model = FoodVisionModel(num_classes=3)
    print("✅ Model created successfully")

    # Test preprocessing
    dummy_image = Image.new('RGB', (224, 224), color='red')
    tensor = preprocess_image(dummy_image)
    print(f"✅ Image preprocessed: {tensor.shape}")

    # Test prediction
    results = predict(model, dummy_image, device="cpu")
    print(f"✅ Prediction results: {results}")

    print("\n✅ Model tests passed!")
