import numpy as np
import pandas as pd
import spacy

import src.utils as utl

TERMS_ROMANCE = ["love", "girl", "kiss", "baby", "dance", "heart"]
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


def create_data_song_sec_importance(data):
    """Creates aggregated song section importance data and stores as .js files."""
    sections_by_album = data.groupby("album_key")["song_section"].value_counts()
    sections_by_album = sections_by_album.reset_index()
    pd.pivot_table(
        sections_by_album, values="count", columns="album_key", index="song_section"
    )

    song_sections_by_album = utl.get_sec_rel_by_key(data, key="album_key")
    song_sections_by_album = song_sections_by_album.fillna(0).transpose()[SONG_SECTIONS]
    song_sections_by_album = utl.group_chorus(song_sections_by_album)
    song_sections_by_album.index = [f[3:] for f in song_sections_by_album.index]

    song_sections_by_song = (
        data[["album_key", "song_tit"]]
        .drop_duplicates()
        .merge(
            utl.get_sec_rel_by_key(data, key="song_tit").transpose(),
            on="song_tit",
        )
        .fillna(0)
        .set_index("album_key")[["song_tit"] + SONG_SECTIONS]
    )


def create_data_lexdiv(data):
    """Creates aggregated lexical diversity data and stores as .js files."""
    lexical_div_by_album = (
        data.groupby(["album_key"])["song_lexdiv"].agg({min, np.median, max}) * 100
    )
    lexical_div_by_album = lexical_div_by_album[["min", "median", "max"]]
    lexical_div_by_album.columns = ["Minimum", "Median", "Maximum"]
    lexical_div_by_album.index = [f[3:] for f in lexical_div_by_album.index]


def create_data_lexical_dispersion(data, dtm):
    """Creates aggregated lexical dispersion data and stores as .js files."""
    nlp = spacy.load("en_core_web_md")  # python -m spacy download en_core_web_md

    full_songs = (
        data[["album_key", "song_tit", "song_sec_lyrics"]]
        .groupby(["album_key", "song_tit"])["song_sec_lyrics"]
        .apply(lambda x: " ".join(x))
        .reset_index()
        .rename(columns={"song_sec_lyrics": "song_lyrics"})
    )
    full_songs["song_lyrics"] = full_songs["song_lyrics"].str.strip()

    dict_pos = {}
    for i, lyrics in enumerate(full_songs["song_lyrics"]):
        pos = utl.extract_pos(lyrics)
        dict_pos[i] = pos

    full_songs = pd.concat(
        [full_songs, pd.DataFrame.from_dict(dict_pos, orient="index")], axis=1
    )

    all_nouns = full_songs.set_index("song_tit")["nouns"].explode()
    all_nouns = all_nouns.reset_index().merge(
        full_songs[["album_key", "song_tit"]], on="song_tit", how="left"
    )
    all_nouns_n = (
        all_nouns.set_index(["album_key"])
        .groupby("album_key")["nouns"]
        .value_counts()
        .reset_index()
    )

    dtm = pd.concat([data[["album_key", "song_nr", "song_tit"]], dtm], axis=1)
    word_counts = dtm.groupby(["album_key", "song_nr", "song_tit"]).sum()
    print(word_counts.sum(axis=0)[TERMS_ROMANCE])  # nbr. of mentions

    word_counts_across_songs = (word_counts > 0).sum(axis=0).sort_values()

    print(word_counts_across_songs[TERMS_ROMANCE])  # nbr. of songs
    word_counts[TERMS_ROMANCE].groupby("album_key").sum()
    piv_word_counts = pd.pivot_table(
        word_counts[TERMS_ROMANCE], columns="song_nr", index="album_key"
    )

    lexical_disp_by_album = word_counts[TERMS_ROMANCE].groupby("album_key").sum()
    lexical_disp_by_album.index = [f[3:] for f in lexical_disp_by_album.index]

    lexical_disp_by_song = (
        word_counts[TERMS_ROMANCE]
        .reset_index()
        .drop(columns=["album_key", "song_nr", "song_tit"])
        .transpose()
    )


#########################

if __name__ == "__main__":
    data_raw = pd.read_excel("../data/data_lyrics_arctic_monkeys_full.xlsx")

    data, dtm = prepare_data(data_raw)

    create_data_song_sec_importance(data)
    create_data_lexdiv(data)
    create_data_lexical_dispersion(data, dtm)
