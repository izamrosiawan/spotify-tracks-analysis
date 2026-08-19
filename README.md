# Spotify Tracks Audio Features Analysis & Genre Profiling

[![Python](https://img.shields.io/badge/Python-3.9%2B-blue.svg)](https://www.python.org/)
[![Pandas](https://img.shields.io/badge/Pandas-Analytics-orange.svg)](https://pandas.pydata.org/)
[![Domain](https://img.shields.io/badge/Domain-Music%20Audio%20Analytics-brightgreen.svg)](#)
[![Tests](https://img.shields.io/badge/Tests-Pytest%20Passing-brightgreen.svg)](#)

Repositori ini menyajikan analisis komprehensif terhadap karakteristik audio lagu (*danceability, energy, acousticness, valence, tempo*) pada dataset Spotify Tracks untuk membedakan profil musik antar genre dan popularitas trek.

---

## 📂 Struktur Proyek

```
├── .gitignore          # Konfigurasi pengabaian cache Git
├── dashboard/          # File web dashboard interaktif
├── data/               # Dataset Spotify mentah & bersih (CSV)
├── images/             # Visualisasi plot komputasi 300 DPI
├── src/                # Modular Python audio analyzer (SpotifyAudioAnalyzer)
├── tests/              # Automated unit tests (Pytest: validasi rentang audio features)
├── notebook.ipynb      # Jupyter Notebook: Pemrosesan data, profiling audio genre, dan korelasi
├── requirements.txt    # Pinned stable dependencies
└── README.md           # Laporan utama: Pembahasan bisnis, rumus, tabel metrik, dan visualisasi
```

---

## 💻 Implementasi Modular & Pengujian Otomatis

Modul audio analyzer tersedia di `src/audio_analyzer.py`:

```python
from src.audio_analyzer import SpotifyAudioAnalyzer

analyzer = SpotifyAudioAnalyzer()
genre_profile = analyzer.get_genre_audio_profile()
print(genre_profile.head())
```

Jalankan automated test:
```bash
pytest tests/
```

---

## 🚀 Cara Menjalankan

1. **Pasang Dependensi**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Eksekusi Notebook**:
   ```bash
   jupyter notebook notebook.ipynb
   ```

---
*Spotify Tracks Audio Analytics Project.*
