if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);

document.addEventListener('DOMContentLoaded', () => {
  window.scrollTo(0, 0);
  if (window.lucide) {
    lucide.createIcons();
  }

  const globalAudioToggle = document.getElementById('global-audio-toggle');
  const audioPlayIcon = document.getElementById('audio-play-icon');
  const audioStatusLabel = document.getElementById('audio-status-label');

  const predPopularityValue = document.getElementById('pred-popularity-value');
  const gaugeProgress = document.getElementById('gauge-progress');
  const tierBadge = document.getElementById('tier-badge');
  const tierBadgeText = document.getElementById('tier-badge-text');
  const tierExplanationText = document.getElementById('tier-explanation-text');

  const sliderIds = [
    'danceability', 'energy', 'loudness', 'valence', 'tempo',
    'acousticness', 'speechiness', 'instrumentalness'
  ];

  const clusterMetaInfo = {
    0: {
      name: "Dance / Party (Energetik & Ceria)",
      desc: "Klaster ini didominasi oleh lagu-lagu dengan tingkat keceriaan (valence) dan ketukan dansa (danceability) tinggi. Mewakili genre Pop, Latin, Hip Hop komersial, dan Disco.",
      color: "#16a34a",
      portion: "38.2% Dataset"
    },
    1: {
      name: "Loud & Distorted Energy (Keras & Cadas)",
      desc: "Klaster lagu berenergi maksimal dan distorsi kenyaringan tinggi (-4 dB s/d -6 dB) dengan keakustikan rendah. Mewakili Rock, Heavy Metal, Punk, dan Bass Electronic.",
      color: "#dc2626",
      portion: "28.9% Dataset"
    },
    2: {
      name: "Acoustic & Organic Calm (Tenang & Organik)",
      desc: "Klaster dengan nilai keakustikan tinggi (acousticness > 0.65) dan tempo santai. Sangat dominan pada lagu Akustik, Folk, Balada, Piano, dan Musik Klasik.",
      color: "#0284c7",
      portion: "22.1% Dataset"
    },
    3: {
      name: "Ambient & Focus Solitude (Fokus & Latar)",
      desc: "Klaster musik instrumental murni dengan vokal minim (instrumentalness mendekati 1.0) untuk konsentrasi, lo-fi beats, meditasi, dan latar belajar.",
      color: "#9333ea",
      portion: "10.8% Dataset"
    }
  };

  const archetypePresets = {
    'viral-pop': { danceability: 0.78, energy: 0.75, loudness: -5.2, valence: 0.70, tempo: 124, acousticness: 0.12, speechiness: 0.07, instrumentalness: 0.00 },
    'lofi-chill': { danceability: 0.62, energy: 0.38, loudness: -11.5, valence: 0.45, tempo: 84, acousticness: 0.72, speechiness: 0.05, instrumentalness: 0.85 },
    'festival-edm': { danceability: 0.70, energy: 0.92, loudness: -3.8, valence: 0.65, tempo: 128, acousticness: 0.04, speechiness: 0.09, instrumentalness: 0.25 },
    'melancholy-indie': { danceability: 0.48, energy: 0.32, loudness: -12.4, valence: 0.22, tempo: 96, acousticness: 0.86, speechiness: 0.04, instrumentalness: 0.02 },
    'hard-rock': { danceability: 0.45, energy: 0.88, loudness: -4.5, valence: 0.50, tempo: 142, acousticness: 0.01, speechiness: 0.08, instrumentalness: 0.15 }
  };

  function syncAudioEngine() {
    if (!window.cinematicAudioEngine) return;
    const getVal = (id, def) => {
      const el = document.getElementById(id);
      return el ? parseFloat(el.value) : def;
    };
    window.cinematicAudioEngine.updateParams({
      tempo: getVal('tempo', 124),
      energy: getVal('energy', 0.75),
      danceability: getVal('danceability', 0.78),
      valence: getVal('valence', 0.70),
      acousticness: getVal('acousticness', 0.12)
    });
  }

  function toggleAudioPlayback() {
    if (!window.cinematicAudioEngine) return;
    syncAudioEngine();
    const isPlaying = window.cinematicAudioEngine.toggle();

    if (globalAudioToggle && audioStatusLabel && audioPlayIcon) {
      if (isPlaying) {
        globalAudioToggle.classList.add('playing');
        const tempoEl = document.getElementById('tempo');
        audioStatusLabel.textContent = `${tempoEl ? Math.round(tempoEl.value) : 124} BPM`;
        audioPlayIcon.setAttribute('data-lucide', 'square');
      } else {
        globalAudioToggle.classList.remove('playing');
        audioStatusLabel.textContent = 'OFFLINE';
        audioPlayIcon.setAttribute('data-lucide', 'play');
      }
      if (window.lucide) lucide.createIcons();
    }
  }

  if (globalAudioToggle) globalAudioToggle.addEventListener('click', toggleAudioPlayback);

  function updateSliderLabels() {
    sliderIds.forEach(id => {
      const el = document.getElementById(id);
      const valEl = document.getElementById(`val-${id}`);
      if (!el || !valEl) return;

      if (id === 'tempo') {
        valEl.textContent = `${Math.round(el.value)} BPM`;
      } else if (id === 'loudness') {
        valEl.textContent = `${parseFloat(el.value).toFixed(1)} dB`;
      } else {
        valEl.textContent = parseFloat(el.value).toFixed(2);
      }
    });
  }

  function calculatePrediction() {
    if (!window.dashboardData || !dashboardData.pred_scaler_params || !dashboardData.predictor_coefficients) return;

    const getVal = (id, def) => {
      const el = document.getElementById(id);
      return el ? parseFloat(el.value) : def;
    };

    const duration_ms = 215000;
    const danceability = getVal('danceability', 0.78);
    const energy = getVal('energy', 0.75);
    const key = 5;
    const loudness = getVal('loudness', -5.2);
    const mode = 1;
    const speechiness = getVal('speechiness', 0.07);
    const acousticness = getVal('acousticness', 0.12);
    const instrumentalness = getVal('instrumentalness', 0.00);
    const liveness = 0.18;
    const valence = getVal('valence', 0.70);
    const tempo = getVal('tempo', 124);

    const xValues = [duration_ms, danceability, energy, key, loudness, mode, speechiness, acousticness, instrumentalness, liveness, valence, tempo];

    const predMeans = dashboardData.pred_scaler_params.mean;
    const predScales = dashboardData.pred_scaler_params.scale;
    const xScaled = xValues.map((val, idx) => (val - predMeans[idx]) / predScales[idx]);

    const coefs = dashboardData.predictor_coefficients.coef;
    const intercept = dashboardData.predictor_coefficients.intercept;

    let prediction = intercept;
    for (let i = 0; i < xScaled.length; i++) {
      prediction += xScaled[i] * coefs[i];
    }

    prediction = Math.max(5, Math.min(98, Math.round(prediction)));

    if (predPopularityValue) predPopularityValue.textContent = prediction;
    if (gaugeProgress) {
      const degrees = (prediction / 100) * 360;
      gaugeProgress.style.background = `conic-gradient(var(--color-primary) ${degrees}deg, var(--bg-surface-elevated) ${degrees}deg)`;
    }

    if (tierBadge && tierBadgeText && tierExplanationText) {
      tierBadge.className = 'tier-status-pill';
      if (prediction >= 70) {
        tierBadgeText.textContent = 'POTENTIAL GLOBAL HIT';
        tierExplanationText.textContent = 'Profil audio ideal dengan ritme danceability tinggi dan energi seimbang untuk kurasi playlist viral komersial.';
      } else if (prediction >= 50) {
        tierBadgeText.textContent = 'MAINSTREAM AIRPLAY';
        tierExplanationText.textContent = 'Karakteristik seimbang dengan potensi rotasi radio dan playlist regional kuat.';
      } else {
        tierBadgeText.textContent = 'NICHE / ACOUSTIC';
        tierExplanationText.textContent = 'Eksperimental atau instrumen organik dengan audiens pendengar spesifik.';
      }
    }
  }

  sliderIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', () => {
        updateSliderLabels();
        calculatePrediction();
        syncAudioEngine();
      });
    }
  });

  document.querySelectorAll('.preset-chip[data-preset]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.preset-chip[data-preset]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const preset = archetypePresets[btn.dataset.preset];
      if (preset) {
        Object.keys(preset).forEach(k => {
          const el = document.getElementById(k);
          if (el) el.value = preset[k];
        });
        updateSliderLabels();
        calculatePrediction();
        syncAudioEngine();
      }
    });
  });

  let clusterChart = null;

  function renderClusterProfile(clusterId) {
    if (!window.dashboardData || !dashboardData.cluster_profiles) return;
    const profile = dashboardData.cluster_profiles[clusterId];
    const meta = clusterMetaInfo[clusterId];
    if (!profile || !meta) return;

    const titleEl = document.getElementById('explorer-cluster-title');
    const portionEl = document.getElementById('explorer-cluster-portion');
    const descEl = document.getElementById('explorer-cluster-desc');

    if (titleEl) titleEl.textContent = meta.name;
    if (portionEl) portionEl.textContent = meta.portion;
    if (descEl) descEl.textContent = meta.desc;

    const chartCanvas = document.getElementById('clusterProfileChart');
    if (!chartCanvas) return;
    const ctx = chartCanvas.getContext('2d');
    if (clusterChart) clusterChart.destroy();

    const textCol = '#475569';
    const gridCol = 'rgba(15, 23, 42, 0.06)';

    clusterChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Danceability', 'Energy', 'Acousticness', 'Instrumentalness', 'Valence'],
        datasets: [{
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
        animation: { duration: 400 },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#0f172a',
            titleColor: '#fff',
            bodyColor: '#94a3b8',
            borderColor: meta.color,
            borderWidth: 1
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 1.0,
            grid: { color: gridCol },
            ticks: { color: textCol, font: { family: 'Plus Jakarta Sans', size: 10 } }
          },
          x: {
            grid: { display: false },
            ticks: { color: textCol, font: { family: 'Plus Jakarta Sans', size: 10 } }
          }
        }
      }
    });
  }

  document.querySelectorAll('.constellation-tab-item').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.constellation-tab-item').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderClusterProfile(tab.dataset.cluster);
    });
  });

  let fiChart = null;
  let tgChart = null;

  function buildAnalyticsCharts() {
    if (!window.dashboardData) return;
    const textCol = '#475569';
    const gridCol = 'rgba(15, 23, 42, 0.06)';

    const fiCanvas = document.getElementById('featureImportanceChart');
    if (fiCanvas && dashboardData.feature_importances) {
      const fiLabels = Object.keys(dashboardData.feature_importances);
      const fiValues = Object.values(dashboardData.feature_importances);
      const fiCtx = fiCanvas.getContext('2d');

      if (fiChart) fiChart.destroy();
      fiChart = new Chart(fiCtx, {
        type: 'bar',
        data: {
          labels: fiLabels.map(l => l.replace('_ms', '').toUpperCase()),
          datasets: [{
            data: fiValues,
            backgroundColor: '#15803db0',
            hoverBackgroundColor: '#15803d',
            borderRadius: 4
          }]
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          animation: { duration: 400 },
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: '#0f172a',
              titleColor: '#ffffff',
              bodyColor: '#94a3b8',
              borderColor: '#15803d',
              borderWidth: 1
            }
          },
          scales: {
            x: {
              grid: { color: gridCol },
              ticks: { color: textCol, font: { family: 'JetBrains Mono', size: 10 } }
            },
            y: {
              grid: { display: false },
              ticks: { color: textCol, font: { family: 'Plus Jakarta Sans', size: 10, weight: 600 } }
            }
          }
        }
      });
    }

    const tgCanvas = document.getElementById('topGenresChart');
    if (tgCanvas && dashboardData.top_genres) {
      const tgLabels = dashboardData.top_genres.map(g => g.track_genre.toUpperCase());
      const tgValues = dashboardData.top_genres.map(g => g.avg_popularity);
      const tgCtx = tgCanvas.getContext('2d');

      if (tgChart) tgChart.destroy();
      tgChart = new Chart(tgCtx, {
        type: 'bar',
        data: {
          labels: tgLabels,
          datasets: [{
            data: tgValues,
            backgroundColor: '#15803db0',
            hoverBackgroundColor: '#15803d',
            borderRadius: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: { duration: 400 },
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: '#0f172a',
              titleColor: '#ffffff',
              bodyColor: '#94a3b8',
              borderColor: '#15803d',
              borderWidth: 1
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: { color: gridCol },
              ticks: { color: textCol, font: { family: 'JetBrains Mono', size: 10 } }
            },
            x: {
              grid: { display: false },
              ticks: { color: textCol, font: { family: 'Plus Jakarta Sans', size: 9 }, maxRotation: 45 }
            }
          }
        }
      });
    }
  }

  function renderCorrelationHeatmap() {
    if (!window.dashboardData || !dashboardData.corr_data) return;
    const table = document.getElementById('heatmap-table');
    if (!table) return;

    const data = dashboardData.corr_data;
    const features = data.features;
    const matrix = data.matrix;

    let html = '<thead><tr><th>Feature</th>';
    features.forEach(f => {
      html += `<th>${f.replace('_ms', '').substring(0, 6)}</th>`;
    });
    html += '</tr></thead><tbody>';

    for (let i = 0; i < features.length; i++) {
      html += `<tr><td style="font-weight: 700; text-align: left;">${features[i].replace('_ms', '')}</td>`;
      for (let j = 0; j < features.length; j++) {
        const val = matrix[i][j];
        let bgColor = 'transparent';
        let textColor = '#0f172a';

        if (val > 0) {
          bgColor = `rgba(22, 163, 74, ${Math.min(val * 0.8, 0.85)})`;
          if (val > 0.45) textColor = '#ffffff';
        } else if (val < 0) {
          bgColor = `rgba(220, 38, 38, ${Math.min(Math.abs(val) * 0.8, 0.85)})`;
          if (Math.abs(val) > 0.45) textColor = '#ffffff';
        }
        html += `<td style="background-color: ${bgColor}; color: ${textColor};" title="${features[i]} vs ${features[j]}: ${val.toFixed(3)}">${val.toFixed(2)}</td>`;
      }
      html += '</tr>';
    }
    html += '</tbody>';
    table.innerHTML = html;
  }

  function renderAllKaTeX() {
    if (!window.katex) return;
    document.querySelectorAll('.katex-formula-box').forEach(el => {
      let tex = el.getAttribute('data-tex');
      if (!tex) {
        tex = el.textContent.trim().replace(/^\$\$|\$\$$/g, '').trim();
        if (tex) el.setAttribute('data-tex', tex);
      }
      if (tex) {
        try {
          katex.render(tex, el, { displayMode: true, throwOnError: false });
        } catch (err) {
          console.warn('KaTeX render warning:', err);
        }
      }
    });
  }

  function initDashboard() {
    updateSliderLabels();
    calculatePrediction();
    renderClusterProfile(0);
    buildAnalyticsCharts();
    renderCorrelationHeatmap();
    renderAllKaTeX();
  }

  // Self-healing initialization with immediate + polling fallbacks
  initDashboard();
  let retryCount = 0;
  const initInterval = setInterval(() => {
    retryCount++;
    if (window.dashboardData && window.dashboardData.corr_data) {
      initDashboard();
      clearInterval(initInterval);
    } else if (retryCount > 20) {
      clearInterval(initInterval);
    }
  }, 100);

  setTimeout(initDashboard, 250);
  setTimeout(initDashboard, 750);
  window.addEventListener('load', initDashboard);
});
