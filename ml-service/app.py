from flask import Flask, request, jsonify
from train import train_model
from predict import predict_label

app = Flask(__name__)

@app.route("/", methods=["GET"])
@app.route("/health", methods=["GET"])
def health_check():
    return jsonify({
        "status": "healthy",
        "service": "SmartMail AI ML Service"
    }), 200

@app.route("/train", methods=["POST"])
def train():
    try:
        data = request.get_json()
        if not data or "data" not in data:
            return jsonify({
                "success": False,
                "message": "Invalid payload. Please provide 'data' array containing text and labels."
            }), 400

        data_items = data["data"]
        result = train_model(data_items)
        
        status_code = 200 if result.get("success") else 400
        return jsonify(result), status_code
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Server error during training: {str(e)}"
        }), 500

@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json()
        if not data or "text" not in data:
            return jsonify({
                "success": False,
                "message": "Invalid payload. Please provide 'text' attribute."
            }), 400

        text = data["text"]
        result = predict_label(text)
        
        status_code = 200 if result.get("success") else 400
        return jsonify(result), status_code
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Server error during prediction: {str(e)}"
        }), 500

if __name__ == "__main__":
    import os
    port = int(os.environ.get("PORT", 5000))
    # Run server on all interfaces locally
    app.run(host="0.0.0.0", port=port, debug=False)
