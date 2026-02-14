"""
FastAPI application for FoodVision inference.
"""

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import io
import time
from pathlib import Path

from model import load_model, predict, CLASS_NAMES


# Initialize FastAPI app
app = FastAPI(
    title="Food Vision API",
    description="EfficientNetB2 classifier for pizza, steak, and sushi",
    version="1.0.0"
)

# CORS middleware - allow requests from frontend
# SECURITY: Locked down to specific origins only (no wildcard)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://foodvis.in",
        "https://www.foodvis.in",
        "http://localhost:3000",  # Development
        "http://localhost:5173",  # Vite dev server
    ],
    allow_credentials=True,
    allow_methods=["POST", "GET", "OPTIONS"],
    allow_headers=["Content-Type", "Accept"],
)

# Global model variable (loaded on startup)
model = None


@app.on_event("startup")
async def startup_event():
    """Load model on application startup."""
    global model

    print("Loading FoodVision model...")
    model_path = Path("models/best_model.pth")

    if not model_path.exists():
        print(f"[exclamationmark.triangle]  Model not found at {model_path}")
        print("[exclamationmark.triangle]  Model will be loaded on first prediction request")
        return

    try:
        model = load_model(str(model_path), device="cpu")
        print("[checkmark.circle] Model loaded successfully!")
    except Exception as e:
        print(f"[xmark.circle] Failed to load model: {e}")
        print("[exclamationmark.triangle]  Model will be loaded on first prediction request")


@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "name": "Food Vision API",
        "version": "1.0.0",
        "description": "Upload a food image to classify it as pizza, steak, or sushi",
        "endpoints": {
            "POST /predict": "Classify a food image",
            "GET /health": "Health check",
            "GET /docs": "API documentation"
        },
        "classes": CLASS_NAMES
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "model_loaded": model is not None,
        "classes": CLASS_NAMES
    }


@app.post("/predict")
async def predict_food(file: UploadFile = File(...)):
    """
    Predict food class from uploaded image.

    Args:
        file: Uploaded image file (JPEG, PNG)

    Returns:
        {
            "predicted_class": "pizza",
            "confidence": 0.95,
            "probabilities": {
                "pizza": 0.95,
                "steak": 0.03,
                "sushi": 0.02
            },
            "inference_time_ms": 85.3
        }
    """
    global model

    # Load model if not already loaded
    if model is None:
        try:
            model_path = Path("models/best_model.pth")
            if not model_path.exists():
                raise HTTPException(
                    status_code=500,
                    detail="Model not found. Please ensure the model file exists at models/best_model.pth"
                )

            model = load_model(str(model_path), device="cpu")
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to load model: {str(e)}"
            )

    try:
        # Read and validate image
        contents = await file.read()

        if len(contents) == 0:
            raise HTTPException(status_code=400, detail="Empty file")

        if len(contents) > 10 * 1024 * 1024:  # 10MB limit
            raise HTTPException(status_code=400, detail="File too large (max 10MB)")

        # Open image
        try:
            image = Image.open(io.BytesIO(contents))
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid image file: {str(e)}"
            )

        # Convert to RGB if necessary
        if image.mode != 'RGB':
            image = image.convert('RGB')

        # Make prediction
        start_time = time.perf_counter()
        results = predict(model, image, device="cpu")
        inference_time = (time.perf_counter() - start_time) * 1000

        # Add inference time to results
        results["inference_time_ms"] = round(inference_time, 2)

        return results

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Prediction failed: {str(e)}"
        )


if __name__ == "__main__":
    import uvicorn

    print("Starting Food Vision API...")
    print("API docs will be available at http://localhost:8000/docs")

    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        log_level="info"
    )
