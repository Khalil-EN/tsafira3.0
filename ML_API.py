from flask import Flask, request, jsonify
from transformers import TFCLIPModel, CLIPProcessor
from PIL import Image
import tensorflow as tf
import requests
import io
from flask import jsonify
import numpy as np

def to_serializable(val):
    if isinstance(val, np.bool_):
        return bool(val)
    if isinstance(val, np.integer):
        return int(val)
    if isinstance(val, np.floating):
        return float(val)
    return val

# Initialize model and processor once
model = TFCLIPModel.from_pretrained("openai/clip-vit-base-patch32")
processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")
labels = ["hotel", "restaurant", "activity"]
THRESHOLD = 0.5

app = Flask(__name__)

def classify_image(url):
    try:
        image = Image.open(requests.get(url, stream=True).raw).convert("RGB")
        inputs = processor(text=labels, images=image, return_tensors="tf", padding=True)
        outputs = model(**inputs)
        probs = tf.nn.softmax(outputs.logits_per_image, axis=1)
        max_prob = tf.reduce_max(probs).numpy()
        predicted_label = labels[tf.argmax(probs, axis=1).numpy()[0]]
        return {"url": url, "label": predicted_label, "confidence": float(max_prob), "relevant": max_prob >= THRESHOLD}
    except Exception as e:
        return {"url": url, "error": str(e), "relevant": False}

@app.route('/filter-images', methods=['POST'])
def filter_images():
    data = request.json
    #print(data)
    urls = data.get("images", [])
    #print(urls)
    results = [classify_image(url) for url in urls]
    relevant = [r for r in results if r["relevant"]]
    print(relevant)
    relevant_serializable = [
        {k: to_serializable(v) for k, v in item.items()}
        for item in relevant
    ]

    return jsonify({"relevant_images": relevant_serializable})
    #return jsonify({"relevant_images": []})

@app.route('/hello', methods=['GET'])
def hello():
    return {"message" : "hello"}

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5001, debug=True)
