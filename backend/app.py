from flask import Flask, request, jsonify
from PIL import Image
import numpy as np
import tensorflow as tf
import io
import logging
from flask_cors import CORS

# Initialize Flask app
app = Flask(__name__)

# Enable Cross-Origin Resource Sharing (CORS)
CORS(app)

# Configure logging for debugging
logging.basicConfig(level=logging.INFO)

# Load the trained model
try:
    MODEL_PATH = "breastcancer_model.keras"  # Replace with your actual model path
    app.logger.info("Loading model...")
    model = tf.keras.models.load_model(MODEL_PATH)
    app.logger.info("Model loaded successfully.")
except Exception as e:
    app.logger.error(f"Error loading model: {str(e)}")
    model = None

# Helper function to preprocess the image
def preprocess_image(image, target_size):
    """
    Preprocess the image to match the model's input shape.
    Args:
        image: PIL Image object.
        target_size: Tuple specifying the target image size (height, width).
    Returns:
        A NumPy array of the processed image, normalized, and reshaped.
    """
    image = image.resize(target_size)  # Resize the image
    image = np.array(image)  # Convert PIL Image to NumPy array
    if len(image.shape) == 2:  # If grayscale, convert to RGB
        image = np.stack((image,) * 3, axis=-1)
    image = image / 255.0  # Normalize pixel values to [0, 1]
    image = np.expand_dims(image, axis=0)  # Add batch dimension
    return image

# Route for prediction
@app.route('/predict', methods=['POST'])
def predict():
    """
    Handle image upload, preprocess the image, and return the model's prediction.
    """
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['file']

    try:
        # Check if the uploaded file is an image
        if not file.content_type.startswith("image/"):
            return jsonify({"error": "Uploaded file is not an image"}), 400

        # Open and preprocess the image
        app.logger.info("Processing uploaded image...")
        image = Image.open(io.BytesIO(file.read()))
        processed_image = preprocess_image(image, target_size=(64, 64))  # Match model input size
        app.logger.info(f"Processed image shape: {processed_image.shape}")

        # Make prediction
        if model is None:
            raise Exception("Model not loaded")

        predictions = model.predict(processed_image)
        predicted_class = np.argmax(predictions, axis=1)[0]  # Get class with highest confidence
        confidence = float(np.max(predictions) * 100)  # Convert confidence to Python float

        # Map class indices to labels (example mapping, adjust to your dataset)
        class_labels = {0: "Benign", 1: "Malignant"}
        result = {
            "class": class_labels.get(predicted_class, "Unknown"),
            "confidence": round(confidence, 2),
        }

        app.logger.info(f"Prediction result: {result}")
        return jsonify(result)

    except Exception as e:
        # Log the error and return a detailed response
        app.logger.error(f"Error during prediction: {str(e)}")
        return jsonify({"error": "An error occurred during prediction", "details": str(e)}), 500

# Health check route (optional)
@app.route('/health', methods=['GET'])
def health_check():
    """
    Health check route to verify if the server is running.
    """
    return jsonify({"status": "Healthy", "model_loaded": model is not None})

if __name__ == '__main__':
    # Run the Flask app
    app.run(debug=True, host="0.0.0.0", port=5000)
