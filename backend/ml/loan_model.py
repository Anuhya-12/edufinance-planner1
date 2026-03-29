import pandas as pd
from sklearn.preprocessing import MinMaxScaler
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, r2_score
from sklearn.model_selection import train_test_split


def prepare_features(df):
    df["tenure"] = (df["min_tenure_years"] + df["max_tenure_years"]) / 2

    X = df[["interest_rate", "max_amount", "tenure", "processing_fee"]]

    scaler = MinMaxScaler()
    X_scaled = pd.DataFrame(scaler.fit_transform(X), columns=X.columns)

    return X_scaled


def create_target(df, X_scaled):
    # Lower interest & fee → better
    # Higher loan → better
    y = (
        (1 - X_scaled["interest_rate"]) * 0.4 +
        X_scaled["max_amount"] * 0.3 +
        (1 - X_scaled["processing_fee"]) * 0.2 +
        X_scaled["tenure"] * 0.1
    )
    return y


def train_model(df):
    X_scaled = prepare_features(df)
    y = create_target(df, X_scaled)

    X_train, X_test, y_train, y_test = train_test_split(
        X_scaled, y, test_size=0.2, random_state=42
    )

    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)

    # ✅ Evaluate properly
    preds = model.predict(X_test)

    mae = mean_absolute_error(y_test, preds)
    r2 = r2_score(y_test, preds)

    print("📊 Improved Model Performance:", {
        "MAE": round(mae, 4),
        "R2": round(r2, 4) if not pd.isna(r2) else 0
    })

    return model