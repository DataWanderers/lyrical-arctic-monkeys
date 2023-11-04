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

    df_dtm = pd.DataFrame(cv_matrix.toarray(), columns=cv.get_feature_names_out())

    return df_dtm


def get_section_rel_by_key(data, key="album_key"):
    """Returns 'song_sec' vs. {key} pivot table with relative nbr. of seconds."""
    sums = data.groupby([key, "song_sec"])["sec_dur"].sum()
    totals = sums.groupby([key]).sum()
    rel = (sums.div(totals) * 100).reset_index()
    df_piv = pd.pivot_table(rel, values="sec_dur", columns=key, index="song_sec")
    df_piv.index.name = None

    return df_piv


def group_chorus(df):
    """Adds pre- and post-chorus to chorus, then deletes these two song sections."""
    df["CHORUS"] = df.filter(regex="CHORUS").sum(axis=1)
    df = df.drop(columns=["PRE-CHORUS", "POST-CHORUS"])
    return df


def prepare_columns(df, dict_to_rename={}):
    """Cleans column names."""
    df["album_key"] = df["album_key"].apply(lambda x: x[3:])
    for col, col_new in dict_to_rename.items():
        df = df.rename(columns={col: col_new})
    df.columns = df.columns.str.capitalize()
    return df


def save_to_js(dir, var_name, df):
    """Saves a Python dictionary to a JavaScript file."""
    with open(f"{dir}/{var_name}.js", "w") as file:
        file.write(f"const {var_name} = ")
        file.write(df.to_json(orient="records"))
        file.write(";")
