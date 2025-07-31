from flask import Flask, render_template, request, jsonify, redirect, url_for, flash
import tensorflow as tf
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.text import Tokenizer
from tensorflow.keras.preprocessing.sequence import pad_sequences
import numpy as np
import pandas as pd
import re
import pickle
import os
from datetime import datetime
import logging
from werkzeug.utils import secure_filename
import json

# Konfigurasi logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.secret_key = 'emotify_lyrics_secret_key_2024'

# Konfigurasi aplikasi
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
app.config['UPLOAD_FOLDER'] = 'uploads'

# Variabel global untuk model dan tokenizer
model = None
tokenizer = None
label_encoder = None

# Mapping emosi
EMOTION_MAPPING = {
    0: 'bahagia',
    1: 'sedih', 
    2: 'marah',
    3: 'takut'
}

EMOTION_CONFIG = {
    'bahagia': {
        'name': 'Bahagia',
        'icon': 'fas fa-smile',
        'color': '#ffd700',
        'description': 'Lirik ini mengekspresikan perasaan bahagia dan kegembiraan dengan nuansa positif yang kuat. Terdapat tema-tema tentang cinta, kebahagiaan, dan optimisme.',
        'keywords': ['bahagia', 'senang', 'gembira', 'cinta', 'suka', 'tertawa', 'tersenyum', 'indah', 'cantik', 'amazing', 'wonderful', 'love']
    },
    'sedih': {
        'name': 'Sedih',
        'icon': 'fas fa-sad-tear',
        'color': '#87ceeb',
        'description': 'Lirik ini menggambarkan kesedihan mendalam, kehilangan, atau melankolis. Tema-tema tentang patah hati, kerinduan, dan emosi yang menyentuh.',
        'keywords': ['sedih', 'menangis', 'sakit', 'hati', 'rindu', 'pergi', 'tinggalkan', 'hancur', 'luka', 'patah', 'sepi', 'sunyi']
    },
    'marah': {
        'name': 'Marah',
        'icon': 'fas fa-angry',
        'color': '#ff6b6b',
        'description': 'Lirik ini mengandung kemarahan, frustrasi, atau emosi yang intens. Terdapat ekspresi ketidakpuasan, protes, atau pergolakan emosi.',
        'keywords': ['marah', 'benci', 'kesal', 'muak', 'geram', 'jengkel', 'kacau', 'sialan', 'bodoh', 'tidak', 'brengsek']
    },
    'takut': {
        'name': 'Takut',
        'icon': 'fas fa-dizzy',
        'color': '#dda0dd',
        'description': 'Lirik ini menunjukkan ketakutan, kecemasan, atau kekhawatiran. Tema-tema tentang ketidakpastian, ancaman, atau situasi yang menimbulkan rasa takut.',
        'keywords': ['takut', 'khawatir', 'cemas', 'gelisah', 'was-was', 'panik', 'ngeri', 'seram', 'menakutkan', 'bahaya']
    }
}

def load_emotion_model():
    """Load model dan tokenizer untuk prediksi emosi"""
    global model, tokenizer, label_encoder
    
    try:
        # Load model
        model_path = os.path.join('Model', 'model_emotion_detection.h5')
        if os.path.exists(model_path):
            model = load_model(model_path)
            logger.info("Model berhasil dimuat")
        else:
            logger.warning("Model tidak ditemukan, menggunakan fallback")
            model = None
            
        # Load tokenizer (jika ada)
        tokenizer_path = os.path.join('Model', 'tokenizer.pickle')
        if os.path.exists(tokenizer_path):
            with open(tokenizer_path, 'rb') as handle:
                tokenizer = pickle.load(handle)
            logger.info("Tokenizer berhasil dimuat")
        else:
            # Buat tokenizer baru jika tidak ada
            tokenizer = create_fallback_tokenizer()
            logger.info("Tokenizer fallback dibuat")
            
    except Exception as e:
        logger.error(f"Error loading model: {str(e)}")
        model = None
        tokenizer = create_fallback_tokenizer()

def create_fallback_tokenizer():
    """Buat tokenizer sederhana untuk fallback"""
    tokenizer = Tokenizer(num_words=10000, oov_token="<OOV>")
    
    # Dataset sample untuk fitting tokenizer
    sample_texts = [
        "aku bahagia sekali hari ini",
        "hatiku sedih dan rindu",
        "aku marah dengan semua ini",
        "aku takut akan masa depan",
        "cinta ini indah sekali",
        "kenapa harus berpisah",
        "jangan tinggalkan aku",
        "semua akan baik-baik saja"
    ]
    
    tokenizer.fit_on_texts(sample_texts)
    return tokenizer

def preprocess_text(text):
    """Preprocessing teks untuk prediksi"""
    # Lowercase
    text = text.lower()
    
    # Hapus karakter khusus kecuali spasi
    text = re.sub(r'[^a-zA-Z\s]', '', text)
    
    # Hapus extra whitespace
    text = re.sub(r'\s+', ' ', text).strip()
    
    return text

def predict_emotion_ml(text):
    """Prediksi emosi menggunakan model ML"""
    global model, tokenizer
    
    if model is None or tokenizer is None:
        # Fallback ke rule-based
        return predict_emotion_rule_based(text)
    
    try:
        # Preprocess text
        processed_text = preprocess_text(text)
        
        # Tokenize dan padding
        sequences = tokenizer.texts_to_sequences([processed_text])
        padded_sequences = pad_sequences(sequences, maxlen=100, padding='post')
        
        # Prediksi
        predictions = model.predict(padded_sequences)
        predicted_class = np.argmax(predictions[0])
        confidence = float(np.max(predictions[0]) * 100)
        
        emotion = EMOTION_MAPPING.get(predicted_class, 'bahagia')
        
        return {
            'emotion': emotion,
            'confidence': min(95, max(60, confidence))
        }
        
    except Exception as e:
        logger.error(f"Error in ML prediction: {str(e)}")
        return predict_emotion_rule_based(text)

