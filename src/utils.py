import pandas as pd
from sklearn.feature_extraction.text import CountVectorizer


def convert_time_to_seconds(x):
    """Converts annotated timestamp (ss or mm'ss) to number of seconds."""
    if isinstance(x, int):
        return x
    elif "'" in x:
        return int(x[0]) * 60 + int(x[2:])  # '0x' is correctly converted to x


def get_dtm(texts):
    """Creates a document-term matrix."""
    cv = CountVectorizer(analyzer="word")
    cv_matrix = cv.fit_transform(texts)

    df_dtm = pd.DataFrame(cv_matrix.toarray(), columns=cv.get_feature_names())

    return df_dtm


def extract_pos(lyrics):
    """Returns a dict with (proper) nouns, noun phrases, verbs, and entities found."""
    doc = nlp(lyrics)

    nouns = [token.lemma_ for token in doc if token.pos_ == "NOUN"]
    pnouns = [token.lemma_ for token in doc if token.pos_ == "PROPN"]
    noun_phrases = [chunk.text for chunk in doc.noun_chunks]
    verbs = [token.lemma_ for token in doc if token.pos_ == "VERB"]
    entities = [(ent.text, ent.label_) for ent in doc.ents]

    out = {
        "nouns": nouns,
        "pnouns": pnouns,
        "noun_phrases": noun_phrases,
        "verbs": verbs,
        "entities": entities,
    }

    return out


def get_section_rel_by_key(data, key="album_key"):
    """Returns song_section vs. {key} pivot table with relative nbr. of seconds."""
    sums = data.groupby([key, "song_section"])["section_duration"].sum()
    totals = sums.groupby([key]).sum()
    rel = (sums.div(totals) * 100).reset_index()
    df_piv = pd.pivot_table(
        rel, values="section_duration", columns=key, index="song_section"
    )

    return df_piv


def group_chorus(df):
    """Adds pre- and post-chorus to chorus, then deletes these two song sections."""
    df["CHORUS"] = df.filter(regex="CHORUS").sum(axis=1)
    df = df.drop(columns=["PRE-CHORUS", "POST-CHORUS"])
    return df
