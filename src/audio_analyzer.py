import os
import pandas as pd
import numpy as np

class SpotifyAudioAnalyzer:
    def __init__(self, data_path: str = None):
        if data_path is None:
            data_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'dataset.csv')
        self.data_path = data_path

    def load_data(self) -> pd.DataFrame:
        df = pd.read_csv(self.data_path)
        if 'Unnamed: 0' in df.columns:
            df = df.drop(columns=['Unnamed: 0'])
        return df

    def get_genre_audio_profile(self, df: pd.DataFrame = None) -> pd.DataFrame:
        if df is None:
            df = self.load_data()
        feature_cols = ['danceability', 'energy', 'loudness', 'speechiness', 'acousticness', 'instrumentalness', 'liveness', 'valence', 'tempo']
        present_cols = [c for c in feature_cols if c in df.columns]
        
        group_col = 'track_genre' if 'track_genre' in df.columns else 'genre' if 'genre' in df.columns else None
        if group_col:
            return df.groupby(group_col)[present_cols].mean()
        return df[present_cols].describe()
