import os
import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from utils import clean_text

MODEL_DIR = os.path.join(os.path.dirname(__file__), "saved_model")
MODEL_PATH = os.path.join(MODEL_DIR, "model.pkl")
VECTORIZER_PATH = os.path.join(MODEL_DIR, "vectorizer.pkl")

def train_model(data_items):
    """
    data_items: list of dicts, e.g. [{"text": "...", "label": "..."}]
    """
    if not os.path.exists(MODEL_DIR):
        os.makedirs(MODEL_DIR)

    if len(data_items) < 3:
        return {
            "success": False,
            "message": f"Insufficient data. Please label at least 3 emails (currently have {len(data_items)})."
        }

    # Extract X (emails text) and y (labels)
    texts = []
    labels = []

    for item in data_items:
        cleaned = clean_text(item.get("text", ""))
        # Only add if we have some text after cleaning
        if cleaned:
            texts.append(cleaned)
            labels.append(item.get("label", ""))

    if len(texts) < 3:
        return {
            "success": False,
            "message": "After text preprocessing, there is not enough valid text content to train."
        }

    # Naive Bayes requires at least 2 distinct classes to train
    unique_classes = set(labels)
    if len(unique_classes) < 2:
        return {
            "success": False,
            "message": f"ML model training requires at least 2 distinct categories. Currently labeled: {list(unique_classes)}"
        }

    try:
        # Fit vectorizer
        vectorizer = TfidfVectorizer(max_features=5000, ngram_range=(1, 2))
        X = vectorizer.fit_transform(texts)
        
        # Fit Naive Bayes classifier
        classifier = MultinomialNB(alpha=0.1)
        classifier.fit(X, labels)

        # Save to disk
        joblib.dump(classifier, MODEL_PATH)
        joblib.dump(vectorizer, VECTORIZER_PATH)

        return {
            "success": True,
            "samples_trained": len(texts),
            "classes": list(unique_classes),
            "message": f"Successfully trained model on {len(texts)} samples with categories: {', '.join(unique_classes)}"
        }
    except Exception as e:
        return {
            "success": False,
            "message": f"Training failed: {str(e)}"
        }
