# Spotify Tracks Analysis

Repo ini isinya analisis data dan modeling kecil-kecilan buat dataset Spotify tracks (`dataset.csv`). Di sini gua coba cari insight menarik dari fitur-fitur audio lagu, ngelompokkin jenis musik (clustering), sama coba bikin model buat prediksi popularitas lagu.

## File di Sini
- `dataset/dataset.csv`: Dataset mentah lagu Spotify.
- `notebook.ipynb`: Jupyter notebook tempat gua nulis semua kode analisis, visualisasi, dan model ML.
- `requirements.txt`: Library python yang gua pake.

## Visual & Analisis Ringkas

### 1. Sebaran Popularitas Lagu
Banyak banget lagu yang dapet score popularitas 0 (mungkin lagu baru banget atau emang kurang terkenal). Tapi sisanya ngebentuk pola distribusi normal dengan puncak di sekitar score 40-60.
![Sebaran Popularitas](plots/popularity_distribution.png)

### 2. Hubungan Antar Fitur Audio (Korelasi)
Hubungan paling kuat itu ada di antara **Energy** dan **Loudness** (~0.76). Makin bising sebuah lagu, biasanya energinya juga makin tinggi. Sebaliknya, **Acousticness** punya hubungan negatif yang kuat sama energy dan loudness (lagu akustik cenderung lebih pelan dan santai).
![Korelasi Fitur](plots/correlation_matrix.png)

### 3. Genre Paling Populer
Dari hasil grouping, genre pop, rock, dan hip-hop masih mendominasi rata-rata popularitas tertinggi di dataset ini (hanya ngitung genre yang punya minimal 100 lagu biar adil).
![Top Genres](plots/top_genres_popularity.png)

### 4. Hasil Clustering (K-Means)
Lagu-lagu gua kelompokkin jadi 4 cluster berdasarkan karakteristik audionya:
- **Cluster 0**: Lagu santai / Akustik (acousticness tinggi)
- **Cluster 1**: Musik Instrumental / Lofi / Klasik (instrumentalness tinggi)
- **Cluster 2**: Lagu Energetik / Rock / Metal (energy & loudness tinggi)
- **Cluster 3**: Pop / Dance / Musik Ceria (danceability & valence tinggi)
![Cluster](plots/spotify_clusters.png)

### 5. Fitur Penting buat Prediksi Popularitas
Pas coba prediksi popularitas pake Random Forest, ternyata fitur audio bawaan aja belum cukup buat nebak dengan akurat (skor R2 kecil). Tapi dari model ini, kita tau kalau durasi lagu (`duration_ms`), `loudness`, dan `acousticness` punya pengaruh paling besar dibanding fitur audio lainnya.
![Feature Importance](plots/feature_importances.png)

## Kesimpulan
- **Musik Keras = Energi Tinggi**: Udah jelas dari korelasi kalau lagu yang direkam lebih keras (loudness tinggi) hampir selalu punya energy score yang tinggi juga.
- **Karakteristik Genre**: Genre dance/pop punya skor danceability yang jauh lebih tinggi dan stabil dibanding genre metal atau classical.
- **Popularitas Gak Cuma dari Audio**: Karakteristik audio (danceability, tempo, dll) sendirian gak bisa nentuin apakah sebuah lagu bakal populer atau gak. Faktor luar kayak promosi artis, viralitas di sosmed, dan algoritma rekomendasi Spotify jauh lebih berpengaruh besar.
