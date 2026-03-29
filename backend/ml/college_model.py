from sklearn.neighbors import NearestNeighbors

def recommend_colleges(df, budget):
    if df.empty:
        return df

    # ensure numeric
    X = df[["fees"]].values

    # handle small data
    if len(X) < 5:
        return df.head(5)

    model = NearestNeighbors(n_neighbors=5)
    model.fit(X)

    distances, indices = model.kneighbors([[float(budget)]])

    return df.iloc[indices[0]]