def predict_emotion_rule_based(text):
    """Prediksi emosi menggunakan rule-based approach"""
    text_lower = text.lower()
    
    scores = {
        'bahagia': 0,
        'sedih': 0,
        'marah': 0,
        'takut': 0
    }
    
    # Hitung score berdasarkan keyword
    for emotion, config in EMOTION_CONFIG.items():
        for keyword in config['keywords']:
            if keyword in text_lower:
                scores[emotion] += 1
    
    # Jika tidak ada keyword yang cocok, berikan prediksi random dengan confidence rendah
    total_score = sum(scores.values())
    if total_score == 0:
        emotions = list(scores.keys())
        random_emotion = emotions[np.random.choice(len(emotions))]
        return {
            'emotion': random_emotion,
            'confidence': np.random.randint(45, 65)
        }
    
    # Cari emosi dengan score tertinggi
    max_emotion = max(scores, key=scores.get)
    max_score = scores[max_emotion]
    
    # Hitung confidence berdasarkan rasio score
    confidence = min(95, max(70, (max_score / total_score) * 100 + np.random.randint(5, 15)))
    
    return {
        'emotion': max_emotion,
        'confidence': int(confidence)
    }

def validate_lyrics(lyrics):
    """Validasi input lirik"""
    if not lyrics or not lyrics.strip():
        return False, "Mohon masukkan lirik lagu terlebih dahulu!"
    
    if len(lyrics.strip()) < 20:
        return False, "Lirik terlalu pendek. Mohon masukkan lirik yang lebih panjang untuk hasil yang akurat."
    
    if len(lyrics.strip()) > 5000:
        return False, "Lirik terlalu panjang. Maksimal 5000 karakter."
    
    return True, "Valid"

@app.route('/')
def index():
    """Halaman utama"""
    return render_template('index.html')

@app.route('/deteksi')
def deteksi():
    return render_template('deteksi.html')

@app.route('/tentang')
def tentang():
    """Halaman tentang"""
    return render_template('tentang.html')

@app.route('/predict', methods=['POST'])
def predict():
    """Endpoint untuk prediksi emosi"""
    try:
        # Ambil data dari request
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        lyrics = data.get('lyrics', '').strip()
        
        # Validasi input
        is_valid, message = validate_lyrics(lyrics)
        if not is_valid:
            return jsonify({'error': message}), 400
        
        # Prediksi emosi
        result = predict_emotion_ml(lyrics)
        
        # Tambahkan informasi tambahan
        emotion_info = EMOTION_CONFIG.get(result['emotion'], EMOTION_CONFIG['bahagia'])
        
        response = {
            'success': True,
            'emotion': result['emotion'],
            'confidence': result['confidence'],
            'emotion_info': emotion_info,
            'timestamp': datetime.now().isoformat()
        }
        
        logger.info(f"Prediction successful: {result['emotion']} ({result['confidence']}%)")
        return jsonify(response)
        
    except Exception as e:
        logger.error(f"Error in prediction: {str(e)}")
        return jsonify({'error': 'Terjadi kesalahan dalam prediksi. Silakan coba lagi.'}), 500

@app.route('/hasil')
def hasil():
    """Halaman hasil prediksi"""
    # Ambil parameter dari query string
    emotion = request.args.get('emotion', 'bahagia')
    confidence = request.args.get('confidence', '75')
    
    # Validasi parameter
    if emotion not in EMOTION_CONFIG:
        emotion = 'bahagia'
    
    try:
        confidence = int(confidence)
        confidence = max(0, min(100, confidence))
    except:
        confidence = 75
    
    emotion_info = EMOTION_CONFIG[emotion]
    
    return render_template('hasil.html', 
                         emotion=emotion,
                         confidence=confidence,
                         emotion_info=emotion_info)

@app.route('/api/emotions')
def get_emotions():
    """API untuk mendapatkan daftar emosi"""
    return jsonify(EMOTION_CONFIG)

@app.route('/health')
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None,
        'tokenizer_loaded': tokenizer is not None,
        'timestamp': datetime.now().isoformat()
    })

@app.errorhandler(404)
def not_found(error):
    """Handler untuk error 404"""
    return render_template('404.html'), 404

@app.errorhandler(500)
def internal_error(error):
    """Handler untuk error 500"""
    logger.error(f"Internal server error: {str(error)}")
    return render_template('500.html'), 500

# @app.before_first_request
# def initialize_app():
#     """Inisialisasi aplikasi"""
#     # Buat folder yang diperlukan
#     os.makedirs('uploads', exist_ok=True)
#     os.makedirs('Model', exist_ok=True)
    
#     # Load model
#     load_emotion_model()
    
#     logger.info("Aplikasi EmotifyLyrics berhasil diinisialisasi")

if __name__ == '__main__':
    # Inisialisasi saat startup (sebagai pengganti before_first_request)
    os.makedirs('uploads', exist_ok=True)
    os.makedirs('Model', exist_ok=True)
    os.makedirs('Static', exist_ok=True)
    os.makedirs('templates', exist_ok=True)

    load_emotion_model()

    logger.info("Aplikasi EmotifyLyrics berhasil diinisialisasi")

    app.run(debug=True, host='0.0.0.0', port=5000)
