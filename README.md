# Analisis Data & Prediksi Popularitas Lagu Spotify

---

### 🎯 Pernyataan Masalah Bisnis (Business Problem Statement)
Dalam industri streaming musik, retensi pengguna sangat dipengaruhi oleh akurasi dan personalisasi mesin rekomendasi konten. Platform streaming harus memahami karakteristik akustik intrinsik musik dan melakukan segmentasi lagu untuk membuat playlist dengan keterlibatan tinggi, serta mengenali faktor pemasaran eksternal yang memengaruhi popularitas.

---

### 📌 Ringkasan Eksekutif (30 Detik Baca)
* **Tujuan**: Mengeksplorasi dan menganalisis **lebih dari 114.000 lagu** dari Spotify untuk mengungkap pola audio utama, segmentasi genre, dan memprediksi popularitas lagu menggunakan Machine Learning.
* **Temuan Utama**:
  - **Korelasi Fitur**: Fitur *Energy* dan *Loudness* memiliki korelasi positif yang sangat kuat (**0.76**). Sebaliknya, *Acousticness* berkorelasi negatif kuat dengan *energy* (**-0.73**) dan *loudness* (**-0.59**).
  - **Klasterisasi Lagu (Clustering)**: Lagu dikelompokkan ke dalam 4 klaster utama:
    - **Klaster 3 (Dance/Party - 38,21% / 43.562 lagu)**: *Danceability* (0,69), *energy* (0,70), dan *valence/keceriaan* (0,70) yang tinggi.
    - **Klaster 0 (Loud/Energetic - 28,90% / 32.943 lagu)**: Energi tinggi (0,78) dan *acousticness* rendah (0,10).
    - **Klaster 1 (Acoustic/Slow - 22,06% / 25.153 lagu)**: Keakustikan tinggi (0,80) dan energi rendah (0,29).
    - **Klaster 2 (Instrumental/Ambient - 10,83% / 12.342 lagu)**: Keinstrumentalan tinggi (0,79).
  - **Prediksi Popularitas**: Model Random Forest Regressor menunjukkan bahwa karakteristik audio intrinsik saja memprediksi popularitas secara terbatas dengan skor R² sebesar **15,47%** (MSE: 353.52, RMSE: 18.80). Fitur yang paling memengaruhi adalah durasi lagu (**duration_ms**), kenyaringan (**loudness**), dan keakustikan (**acousticness**).
* **Rekomendasi Bisnis**:
  - **Rekomendasi Berbasis Fitur**: Implementasikan sistem rekomendasi playlist berbasis kemiripan kosinus (cosine similarity) pada karakteristik audio untuk mencocokkan selera pengguna secara spesifik.
  - **Segmentasi Playlist Berbasis Mood**: Gunakan 4 klaster utama untuk mengotomatiskan kurasi playlist berdasarkan suasana hati (misalnya, Chill Acoustic untuk Klaster 1, Workout Energetic untuk Klaster 0/3).
  - **A/B Test Rekomendasi**: Lakukan uji A/B untuk melihat apakah rekomendasi berbasis kemiripan fitur audio menghasilkan tingkat klik (CTR) dan durasi sesi yang lebih tinggi dibanding algoritma kolaboratif murni.

---

### 🛡️ Kualitas Data & Asumsi
* **Missing Values**: Baris dengan data metadata yang kosong (seperti nama lagu atau nama artis, mencakup <0,1% total dataset) dibuang selama tahap pembersihan untuk menjamin integritas analisis.
* **Outlier Treatment**: Fitur numerik yang sangat menceng, seperti `duration_ms` dan `speechiness`, dinormalisasi menggunakan `StandardScaler` untuk mencegah bias akibat perbedaan skala pada klasterisasi K-Means yang berbasis jarak.
* **Asumsi**: Kami mengasumsikan metrik fitur akustik yang diekstrak oleh API Spotify konsisten secara internal dan merepresentasikan karakteristik audio yang sebenarnya. Kami juga mengasumsikan skor popularitas mewakili preferensi pendengar secara global.

---

### 📊 Wawasan Utama & Visualisasi

#### 1. Sebaran Popularitas Lagu
Skor popularitas sangat condong ke kiri. Banyak sekali lagu yang memiliki popularitas 0 (lagu baru/kurang dikenal). Sisanya berdistribusi normal di rentang 40-60.
![Sebaran Popularitas](images/popularity_distribution.png)

#### 2. Matriks Korelasi Fitur Audio
Korelasi terkuat sebesar **0,76** terjadi antara **energy** dan **loudness**. **Acousticness** memiliki korelasi negatif yang kuat dengan energi (**-0,73**) dan kenyaringan (**-0,59**).
![Korelasi Fitur](images/correlation_matrix.png)

#### 3. Genre Terpopuler
Pop, rock, dan hip-hop menempati posisi teratas berdasarkan rata-rata popularitas dalam dataset.
![Top Genres](images/top_genres_popularity.png)

#### 4. Pengelompokan K-Means (K=4)
Pengelompokan menghasilkan 4 segmen:
* **Klaster 3 (Dance/Party)**: 38,21% lagu. Tingkat *valence* (0,70) dan *danceability* (0,69) yang tinggi.
* **Klaster 0 (Loud/Energetic)**: 28,90% lagu. Energi tinggi (0,78) dan *acousticness* rendah (0,10).
* **Klaster 1 (Acoustic/Slow)**: 22,06% lagu. Keakustikan tinggi (0,80) dan energi rendah (0,29).
* **Klaster 2 (Instrumental/Ambient)**: 10,83% lagu. Keinstrumentalan tinggi (0,79).
![Cluster](images/spotify_clusters.png)

#### 5. Pengaruh Fitur untuk Prediksi
Model Random Forest menghasilkan skor R² sebesar **15,47%**. Fitur dengan pengaruh terbesar adalah **duration_ms**, **loudness**, dan **acousticness**.
![Feature Importance](images/feature_importances.png)

---

### ⚠️ Keterbatasan & Langkah Selanjutnya
* **Penjelasan R² Rendah**: Model prediksi popularitas menghasilkan R² sebesar **15,47%**. Hasil statistik ini membuktikan bahwa fitur audio bawaan sebuah lagu *bukanlah* penentu utama popularitasnya. Popularitas lagu di dunia nyata sangat didorong oleh faktor eksternal yang tidak terdapat dalam dataset ini:
  - Anggaran pemasaran dan kampanye promosi dari label rekaman.
  - Popularitas artis dan basis pengikut di media sosial.
  - Tren viral di media sosial (seperti TikTok atau Instagram Reels).
  - Penempatan di playlist kurasi utama Spotify (misalnya, "Today's Top Hits").
