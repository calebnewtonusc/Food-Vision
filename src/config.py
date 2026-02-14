"""
Configuration management for FoodVision Mini.
Handles loading and validation of YAML config files.
"""

import yaml
from pathlib import Path
from typing import Dict, Any
from dataclasses import dataclass, field


@dataclass
class ModelConfig:
    """Model configuration."""
    architecture: str = "efficientnet_b2"
    pretrained: bool = True
    freeze_backbone: bool = True
    unfreeze_last_blocks: int = 0
    num_classes: int = 3
    dropout: float = 0.3


@dataclass
class TrainingConfig:
    """Training configuration."""
    epochs: int = 10
    batch_size: int = 32
    optimizer: str = "adam"
    learning_rate: float = 1e-3
    weight_decay: float = 1e-4
    loss: str = "cross_entropy"
    scheduler: str = "none"
    early_stopping: bool = True
    patience: int = 5
    discriminative_lr: Dict[str, float] = field(default_factory=dict)


@dataclass
class DataConfig:
    """Data configuration."""
    train_path: str = "data/processed/train"
    test_path: str = "data/processed/test"
    image_size: int = 224
    augmentation: str = "basic"
    val_split: float = 0.0
    num_workers: int = 4


@dataclass
class ReproducibilityConfig:
    """Reproducibility configuration."""
    seed: int = 42
    deterministic: bool = True
    benchmark: bool = False


@dataclass
class Config:
    """Complete training configuration."""
    model: ModelConfig = field(default_factory=ModelConfig)
    training: TrainingConfig = field(default_factory=TrainingConfig)
    data: DataConfig = field(default_factory=DataConfig)
    reproducibility: ReproducibilityConfig = field(default_factory=ReproducibilityConfig)
    name: str = "experiment"
    description: str = ""

    @classmethod
    def from_dict(cls, config_dict: Dict[str, Any]) -> 'Config':
        """Create config from dictionary."""
        model_config = ModelConfig(**config_dict.get('model', {}))
        training_config = TrainingConfig(**config_dict.get('training', {}))
        data_config = DataConfig(**config_dict.get('data', {}))
        repro_config = ReproducibilityConfig(**config_dict.get('reproducibility', {}))

        return cls(
            model=model_config,
            training=training_config,
            data=data_config,
            reproducibility=repro_config,
            name=config_dict.get('name', 'experiment'),
            description=config_dict.get('description', '')
        )

    @classmethod
    def from_yaml(cls, yaml_path: str) -> 'Config':
        """Load config from YAML file."""
        yaml_path = Path(yaml_path)

        if not yaml_path.exists():
            raise FileNotFoundError(f"Config file not found: {yaml_path}")

        with open(yaml_path, 'r') as f:
            config_dict = yaml.safe_load(f)

        return cls.from_dict(config_dict)

    def to_dict(self) -> Dict[str, Any]:
        """Convert config to dictionary."""
        return {
            'name': self.name,
            'description': self.description,
            'model': {
                'architecture': self.model.architecture,
                'pretrained': self.model.pretrained,
                'freeze_backbone': self.model.freeze_backbone,
                'unfreeze_last_blocks': self.model.unfreeze_last_blocks,
                'num_classes': self.model.num_classes,
                'dropout': self.model.dropout
            },
            'training': {
                'epochs': self.training.epochs,
                'batch_size': self.training.batch_size,
                'optimizer': self.training.optimizer,
                'learning_rate': self.training.learning_rate,
                'weight_decay': self.training.weight_decay,
                'loss': self.training.loss,
                'scheduler': self.training.scheduler,
                'early_stopping': self.training.early_stopping,
                'patience': self.training.patience,
                'discriminative_lr': self.training.discriminative_lr
            },
            'data': {
                'train_path': self.data.train_path,
                'test_path': self.data.test_path,
                'image_size': self.data.image_size,
                'augmentation': self.data.augmentation,
                'val_split': self.data.val_split,
                'num_workers': self.data.num_workers
            },
            'reproducibility': {
                'seed': self.reproducibility.seed,
                'deterministic': self.reproducibility.deterministic,
                'benchmark': self.reproducibility.benchmark
            }
        }

    def save(self, output_path: str):
        """Save config to YAML file."""
        output_path = Path(output_path)
        output_path.parent.mkdir(parents=True, exist_ok=True)

        with open(output_path, 'w') as f:
            yaml.dump(self.to_dict(), f, default_flow_style=False, sort_keys=False)

    def print_summary(self):
        """Print configuration summary."""
        print("\n" + "="*50)
        print("Configuration Summary")
        print("="*50)
        print(f"Name: {self.name}")
        if self.description:
            print(f"Description: {self.description}")

        print(f"\nModel:")
        print(f"  Architecture: {self.model.architecture}")
        print(f"  Pretrained: {self.model.pretrained}")
        print(f"  Freeze backbone: {self.model.freeze_backbone}")
        if self.model.unfreeze_last_blocks > 0:
            print(f"  Unfreeze last blocks: {self.model.unfreeze_last_blocks}")
        print(f"  Classes: {self.model.num_classes}")
        print(f"  Dropout: {self.model.dropout}")

        print(f"\nTraining:")
        print(f"  Epochs: {self.training.epochs}")
        print(f"  Batch size: {self.training.batch_size}")
        print(f"  Optimizer: {self.training.optimizer}")
        print(f"  Learning rate: {self.training.learning_rate}")
        print(f"  Weight decay: {self.training.weight_decay}")
        print(f"  Scheduler: {self.training.scheduler}")
        if self.training.discriminative_lr:
            print(f"  Discriminative LR: {self.training.discriminative_lr}")

        print(f"\nData:")
        print(f"  Train path: {self.data.train_path}")
        print(f"  Image size: {self.data.image_size}")
        print(f"  Augmentation: {self.data.augmentation}")
        if self.data.val_split > 0:
            print(f"  Validation split: {self.data.val_split}")

        print(f"\nReproducibility:")
        print(f"  Seed: {self.reproducibility.seed}")
        print(f"  Deterministic: {self.reproducibility.deterministic}")
        print("="*50 + "\n")


def load_config(config_path: str) -> Config:
    """
    Load configuration from YAML file.

    Args:
        config_path: Path to YAML config file

    Returns:
        Config object
    """
    return Config.from_yaml(config_path)


if __name__ == "__main__":
    # Test config loading with example
    print("Testing configuration loading...\n")

    # Create example config
    example_config = Config(
        name="test_experiment",
        description="Test configuration",
        model=ModelConfig(
            freeze_backbone=True,
            pretrained=True
        ),
        training=TrainingConfig(
            epochs=10,
            batch_size=32,
            learning_rate=1e-3
        )
    )

    # Save example config
    example_path = Path("test_config.yaml")
    example_config.save(str(example_path))
    print(f"Saved example config to {example_path}")

    # Load it back
    loaded_config = load_config(str(example_path))
    loaded_config.print_summary()

    # Cleanup
    example_path.unlink()
    print("[checkmark.circle] Config test passed!")
