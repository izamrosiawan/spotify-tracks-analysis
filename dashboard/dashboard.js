/**
 * Spotify Insights Dashboard - Interactivity & Analytics Engine
 * Implements K-Means classification, Ridge Regression prediction,
 * Chart.js renders, custom Heatmap, theme toggling, and smooth scrolling.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide Icons
    lucide.createIcons();

    // Elements
    const songSearch = document.getElementById('song-search');
    const searchResults = document.getElementById('search-results');
    const predPopularityValue = document.getElementById('pred-popularity-value');
    const gaugeProgress = document.getElementById('gauge-progress');
    
    const clusterNumberBadge = document.getElementById('cluster-number-badge');
    const clusterNameTitle = document.getElementById('cluster-name-title');
    const clusterDescText = document.getElementById('cluster-desc-text');
    
    const workspaceWrapper = document.querySelector('.workspace-wrapper');
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const themeIcon = document.getElementById('theme-icon');
    
    // Sliders & inputs
    const sliderIds = [
        'duration_ms', 'tempo', 'loudness', 'danceability', 'energy', 
        'acousticness', 'instrumentalness', 'valence', 'speechiness', 'liveness'
    ];
    const keySelect = document.getElementById('key');
    const modeSelect = document.getElementById('mode');
    
    // Cluster profiles descriptions
    const clusterMetaInfo = {
        0: {
            name: "Dance / Party (Energetik & Ceria)",
            desc: "Klaster ini didominasi oleh lagu-lagu dengan tingkat keceriaan (valence) dan ketukan dansa (danceability) yang sangat tinggi, serta energi audio yang kuat. Musik dansa elektrik, disko, dan pop modern mendominasi kelompok ini.",
            color: "#0071e3",
            portion: "38.2% dari Dataset"
        },
        1: {
            name: "Loud / Energetic (Keras & Cadas)",
            desc: "Klaster lagu dengan tingkat energi tertinggi dan volume kenyaringan (loudness) yang sangat keras, namun dengan keceriaan yang lebih rendah. Sangat mewakili genre Rock, Metal, dan Electronic/Dance bertempo cepat.",
            color: "#ff3b30",
            portion: "28.9% dari Dataset"
        },
        2: {
            name: "Acoustic / Slow (Tenang & Organik)",
            desc: "Klaster dengan keakustikan (acousticness) sangat tinggi dan energi yang sangat rendah. Musik klasik, lagu akustik ballad, dan lagu folk santai berada di kelompok ini. Menawarkan suasana tenang dan intim.",
            color: "#34c759",
            portion: "22.1% dari Dataset"
        },
        3: {
            name: "Instrumental / Ambient (Fokus & Latar)",
            desc: "Klaster musik instrumental dengan tingkat keakustikan tinggi dan vokal yang hampir tidak ada (instrumentalness mendekati 1.0). Lagu pengantar belajar, musik meditasi, dan ambient lo-fi berada di klaster ini.",
            color: "#af52de",
            portion: "10.8% dari Dataset"
        }
    };

    // --- 1. DYNAMIC DATE & STATUS UPDATE ---
    function updateStatusDate() {
        const now = new Date();
        const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
        const day = String(now.getDate()).padStart(2, '0');
        const month = months[now.getMonth()];
        const year = now.getFullYear();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        
        const dateString = `DATE: ${day}-${month}-${year} // UTC+07:00`; // Assuming local timezone or simplified representation
        document.getElementById('status-date').textContent = dateString;
    }
    updateStatusDate();
    setInterval(updateStatusDate, 60000); // Update every minute

    // --- 2. POPULATE INITIAL STATE & SLIDERS ---
    function updateSliderLabels() {
        sliderIds.forEach(id => {
            const el = document.getElementById(id);
            const valEl = document.getElementById(`val-${id}`);
            if (id === 'duration_ms') {
                const minutes = Math.floor(el.value / 60000);
                const seconds = ((el.value % 60000) / 1000).toFixed(0);
                valEl.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
            } else if (id === 'tempo') {
                valEl.textContent = `${el.value} BPM`;
            } else if (id === 'loudness') {
                valEl.textContent = `${el.value} dB`;
            } else {
                valEl.textContent = parseFloat(el.value).toFixed(2);
            }
        });

        const keys = ["C", "C# / D♭", "D", "D# / E♭", "E", "F", "F# / G♭", "G", "G# / A♭", "A", "A# / B♭", "B"];
        const modeText = modeSelect.value === "1" ? "Mayor" : "Minor";
        document.getElementById('val-key-mode').textContent = `${keys[keySelect.value]} ${modeText}`;
    }

    sliderIds.forEach(id => {
        const el = document.getElementById(id);
        el.addEventListener('input', () => {
            updateSliderLabels();
            calculatePrediction();
        });
    });
    keySelect.addEventListener('change', () => {
        updateSliderLabels();
        calculatePrediction();
    });
    modeSelect.addEventListener('change', () => {
        updateSliderLabels();
        calculatePrediction();
    });

    // --- 3. MULTIPLE REGRESSION PREDICTOR & K-MEANS CLASSIFIER ---
    function calculatePrediction() {
        const duration_ms = parseFloat(document.getElementById('duration_ms').value);
        const danceability = parseFloat(document.getElementById('danceability').value);
        const energy = parseFloat(document.getElementById('energy').value);
        const key = parseInt(document.getElementById('key').value);
        const loudness = parseFloat(document.getElementById('loudness').value);
        const mode = parseInt(document.getElementById('mode').value);
        const speechiness = parseFloat(document.getElementById('speechiness').value);
        const acousticness = parseFloat(document.getElementById('acousticness').value);
        const instrumentalness = parseFloat(document.getElementById('instrumentalness').value);
        const liveness = parseFloat(document.getElementById('liveness').value);
        const valence = parseFloat(document.getElementById('valence').value);
        const tempo = parseFloat(document.getElementById('tempo').value);

        const xValues = [duration_ms, danceability, energy, key, loudness, mode, speechiness, acousticness, instrumentalness, liveness, valence, tempo];

        // 3a. Scale X values
        const predMeans = dashboardData.pred_scaler_params.mean;
        const predScales = dashboardData.pred_scaler_params.scale;
        const xScaled = xValues.map((val, idx) => (val - predMeans[idx]) / predScales[idx]);

        // 3b. Compute Ridge Regression prediction
        const coefs = dashboardData.predictor_coefficients.coef;
        const intercept = dashboardData.predictor_coefficients.intercept;
        
        let prediction = intercept;
        for (let i = 0; i < xScaled.length; i++) {
            prediction += xScaled[i] * coefs[i];
        }
        prediction = Math.max(0, Math.min(100, prediction));

        // Update Gauge UI
        predPopularityValue.textContent = Math.round(prediction);
        const degrees = (prediction / 100) * 360;
        gaugeProgress.style.background = `conic-gradient(var(--color-primary) ${degrees}deg, var(--color-border) ${degrees}deg)`;

        // 3c. K-Means Classification (using 5 features)
        const clusterInput = [danceability, energy, acousticness, instrumentalness, valence];
        const clusterMeans = dashboardData.cluster_scaler_params.mean;
        const clusterScales = dashboardData.cluster_scaler_params.scale;
        const clusterScaled = clusterInput.map((val, idx) => (val - clusterMeans[idx]) / clusterScales[idx]);

        let minDistance = Infinity;
        let assignedCluster = 0;

        for (let clusterId = 0; clusterId < 4; clusterId++) {
            const profile = dashboardData.cluster_profiles[clusterId];
            const profileScaled = [
                (profile.danceability - clusterMeans[0]) / clusterScales[0],
                (profile.energy - clusterMeans[1]) / clusterScales[1],
                (profile.acousticness - clusterMeans[2]) / clusterScales[2],
                (profile.instrumentalness - clusterMeans[3]) / clusterScales[3],
                (profile.valence - clusterMeans[4]) / clusterScales[4]
            ];

            let distance = 0;
            for (let i = 0; i < clusterScaled.length; i++) {
                distance += Math.pow(clusterScaled[i] - profileScaled[i], 2);
            }
            distance = Math.sqrt(distance);

            if (distance < minDistance) {
                minDistance = distance;
                assignedCluster = clusterId;
            }
        }

        // Update Cluster UI
        const meta = clusterMetaInfo[assignedCluster];
        clusterNumberBadge.textContent = `Klaster ${assignedCluster}`;
        clusterNumberBadge.style.color = meta.color;
        clusterNumberBadge.style.backgroundColor = `${meta.color}15`;
        clusterNameTitle.textContent = meta.name;
        clusterDescText.textContent = meta.desc;

        // Update visual profile comparison bars
        const profile = dashboardData.cluster_profiles[assignedCluster];
        document.getElementById('profile-val-dance').textContent = profile.danceability.toFixed(2);
        document.getElementById('profile-bar-dance').style.width = `${profile.danceability * 100}%`;
        document.getElementById('profile-bar-dance').style.backgroundColor = meta.color;

        document.getElementById('profile-val-energy').textContent = profile.energy.toFixed(2);
        document.getElementById('profile-bar-energy').style.width = `${profile.energy * 100}%`;
        document.getElementById('profile-bar-energy').style.backgroundColor = meta.color;

        document.getElementById('profile-val-acoustic').textContent = profile.acousticness.toFixed(2);
        document.getElementById('profile-bar-acoustic').style.width = `${profile.acousticness * 100}%`;
        document.getElementById('profile-bar-acoustic').style.backgroundColor = meta.color;

        document.getElementById('profile-val-instrumental').textContent = profile.instrumentalness.toFixed(2);
        document.getElementById('profile-bar-instrumental').style.width = `${profile.instrumentalness * 100}%`;
        document.getElementById('profile-bar-instrumental').style.backgroundColor = meta.color;

        document.getElementById('profile-val-valence').textContent = profile.valence.toFixed(2);
        document.getElementById('profile-bar-valence').style.width = `${profile.valence * 100}%`;
        document.getElementById('profile-bar-valence').style.backgroundColor = meta.color;
    }

    // --- 4. SAMPLE TRACK SEARCH & AUTOCOMPLETE ---
    songSearch.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        if (query.length < 2) {
            searchResults.classList.add('hidden');
            return;
        }

        const matches = dashboardData.sample_songs.filter(song => 
            song.track_name.toLowerCase().includes(query) || 
            song.artists.toLowerCase().includes(query)
        ).slice(0, 5);

        if (matches.length === 0) {
            searchResults.innerHTML = '<div class="search-item" style="cursor:default;color:var(--color-text-muted);">Lagu tidak ditemukan</div>';
        } else {
            searchResults.innerHTML = matches.map(song => `
                <div class="search-item" data-song-key="${song.artists}-${song.track_name}">
                    <div class="song-title">${song.track_name}</div>
                    <div class="song-artist">${song.artists} &bull; ${song.track_genre}</div>
                </div>
            `).join('');
        }
        searchResults.classList.remove('hidden');
    });

    searchResults.addEventListener('click', (e) => {
        const item = e.target.closest('.search-item');
        if (!item || !item.dataset.songKey) return;

        const [artist, name] = item.dataset.songKey.split('-');
        const song = dashboardData.sample_songs.find(s => s.artists === artist && s.track_name === name);

        if (song) {
            document.getElementById('duration_ms').value = song.duration_ms;
            document.getElementById('tempo').value = Math.round(song.tempo);
            document.getElementById('loudness').value = song.loudness;
            document.getElementById('key').value = song.key;
            document.getElementById('mode').value = song.mode;
            document.getElementById('danceability').value = song.danceability;
            document.getElementById('energy').value = song.energy;
            document.getElementById('acousticness').value = song.acousticness;
            document.getElementById('instrumentalness').value = song.instrumentalness;
            document.getElementById('liveness').value = song.liveness;
            document.getElementById('valence').value = song.valence;
            document.getElementById('speechiness').value = song.speechiness;

            updateSliderLabels();
            calculatePrediction();

            songSearch.value = `${song.track_name} - ${song.artists}`;
        }
        searchResults.classList.add('hidden');
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-box')) {
            searchResults.classList.add('hidden');
        }
    });

    // --- 5. CLUSTER EXPLORER TAB SYSTEM & SONGS DISPLAY ---
    let clusterChart = null;

    function renderClusterChart(clusterId) {
        const profile = dashboardData.cluster_profiles[clusterId];
        const ctx = document.getElementById('clusterProfileChart').getContext('2d');
        const meta = clusterMetaInfo[clusterId];

        const isDark = document.body.classList.contains('dark-theme');
        const textCol = isDark ? '#86868b' : '#1d1d1f';
        const gridCol = isDark ? '#232328' : '#e5e7eb';

        if (clusterChart) {
            clusterChart.destroy();
        }

        clusterChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Danceability', 'Energy', 'Acousticness', 'Instrumentalness', 'Valence'],
                datasets: [{
                    label: 'Nilai Rata-rata',
                    data: [
                        profile.danceability,
                        profile.energy,
                        profile.acousticness,
                        profile.instrumentalness,
                        profile.valence
                    ],
                    backgroundColor: `${meta.color}90`,
                    borderColor: meta.color,
                    borderWidth: 1.5,
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 1.0,
                        grid: { color: gridCol },
                        ticks: { 
                            color: textCol,
                            font: { family: 'Plus Jakarta Sans', size: 10 } 
                        }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { 
                            color: textCol,
                            font: { family: 'Plus Jakarta Sans', size: 10 } 
                        }
                    }
                }
            }
        });
    }

    function selectExplorerCluster(clusterId) {
        const meta = clusterMetaInfo[clusterId];
        
        document.getElementById('explorer-cluster-title').textContent = meta.name;
        document.getElementById('explorer-cluster-portion').textContent = meta.portion;
        document.getElementById('explorer-cluster-desc').textContent = meta.desc;

        const clusterSongs = dashboardData.sample_songs.filter(s => s.music_cluster === parseInt(clusterId)).slice(0, 4);
        const songsListEl = document.getElementById('explorer-songs-list');
        
        songsListEl.innerHTML = clusterSongs.map(song => `
            <div class="songs-list-item">
                <div>
                    <span class="song-name">${song.track_name}</span>
                    <span class="song-artist-text"> - ${song.artists}</span>
                </div>
                <span class="song-pop-badge" title="Popularitas">${song.popularity}</span>
            </div>
        `).join('');

        renderClusterChart(clusterId);
    }

    const tabBtns = document.querySelectorAll('.cluster-tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            tabBtns.forEach(b => b.classList.remove('active'));
            const currentBtn = e.target.closest('.cluster-tab-btn');
            currentBtn.classList.add('active');
            
            const clusterId = currentBtn.dataset.cluster;
            selectExplorerCluster(clusterId);
        });
    });

    // --- 6. VISUAL ANALYTICS SUITE CHARTS ---
    let featureImportanceChart = null;
    let topGenresChart = null;

    function buildAnalyticsCharts() {
        const isDark = document.body.classList.contains('dark-theme');
        const textCol = isDark ? '#86868b' : '#1d1d1f';
        const gridCol = isDark ? '#232328' : '#e5e7eb';

        // 6a. Feature Importance Chart
        const featureLabels = Object.keys(dashboardData.feature_importances);
        const featureValues = Object.values(dashboardData.feature_importances);
        const fiCtx = document.getElementById('featureImportanceChart').getContext('2d');

        if (featureImportanceChart) featureImportanceChart.destroy();
        featureImportanceChart = new Chart(fiCtx, {
            type: 'bar',
            data: {
                labels: featureLabels.map(f => f.replace('_ms', '').replace('ness', '')),
                datasets: [{
                    data: featureValues,
                    backgroundColor: '#0071e3d0',
                    hoverBackgroundColor: '#0071e3',
                    borderRadius: 4
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        grid: { color: gridCol },
                        ticks: { color: textCol, font: { family: 'Plus Jakarta Sans', size: 10 } },
                        title: { display: true, text: 'Importance Weight', color: textCol, font: { family: 'Plus Jakarta Sans', size: 11 } }
                    },
                    y: {
                        grid: { display: false },
                        ticks: { color: textCol, font: { family: 'Plus Jakarta Sans', size: 11 } }
                    }
                }
            }
        });

        // 6b. Top Popular Genres Chart
        const genreLabels = dashboardData.top_genres.map(g => g.track_genre);
        const genrePopularities = dashboardData.top_genres.map(g => g.avg_popularity);
        const tgCtx = document.getElementById('topGenresChart').getContext('2d');

        if (topGenresChart) topGenresChart.destroy();
        topGenresChart = new Chart(tgCtx, {
            type: 'bar',
            data: {
                labels: genreLabels,
                datasets: [{
                    data: genrePopularities,
                    backgroundColor: isDark ? '#f5f5f7bb' : '#1d1d1fcf',
                    hoverBackgroundColor: isDark ? '#ffffff' : '#1d1d1f',
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: gridCol },
                        ticks: { color: textCol, font: { family: 'Plus Jakarta Sans', size: 10 } },
                        title: { display: true, text: 'Rata-rata Popularitas (0-100)', color: textCol, font: { family: 'Plus Jakarta Sans', size: 11 } }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { 
                            color: textCol,
                            font: { family: 'Plus Jakarta Sans', size: 9 },
                            maxRotation: 45,
                            minRotation: 45
                        }
                    }
                }
            }
        });
    }

    // --- 7. CORRELATION HEATMAP IMPLEMENTATION ---
    const heatmapEl = document.getElementById('correlation-heatmap');
    const tooltipText = document.getElementById('correlation-tooltip-text');

    const correlationDescriptions = {
        'energy-loudness': 'Korelasi positif yang sangat kuat (0.76). Lagu dengan tingkat energi tinggi hampir selalu direkam dengan tingkat kenyaringan volume yang keras.',
        'energy-acousticness': 'Korelasi negatif yang sangat kuat (-0.73). Menunjukkan bahwa instrumen akustik alami cenderung memiliki energi suara yang jauh lebih tenang dibanding instrumen elektrik.',
        'acousticness-loudness': 'Korelasi negatif yang kuat (-0.59). Menandakan volume rekaman akustik alami biasanya lebih kecil dan tidak sekencang musik elektronik/distorsi.',
        'energy-valence': 'Korelasi positif sedang (0.3). Lagu dengan tempo dan energi tinggi cenderung memiliki nuansa suasana hati yang lebih positif/cerah.',
        'valence-danceability': 'Korelasi positif sedang (0.4). Lagu yang bernuansa gembira dan ceria memiliki kecenderungan tinggi untuk enak didengar sambil bergoyang.',
        'popularity-loudness': 'Korelasi positif yang sangat kecil (0.07). Menunjukkan volume kerasnya lagu memiliki dampak yang sangat minim terhadap popularitasnya.',
        'popularity-duration_ms': 'Korelasi negatif yang sangat kecil (-0.02). Durasi lagu tidak memiliki pengaruh nyata terhadap apakah lagu itu akan populer atau tidak.',
        'popularity-danceability': 'Korelasi positif yang lemah (0.06). Meskipun lemah, lagu yang lebih gampang dibuat bergoyang memiliki kecenderungan popularitas sedikit lebih baik.',
        'instrumentalness-acousticness': 'Korelasi positif lemah (0.28). Sebagian besar lagu instrumental memiliki instrumen akustik (seperti piano klasik, gitar akustik) di dalamnya.'
    };

    function buildHeatmap() {
        const features = dashboardData.corr_data.features;
        const matrix = dashboardData.corr_data.matrix;
        const cleanFeatures = features.map(f => f.replace('_ms', '').replace('ness', ''));

        let html = '';
        html += '<div class="heatmap-header-cell heatmap-row-header"></div>'; 
        for (let j = 0; j < cleanFeatures.length; j++) {
            html += `<div class="heatmap-header-cell" title="${features[j]}">${cleanFeatures[j]}</div>`;
        }

        const isDark = document.body.classList.contains('dark-theme');
        const defaultTextCol = isDark ? '#f5f5f7' : '#1d1d1f';

        for (let i = 0; i < cleanFeatures.length; i++) {
            html += `<div class="heatmap-header-cell heatmap-row-header" title="${features[i]}">${cleanFeatures[i]}</div>`;
            for (let j = 0; j < cleanFeatures.length; j++) {
                const val = matrix[i][j];
                
                let bgColor = '';
                let textColor = defaultTextCol;
                
                if (val >= 0) {
                    const alpha = val.toFixed(2);
                    bgColor = `rgba(0, 113, 227, ${alpha})`;
                    if (val > 0.4) textColor = '#ffffff';
                } else {
                    const alpha = Math.abs(val).toFixed(2);
                    bgColor = `rgba(215, 0, 21, ${alpha})`;
                    if (val < -0.4) textColor = '#ffffff';
                }

                html += `
                    <div class="heatmap-cell" 
                         style="background-color: ${bgColor}; color: ${textColor};" 
                         data-f1="${features[i]}" 
                         data-f2="${features[j]}" 
                         data-val="${val.toFixed(2)}">
                        ${val.toFixed(2)}
                    </div>
                `;
            }
        }
        heatmapEl.innerHTML = html;

        heatmapEl.addEventListener('mouseover', (e) => {
            const cell = e.target.closest('.heatmap-cell');
            if (!cell) return;

            const f1 = cell.dataset.f1;
            const f2 = cell.dataset.f2;
            const val = parseFloat(cell.dataset.val);

            const key1 = `${f1}-${f2}`;
            const key2 = `${f2}-${f1}`;

            let desc = `Korelasi antara <strong>${f1}</strong> dan <strong>${f2}</strong> adalah <strong>${val > 0 ? '+' : ''}${val.toFixed(2)}</strong>.`;
            
            if (f1 === f2) {
                desc = `Korelasi variabel dengan dirinya sendiri selalu sempurna (+1.00).`;
            } else if (correlationDescriptions[key1]) {
                desc = correlationDescriptions[key1];
            } else if (correlationDescriptions[key2]) {
                desc = correlationDescriptions[key2];
            } else if (Math.abs(val) < 0.1) {
                desc += ` Hubungan linear antara kedua variabel ini sangat lemah atau hampir tidak ada.`;
            } else if (val > 0) {
                desc += ` Menunjukkan hubungan positif (jika satu naik, variabel lain cenderung naik).`;
            } else {
                desc += ` Menunjukkan hubungan terbalik/negatif (jika satu naik, variabel lain cenderung turun).`;
            }

            tooltipText.innerHTML = desc;
        });

        heatmapEl.addEventListener('mouseleave', () => {
            tooltipText.innerHTML = 'Arahkan kursor pada salah satu sel matriks korelasi untuk melihat analisis detailnya.';
        });
    }

    // --- 8. SMOOTH NAVIGATION SCROLLING INTERCEPTOR ---
    const sidebarButtons = document.querySelectorAll('.sidebar-btn');
    sidebarButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            
            sidebarButtons.forEach(b => b.classList.remove('active'));
            const currentBtn = e.target.closest('.sidebar-btn');
            currentBtn.classList.add('active');
            
            const targetId = currentBtn.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                // Scroll the workspace container, not the window
                workspaceWrapper.scrollTo({
                    top: targetElement.offsetTop - 20, // offset for padding
                    behavior: 'smooth'
                });
            }
        });
    });

    // --- 9. DARK/LIGHT THEME TOGGLE ---
    darkModeToggle.addEventListener('click', () => {
        const isDark = document.body.classList.toggle('dark-theme');
        
        // Update button icon
        if (isDark) {
            themeIcon.setAttribute('data-lucide', 'sun');
        } else {
            themeIcon.setAttribute('data-lucide', 'moon');
        }
        lucide.createIcons(); // Redraw icons

        // Rebuild charts with the new colors
        buildAnalyticsCharts();
        
        // Redraw cluster profile chart if it exists
        const activeTab = document.querySelector('.cluster-tab-btn.active');
        if (activeTab) {
            renderClusterChart(activeTab.dataset.cluster);
        }

        // Redraw heatmap
        buildHeatmap();
    });

    // --- 10. INITIAL EXECUTION ---
    updateSliderLabels();
    calculatePrediction();
    selectExplorerCluster("0");
    buildAnalyticsCharts();
    buildHeatmap();
});
