import numpy as np
import pandas as pd

import src.utils as utl

TERMS_ROMANCE = [
    "romance",
    "love",
    "girl",
    "kiss",
    "baby",
    "dance",
    "heart",
    "passion",
    "eyes",
    "honey",
]

SONG_SECTIONS = [
    "INTRO",
    "VERSE",
    "PRE-CHORUS",
    "CHORUS",
    "POST-CHORUS",
    "BRIDGE",
    "INSTRUMENTAL",
    "OUTRO",
]

DIR_DATA = "docs/data"

#########################
##### FUNCTIONS         #
#########################

# --- variable naming abbreviations --- #
# ts = timestamp
# dur = duration
# sec = song section
# unq = unique
# nwords = number of words
# lexdiv = lexical diversity
# tit = title


def prepare_data(data):
    """Prepares data by cleaning and adding variables."""
    data["ts_end"] = data["ts_end"].apply(utl.convert_time_to_seconds)
    data["sec_dur"] = data.groupby("song_tit")["ts_end"].transform(np.diff, prepend=0)
    data["song_dur"] = data.groupby("song_tit")["sec_dur"].transform(sum)
    data["sec_dur_rel"] = data["sec_dur"] / data["song_dur"]
    data["album_dur"] = data.groupby("album_key")["song_dur"].transform(sum)
    data.fillna({"song_sec_lyrics": ""}, inplace=True)
    data["n_chars"] = data["song_sec_lyrics"].apply(len)

    dtm = utl.get_dtm(data["song_sec_lyrics"])
    data["sec_nwords"] = dtm.sum(axis=1)
    data["song_nwords"] = data.groupby("song_tit")["sec_nwords"].transform(sum)
    data["sec_nwords_unq"] = (dtm >= 1).sum(axis=1)
    data["song_nwords_unq"] = data.groupby("song_tit")["sec_nwords_unq"].transform(sum)
    data["sec_lexdiv"] = data["sec_nwords_unq"] / data["sec_nwords"]
    data["song_lexdiv"] = data["song_nwords_unq"] / data["song_nwords"]

    return data, dtm


def create_data_song_dur(data):
    """Creates and stores data with average song duration per album."""
    # durationAlbums
    song_dur_by_album = (
        data.groupby(["album_key"])["song_dur"].agg({np.median, np.mean})
    )[["median", "mean"]]
    song_dur_by_album.columns = ["Median", "Mean"]
    song_dur_by_album.reset_index(drop=False, inplace=True)
    song_dur_by_album = utl.prepare_columns(song_dur_by_album, {"album_key": "Album"})
    # utl.save_to_js(DIR_DATA, "durationAlbums", song_dur_by_album)
    song_dur_by_album.to_csv(f"{DIR_DATA}/durationAlbums.csv", index=False)


def create_data_song_sec_importance(data):
    """Creates and stores aggregated song section importance data."""
    sections_by_album = data.groupby("album_key")["song_sec"].value_counts()
    sections_by_album.name = "n"
    sections_by_album = sections_by_album.reset_index()
    pd.pivot_table(sections_by_album, values="n", columns="album_key", index="song_sec")

    # importanceAlbums
    song_sections_by_album = utl.get_section_rel_by_key(data, key="album_key")
    song_sections_by_album = song_sections_by_album.fillna(0).transpose()[SONG_SECTIONS]
    song_sections_by_album = utl.group_chorus(song_sections_by_album)
    song_sections_by_album.reset_index(drop=False, inplace=True)
    song_sections_by_album = utl.prepare_columns(
        song_sections_by_album, {"album_key": "Album"}
    )
    utl.save_to_js(DIR_DATA, "importanceAlbums", song_sections_by_album)

    # importanceSongs
    song_sections_by_song = (
        data[["album_key", "song_tit"]]
        .drop_duplicates()
        .merge(
            utl.get_section_rel_by_key(data, key="song_tit").transpose(),
            on="song_tit",
        )
        .fillna(0)
        .set_index("album_key")[["song_tit"] + SONG_SECTIONS]
    )
    song_sections_by_song.reset_index(drop=False, inplace=True)
    song_sections_by_song = utl.prepare_columns(
        song_sections_by_song, {"album_key": "Album", "song_tit": "Song"}
    )
    utl.save_to_js(DIR_DATA, "importanceSongs", song_sections_by_song)


def create_data_lexdiv(data):
    """Creates and stores aggregated lexical diversity data."""
    # diversityAlbums
    lexical_div_by_album = (
        data.groupby(["album_key"])["song_lexdiv"].agg({min, np.median, max}) * 100
    )[["min", "median", "max"]]
    lexical_div_by_album.columns = ["Minimum", "Median", "Maximum"]
    lexical_div_by_album.reset_index(drop=False, inplace=True)
    lexical_div_by_album = utl.prepare_columns(
        lexical_div_by_album, {"album_key": "Album"}
    )
    utl.save_to_js(DIR_DATA, "diversityAlbums", lexical_div_by_album)

    # diversitySongs
    lexical_div_by_song = (
        data[["album_key", "song_tit", "song_lexdiv"]]
        .drop_duplicates()
        .reset_index(drop=True)
    )
    lexical_div_by_song["song_lexdiv"] = lexical_div_by_song["song_lexdiv"] * 100
    lexical_div_by_song = utl.prepare_columns(
        lexical_div_by_song,
        {"album_key": "Album", "song_tit": "Song", "song_lexdiv": "Diversity"},
    )
    utl.save_to_js(DIR_DATA, "diversitySongs", lexical_div_by_song)


def create_data_lexical_dispersion(data, dtm):
    """Creates and stores aggregated lexical dispersion data."""
    dtm = pd.concat([data[["album_key", "song_nr", "song_tit"]], dtm], axis=1)
    word_counts = dtm.groupby(["album_key", "song_nr", "song_tit"]).sum()

    # dispersionAlbums
    lexical_disp_by_album = word_counts[TERMS_ROMANCE].groupby("album_key").sum()
    lexical_disp_by_album.reset_index(drop=False, inplace=True)
    lexical_disp_by_album = utl.prepare_columns(
        lexical_disp_by_album, {"album_key": "Album"}
    )
    utl.save_to_js(DIR_DATA, "dispersionAlbums", lexical_disp_by_album)

    # dispersionSongs
    lexical_disp_by_song = (
        word_counts[TERMS_ROMANCE].reset_index(drop=False).drop(columns="song_nr")
    )
    lexical_disp_by_song = utl.prepare_columns(
        lexical_disp_by_song, {"album_key": "Album", "song_tit": "Song"}
    )
    utl.save_to_js(DIR_DATA, "dispersionSongs", lexical_disp_by_song)


#########################

if __name__ == "__main__":
    data_raw = pd.read_excel("data/data_lyrics_arctic_monkeys_full.xlsx")

    data, dtm = prepare_data(data_raw)
    print("Data prepared!")

    create_data_song_dur(data)
    create_data_song_sec_importance(data)
    create_data_lexdiv(data)
    create_data_lexical_dispersion(data, dtm)
    print("Data stored!")
