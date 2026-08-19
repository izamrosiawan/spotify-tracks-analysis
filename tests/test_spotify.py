import pytest
import pandas as pd
import numpy as np
from src.audio_analyzer import SpotifyAudioAnalyzer

@pytest.fixture
def analyzer():
    return SpotifyAudioAnalyzer()

def test_spotify_load_data(analyzer):
    df = analyzer.load_data()
    assert len(df) > 0
    assert 'danceability' in df.columns
    assert 'energy' in df.columns
    assert np.all(df['danceability'] >= 0.0)
    assert np.all(df['danceability'] <= 1.0)

def test_genre_profile(analyzer):
    df = analyzer.load_data()
    profile = analyzer.get_genre_audio_profile(df)
    assert len(profile) > 0
    assert 'danceability' in profile.columns
