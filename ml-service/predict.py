import os
import joblib
from utils import clean_text

MODEL_DIR = os.path.join(os.path.dirname(__file__), "saved_model")
MODEL_PATH = os.path.join(MODEL_DIR, "model.pkl")
VECTORIZER_PATH = os.path.join(MODEL_DIR, "vectorizer.pkl")

def predict_label(text):
    """
    Predicts the label for a given email text.
    If no model is trained yet, returns prediction=None.
    """
    if not os.path.exists(MODEL_PATH) or not os.path.exists(VECTORIZER_PATH):
        return {
            "success": False,
            "prediction": None,
            "confidence": 0.0,
            "message": "No classification model has been trained yet. Using default categorization."
        }

    try:
        # Clean text
        cleaned = clean_text(text)
        if not cleaned:
            return {
                "success": True,
                "prediction": None,
                "confidence": 0.0,
                "message": "Content is empty or contains only stopwords."
            }

        # Load vectorizer and model
        classifier = joblib.load(MODEL_PATH)
        vectorizer = joblib.load(VECTORIZER_PATH)

        # Transform and predict
        vectorized_text = vectorizer.transform([cleaned])
        prediction = classifier.predict(vectorized_text)[0]
        
        # Get probability (confidence score)
        probabilities = classifier.predict_proba(vectorized_text)[0]
        class_idx = list(classifier.classes_).index(prediction)
        confidence = float(probabilities[class_idx])

        return {
            "success": True,
            "prediction": prediction,
            "confidence": confidence
        }
    except Exception as e:
        return {
            "success": False,
            "prediction": None,
            "confidence": 0.0,
            "message": f"Prediction error: {str(e)}"
        }
