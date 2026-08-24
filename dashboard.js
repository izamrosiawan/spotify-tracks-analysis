if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);

document.addEventListener('DOMContentLoaded', () => {
  window.scrollTo(0, 0);
  if (window.lucide) {
    lucide.createIcons();
  }

  const heroCanvas = document.getElementById('hero-canvas');
  const globalAudioToggle = document.getElementById('global-audio-toggle');
  const audioPlayIcon = document.getElementById('audio-play-icon');
  const audioStatusLabel = document.getElementById('audio-status-label');
  const btnAuditionTrack = document.getElementById('btn-audition-track');

  const themeToggle = document.getElementById('theme-toggle');
  const themeIconElement = document.getElementById('theme-icon-element');

  const songSearch = document.getElementById('song-search');
  const searchResults = document.getElementById('search-results');
  const predPopularityValue = document.getElementById('pred-popularity-value');
  const gaugeProgress = document.getElementById('gauge-progress');
  const tierBadge = document.getElementById('tier-badge');
  const tierBadgeText = document.getElementById('tier-badge-text');
  const tierExplanationText = document.getElementById('tier-explanation-text');
  const waterfallList = document.getElementById('waterfall-list');

  const sliderIds = [
    'danceability', 'energy', 'loudness', 'valence', 'tempo',
    'acousticness', 'speechiness', 'instrumentalness', 'duration_ms'
  ];
  const keySelect = document.getElementById('key');
  const modeSelect = document.getElementById('mode');

  const clusterMetaInfo = {
    0: {
      name: "Dance / Party Euphoria (Energetik & Ceria)",
      desc: "Didominasi oleh trek dengan ritme dansa tinggi (danceability > 0.70), kepositifan (valence), dan energi kuat. Mewakili Pop, Modern Dance, Reggaeton, dan Disco.",
      color: "#1ed760",
      portion: "38.2% Dataset"
    },
    1: {
      name: "Loud & Distorted Energy (Keras & Cadas)",
      desc: "Klaster berenergi puncak dan kompresi kenyaringan sangat tinggi (-4 dB s/d -6 dB) dengan keakustikan rendah. Mewakili Rock, Metal, Punk, dan Bass Heavy genres.",
      color: "#f43f5e",
      portion: "28.9% Dataset"
    },
    2: {
      name: "Acoustic & Organic Calm (Tenang & Organik)",
      desc: "Klaster dengan nilai keakustikan tinggi (acousticness > 0.65) dan tempo santai. Sangat dominan pada lagu Akustik, Folk, Balada, dan Classical.",
      color: "#38bdf8",
      portion: "22.1% Dataset"
    },
    3: {
      name: "Ambient & Focus Solitude (Fokus & Latar)",
      desc: "Klaster musik instrumental murni dengan vokal minim (instrumentalness mendekati 1.0) untuk konsentrasi, lo-fi beats, meditasi, dan soundscapes.",
      color: "#a855f7",
      portion: "10.8% Dataset"
    }
  };

  const archetypePresets = {
    'viral-pop': {
      danceability: 0.78, energy: 0.75, loudness: -5.2, valence: 0.70,
      tempo: 124, acousticness: 0.12, speechiness: 0.07, instrumentalness: 0.00,
      duration_ms: 195000, key: 0, mode: 1
    },
    'lofi-chill': {
      danceability: 0.62, energy: 0.38, loudness: -11.5, valence: 0.45,
      tempo: 84, acousticness: 0.72, speechiness: 0.05, instrumentalness: 0.85,
      duration_ms: 155000, key: 5, mode: 0
    },
    'festival-edm': {
      danceability: 0.70, energy: 0.92, loudness: -3.8, valence: 0.65,
      tempo: 128, acousticness: 0.04, speechiness: 0.09, instrumentalness: 0.25,
      duration_ms: 210000, key: 9, mode: 0
    },
    'melancholy-indie': {
      danceability: 0.48, energy: 0.32, loudness: -12.4, valence: 0.22,
      tempo: 96, acousticness: 0.86, speechiness: 0.04, instrumentalness: 0.02,
      duration_ms: 240000, key: 2, mode: 1
    },
    'hard-rock': {
      danceability: 0.45, energy: 0.88, loudness: -4.5, valence: 0.50,
      tempo: 142, acousticness: 0.01, speechiness: 0.08, instrumentalness: 0.15,
      duration_ms: 230000, key: 7, mode: 1
    }
  };

  if (heroCanvas) {
    const ctx = heroCanvas.getContext('2d');
    let width = (heroCanvas.width = heroCanvas.offsetWidth);
    let height = (heroCanvas.height = heroCanvas.offsetHeight);

    window.addEventListener('resize', () => {
      width = heroCanvas.width = heroCanvas.offsetWidth;
      height = heroCanvas.height = heroCanvas.offsetHeight;
    });

    const particles = [];
    const numParticles = 30;
    for (let i = 0; i < numParticles; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.5 + 1,
        speedX: (Math.random() - 0.5) * 0.25,
        speedY: (Math.random() - 0.5) * 0.25,
        opacity: Math.random() * 0.4 + 0.15
      });
    }

    let phase = 0;

    function renderCanvas() {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.speedX;
        p.y += p.speedY;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(22, 163, 74, ${p.opacity * 0.6})`;
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(15, 23, 42, ${0.06 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      const waves = [
        { amp: 26, freq: 0.006, speed: 0.018, color: 'rgba(22, 163, 74, 0.25)', yOffset: height * 0.62 },
        { amp: 18, freq: 0.010, speed: 0.024, color: 'rgba(15, 23, 42, 0.12)', yOffset: height * 0.65 },
        { amp: 32, freq: 0.003, speed: 0.012, color: 'rgba(22, 163, 74, 0.15)', yOffset: height * 0.60 }
      ];

      const freqData = window.cinematicAudioEngine && window.cinematicAudioEngine.isPlaying ? window.cinematicAudioEngine.getFrequencyData() : null;
      const energyBoost = freqData ? (freqData[2] / 255) * 25 : 0;

      waves.forEach(w => {
        ctx.beginPath();
        for (let x = 0; x <= width; x += 6) {
          const currentAmp = w.amp + energyBoost;
          const y = w.yOffset + Math.sin(x * w.freq + phase * w.speed) * currentAmp * Math.cos((x / width) * Math.PI - Math.PI / 2);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = w.color;
        ctx.lineWidth = 1.8;
        ctx.stroke();
      });

      phase += 1;
      requestAnimationFrame(renderCanvas);
    }
    renderCanvas();
  }

  function syncAudioEngine() {
    if (!window.cinematicAudioEngine) return;
    window.cinematicAudioEngine.updateParams({
      tempo: parseFloat(document.getElementById('tempo').value),
      energy: parseFloat(document.getElementById('energy').value),
      danceability: parseFloat(document.getElementById('danceability').value),
      valence: parseFloat(document.getElementById('valence').value),
      acousticness: parseFloat(document.getElementById('acousticness').value)
    });
  }

  function toggleAudioPlayback() {
    if (!window.cinematicAudioEngine) return;
    syncAudioEngine();
    const isPlaying = window.cinematicAudioEngine.toggle();

    if (isPlaying) {
      globalAudioToggle.classList.add('playing');
      audioStatusLabel.textContent = `${Math.round(document.getElementById('tempo').value)} BPM`;
      audioPlayIcon.setAttribute('data-lucide', 'square');
      btnAuditionTrack.innerHTML = `<i data-lucide="square" style="width:14px;height:14px;"></i><span>Stop Audio</span>`;
    } else {
      globalAudioToggle.classList.remove('playing');
      audioStatusLabel.textContent = 'OFFLINE';
      audioPlayIcon.setAttribute('data-lucide', 'play');
      btnAuditionTrack.innerHTML = `<i data-lucide="play-circle" style="width:14px;height:14px;"></i><span>Audition DNA</span>`;
    }
    lucide.createIcons();
  }

  if (globalAudioToggle) globalAudioToggle.addEventListener('click', toggleAudioPlayback);
  if (btnAuditionTrack) btnAuditionTrack.addEventListener('click', toggleAudioPlayback);

  function updateSliderLabels() {
    sliderIds.forEach(id => {
      const el = document.getElementById(id);
      const valEl = document.getElementById(`val-${id}`);
      if (!el || !valEl) return;

      if (id === 'duration_ms') {
        const mins = Math.floor(el.value / 60000);
        const secs = ((el.value % 60000) / 1000).toFixed(0);
        valEl.textContent = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
      } else if (id === 'tempo') {
        valEl.textContent = `${Math.round(el.value)} BPM`;
      } else if (id === 'loudness') {
        valEl.textContent = `${parseFloat(el.value).toFixed(1)} dB`;
      } else {
        valEl.textContent = parseFloat(el.value).toFixed(2);
      }
    });

    const keys = ["C", "C# / D♭", "D", "D# / E♭", "E", "F", "F# / G♭", "G", "G# / A♭", "A", "A# / B♭", "B"];
    const modeText = modeSelect.value === "1" ? "Major" : "Minor";
    document.getElementById('val-key-mode').textContent = `${keys[keySelect.value]} ${modeText}`;
  }

  function calculatePrediction() {
    if (!window.dashboardData) return;

    const duration_ms = parseFloat(document.getElementById('duration_ms').value);
    const danceability = parseFloat(document.getElementById('danceability').value);
    const energy = parseFloat(document.getElementById('energy').value);
    const key = parseInt(document.getElementById('key').value);
    const loudness = parseFloat(document.getElementById('loudness').value);
    const mode = parseInt(document.getElementById('mode').value);
    const speechiness = parseFloat(document.getElementById('speechiness').value);
    const acousticness = parseFloat(document.getElementById('acousticness').value);
    const instrumentalness = parseFloat(document.getElementById('instrumentalness').value);
    const liveness = 0.18;
    const valence = parseFloat(document.getElementById('valence').value);
    const tempo = parseFloat(document.getElementById('tempo').value);

    const xValues = [duration_ms, danceability, energy, key, loudness, mode, speechiness, acousticness, instrumentalness, liveness, valence, tempo];

    const predMeans = dashboardData.pred_scaler_params.mean;
    const predScales = dashboardData.pred_scaler_params.scale;
    const xScaled = xValues.map((val, idx) => (val - predMeans[idx]) / predScales[idx]);

    const coefs = dashboardData.predictor_coefficients.coef;
    const intercept = dashboardData.predictor_coefficients.intercept;

    let prediction = intercept;
    const contributions = [];
    const featureNames = [
      'Duration', 'Danceability', 'Energy', 'Musical Key', 'Loudness (dB)',
      'Scale Mode', 'Speechiness', 'Acousticness', 'Instrumentalness',
      'Liveness', 'Valence (Mood)', 'Tempo (BPM)'
    ];

    for (let i = 0; i < xScaled.length; i++) {
      const impact = xScaled[i] * coefs[i];
      prediction += impact;
      contributions.push({ name: featureNames[i], impact: impact });
    }

    prediction = Math.max(5, Math.min(98, Math.round(prediction)));

    predPopularityValue.textContent = prediction;
    const degrees = (prediction / 100) * 360;
    gaugeProgress.style.background = `conic-gradient(var(--color-primary) ${degrees}deg, var(--bg-surface-elevated) ${degrees}deg)`;

    tierBadge.className = 'tier-status-pill';
    if (prediction >= 70) {
      tierBadge.classList.add('tier-viral');
      tierBadgeText.textContent = 'POTENTIAL GLOBAL HIT';
      tierExplanationText.textContent = 'Profil audio ideal dengan ritme danceability tinggi dan kompresi kenyaringan prima untuk kurasi playlist viral global.';
    } else if (prediction >= 50) {
      tierBadge.classList.add('tier-hit');
      tierBadgeText.textContent = 'MAINSTREAM AIRPLAY';
      tierExplanationText.textContent = 'Memiliki karakteristik seimbang dengan potensi kuat untuk siaran radio dan rotasi streaming regional.';
    } else if (prediction >= 35) {
      tierBadge.classList.add('tier-mod');
      tierBadgeText.textContent = 'MODERATE ROTATION';
      tierExplanationText.textContent = 'Cocok untuk audiens spesifik genre dengan loyalitas pendengar terfokus.';
    } else {
      tierBadge.classList.add('tier-niche');
      tierBadgeText.textContent = 'NICHE / UNDERGROUND';
      tierExplanationText.textContent = 'Eksperimental atau instrumen organik murni dengan pasar pendengar akustik / ambient.';
    }

    contributions.sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));
    const topContribs = contributions.slice(0, 5);

    waterfallList.innerHTML = topContribs.map(item => {
      const isPositive = item.impact >= 0;
      const barColor = isPositive ? 'var(--color-primary)' : 'var(--text-muted)';
      const widthPct = Math.min(100, Math.abs(item.impact) * 22);
      const sign = isPositive ? '+' : '';
      return `
        <div class="shap-row">
          <span class="shap-feat-name">${item.name}</span>
          <div class="shap-track">
            <div class="shap-fill" style="width: ${widthPct}%; background: ${barColor};"></div>
          </div>
          <span class="shap-delta-val" style="color: ${barColor};">${sign}${item.impact.toFixed(1)}</span>
        </div>
      `;
    }).join('');

    syncAudioEngine();
  }

  sliderIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', () => {
        updateSliderLabels();
        calculatePrediction();
      });
    }
  });

  keySelect.addEventListener('change', () => {
    updateSliderLabels();
    calculatePrediction();
  });
  modeSelect.addEventListener('change', () => {
    updateSliderLabels();
    calculatePrediction();
  });

  document.querySelectorAll('.archetype-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const presetKey = btn.dataset.preset;
      const preset = archetypePresets[presetKey];
      if (!preset) return;

      Object.keys(preset).forEach(k => {
        const el = document.getElementById(k);
        if (el) el.value = preset[k];
      });

      updateSliderLabels();
      calculatePrediction();
    });
  });

  if (songSearch) {
    songSearch.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      if (q.length < 2) {
        searchResults.classList.add('hidden');
        return;
      }

      const matches = dashboardData.sample_songs.filter(s =>
        s.track_name.toLowerCase().includes(q) ||
        s.artists.toLowerCase().includes(q)
      ).slice(0, 5);

      if (matches.length === 0) {
        searchResults.innerHTML = '<div class="search-result-row" style="cursor:default;color:var(--text-muted);">Lagu tidak ditemukan</div>';
      } else {
        searchResults.innerHTML = matches.map(s => `
          <div class="search-result-row" data-song-key="${s.artists}-${s.track_name}">
            <div class="result-track-title">${s.track_name}</div>
            <div class="result-track-artist">${s.artists} &bull; ${s.track_genre} &bull; Score: ${s.popularity}</div>
          </div>
        `).join('');
      }
      searchResults.classList.remove('hidden');
    });

    searchResults.addEventListener('click', (e) => {
      const item = e.target.closest('.search-result-row');
      if (!item || !item.dataset.songKey) return;

      const [artist, name] = item.dataset.songKey.split('-');
      const song = dashboardData.sample_songs.find(s => s.artists === artist && s.track_name === name);

      if (song) {
        sliderIds.forEach(id => {
          const el = document.getElementById(id);
          if (el && song[id] !== undefined) el.value = song[id];
        });
        if (song.key !== undefined) keySelect.value = song.key;
        if (song.mode !== undefined) modeSelect.value = song.mode;

        updateSliderLabels();
        calculatePrediction();
        songSearch.value = `${song.track_name} - ${song.artists}`;
      }
      searchResults.classList.add('hidden');
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.search-wrapper')) {
        searchResults.classList.add('hidden');
      }
    });
  }

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

    const listEl = document.getElementById('explorer-songs-list');
    if (listEl && dashboardData.sample_songs) {
      const songs = dashboardData.sample_songs.filter(s => s.music_cluster === parseInt(clusterId)).slice(0, 4);
      listEl.innerHTML = songs.map(s => `
        <div class="track-pill-box">
          <span class="track-pill-name" title="${s.track_name}">${s.track_name}</span>
          <span class="track-pill-score">${s.popularity} Pop</span>
        </div>
      `).join('');
    }

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

    const fiLabels = Object.keys(dashboardData.feature_importances);
    const fiValues = Object.values(dashboardData.feature_importances);
    const fiCtx = document.getElementById('featureImportanceChart').getContext('2d');

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

    const tgLabels = dashboardData.top_genres.map(g => g.track_genre.toUpperCase());
    const tgValues = dashboardData.top_genres.map(g => g.avg_popularity);
    const tgCtx = document.getElementById('topGenresChart').getContext('2d');

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
            max: 70,
            grid: { color: gridCol },
            ticks: { color: textCol, font: { family: 'JetBrains Mono', size: 10 } }
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

  function renderCorrelationHeatmap() {
    if (!window.dashboardData || !dashboardData.corr_data) return;
    const table = document.getElementById('heatmap-table');
    const { features, matrix } = dashboardData.corr_data;

    let html = '<thead><tr><th>Feature</th>';
    features.forEach(f => {
      html += `<th>${f.replace('_ms', '').substring(0, 5)}</th>`;
    });
    html += '</tr></thead><tbody>';

    matrix.forEach((row, i) => {
      html += `<tr><th>${features[i].replace('_ms', '')}</th>`;
      row.forEach((val, j) => {
        let bgColor = 'rgba(15, 23, 42, 0.03)';
        let textColor = '#475569';

        if (i === j) {
          bgColor = 'rgba(15, 23, 42, 0.1)';
          textColor = '#0f172a';
        } else if (val > 0) {
          bgColor = `rgba(22, 163, 74, ${Math.min(0.75, val * 0.85)})`;
          textColor = val > 0.4 ? '#ffffff' : '#0f172a';
        } else if (val < 0) {
          bgColor = `rgba(225, 29, 72, ${Math.min(0.75, Math.abs(val) * 0.85)})`;
          textColor = val < -0.4 ? '#ffffff' : '#0f172a';
        }

        html += `<td class="heatmap-cell-val" style="background:${bgColor}; color:${textColor};" title="${features[i]} vs ${features[j]}: ${val.toFixed(2)}">${val.toFixed(2)}</td>`;
      });
      html += '</tr>';
    });
    html += '</tbody>';
    table.innerHTML = html;
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      document.body.classList.toggle('light-theme');
      const isLight = document.body.classList.contains('light-theme');
      themeIconElement.setAttribute('data-lucide', isLight ? 'moon' : 'sun');
      lucide.createIcons();

      const activeCluster = document.querySelector('.constellation-tab-item.active');
      if (activeCluster) renderClusterProfile(activeCluster.dataset.cluster);
      buildAnalyticsCharts();
    });
  }

  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(sec => {
      const top = sec.offsetTop - 140;
      if (window.scrollY >= top) {
        current = sec.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });

  document.querySelectorAll('.bento-card, .console-deck-panel, .gauge-console-card, .math-telemetry-card, .analytics-panel').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });

  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);

    gsap.from('.hero-content > *', {
      opacity: 0,
      y: 28,
      duration: 0.9,
      stagger: 0.12,
      ease: 'power3.out'
    });

    document.querySelectorAll('.chapter-section').forEach(section => {
      const heading = section.querySelector('.chapter-heading-box');
      const cards = section.querySelectorAll('.double-bezel-card, .console-bezel-outer, .gauge-console-card');

      if (heading) {
        gsap.from(heading, {
          scrollTrigger: {
            trigger: heading,
            start: 'top 88%'
          },
          opacity: 0,
          y: 24,
          duration: 0.8,
          ease: 'power2.out'
        });
      }

      if (cards.length > 0) {
        gsap.from(cards, {
          scrollTrigger: {
            trigger: cards[0],
            start: 'top 88%'
          },
          opacity: 0,
          y: 28,
          duration: 0.7,
          stagger: 0.08,
          ease: 'power2.out'
        });
      }
    });
  }

  updateSliderLabels();
  calculatePrediction();
  renderClusterProfile(0);
  buildAnalyticsCharts();
  renderCorrelationHeatmap();

  function triggerKaTeX() {
    if (window.renderMathInElement) {
      renderMathInElement(document.body, {
        delimiters: [
          { left: '$$', right: '$$', display: true },
          { left: '$', right: '$', display: false }
        ],
        throwOnError: false
      });
    }
  }

  triggerKaTeX();
  setTimeout(triggerKaTeX, 300);
});
