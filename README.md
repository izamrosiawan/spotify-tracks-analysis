# Analisis Data & Pemodelan Spotify Tracks

Repositori ini berisi proyek analisis data eksploratif (EDA) serta pemodelan Machine Learning menggunakan dataset Spotify Tracks (`dataset.csv`). Proyek ini bertujuan untuk menganalisis hubungan antar fitur audio musik, mengelompokkan karakteristik musik, serta mengevaluasi faktor yang memengaruhi popularitas lagu.

## Dokumentasi Berkas
- `dataset/dataset.csv`: Dataset mentah yang berisi data lebih dari 114.000 lagu dari Spotify.
- `notebook.ipynb`: Jupyter Notebook utama yang memuat kode analisis, visualisasi, dan pemodelan lengkap.
- `requirements.txt`: Daftar pustaka Python yang digunakan dalam proyek ini.

## Visualisasi & Ringkasan Analisis

### 1. Sebaran Popularitas Lagu
Sebagian besar lagu dalam dataset ini terkonsentrasi pada tingkat popularitas rendah (nilai 0), yang menunjukkan banyaknya entri lagu baru atau lagu yang kurang dikenal publik. Sisa data membentuk kurva distribusi normal dengan puncak popularitas di rentang nilai 40-60.
![Sebaran Popularitas](plots/popularity_distribution.png)

### 2. Korelasi Antar Fitur Audio
Berdasarkan analisis korelasi, hubungan linear terkuat ditemukan antara fitur **Energy** dan **Loudness** dengan koefisien korelasi sebesar **~0.76**. Hal ini mengindikasikan bahwa lagu yang memiliki tingkat energi tinggi cenderung diproduksi dengan volume suara yang lebih keras. Sebaliknya, fitur **Acousticness** memiliki korelasi negatif yang kuat dengan energi dan kenyaringan suara.
![Korelasi Fitur](plots/correlation_matrix.png)

### 3. Genre Musik Terpopuler
Berdasarkan rata-rata nilai popularitas per genre (dengan syarat minimal terdapat 100 lagu per genre untuk menjaga validitas data), genre pop, rock, dan hip-hop menempati posisi teratas di dalam dataset ini.
![Top Genres](plots/top_genres_popularity.png)

### 4. Hasil Clustering (K-Means)
Lagu dikelompokkan ke dalam 4 cluster utama berdasarkan karakteristik audio intrinsik (`danceability`, `energy`, `acousticness`, `instrumentalness`, dan `valence`):
- **Cluster 0 (Acoustic/Slow)**: Karakteristik *acousticness* tinggi dengan tingkat energi yang rendah.
- **Cluster 1 (Dance/Party)**: Karakteristik *energy*, *danceability*, dan keceriaan (*valence*) yang tinggi.
- **Cluster 2 (Instrumental/Ambient)**: Karakteristik nilai instrumental (*instrumentalness*) yang tinggi.
- **Cluster 3 (Modern Pop/Rock)**: Lagu dengan tingkat energi tinggi namun memiliki *acousticness* yang rendah.
![Cluster](plots/spotify_clusters.png)

### 5. Analisis Fitur Prediksi Popularitas
Melalui model Random Forest Regressor, diperoleh kesimpulan bahwa fitur audio intrinsik saja belum sepenuhnya memadai untuk memprediksi tingkat popularitas lagu secara presisi (skor R2 relatif rendah). Dari analisis pentingnya fitur (*feature importance*), durasi lagu (`duration_ms`), tingkat kebisingan (`loudness`), dan nilai akustik (`acousticness`) terbukti memiliki tingkat pengaruh terbesar dibandingkan fitur audio lainnya.
![Feature Importance](plots/feature_importances.png)

## Kesimpulan Utama
- **Keterkaitan Energi dan Volume**: Terdapat korelasi positif yang sangat kuat antara tingkat energi musik dengan volume rekaman suara (loudness).
- **Variabilitas Fitur Lintas Genre**: Musik dance dan pop memiliki nilai *danceability* yang jauh lebih tinggi dan terpusat dibanding genre klasik maupun metal.
- **Popularitas Lagu**: Karakteristik audio bawaan suatu lagu tidak menjadi satu-satunya penentu popularitas. Faktor eksternal seperti strategi pemasaran, tren media sosial (viralitas), serta algoritma rekomendasi Spotify memegang peranan yang sangat signifikan di industri musik.
