from pyexpat import features

from fastapi import FastAPI
from db.supabase_client import supabase
import pandas as pd
from ml.loan_model import train_model
from fastapi.middleware.cors import CORSMiddleware
from ml.college_model import recommend_colleges
import logging

logging.basicConfig(level=logging.INFO)
# import sentry_sdk

# sentry_sdk.init(
#     dsn="YOUR_DSN_HERE",  # replace later
#     traces_sample_rate=1.0,
# )

app = FastAPI()
import time
from fastapi import Request

@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()

    logging.info(f"➡️ Request: {request.method} {request.url}")

    response = await call_next(request)

    duration = round(time.time() - start_time, 3)

    logging.info(
        f"⬅️ Response: {request.method} {request.url} "
        f"Status: {response.status_code} "
        f"Time: {duration}s"
    )

    return response
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # allow all (for development)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ BASIC RECOMMENDATION
@app.get("/recommend-loans")
def recommend_loans():
    res = supabase.table("loans").select("*").execute()
    df = pd.DataFrame(res.data)
    logging.info(f"Total loans fetched: {len(df)}")


    if df.empty:
        return {"error": "No data"}

    # Safe processing fee
    if "processing_fee" in df.columns:
        df["processing_fee"] = (
            df["processing_fee"]
            .astype(str)
            .str.extract(r'(\d+)')[0]
            .fillna("10000")
            .astype(float)
        )
    else:
        df["processing_fee"] = 10000

    df["tenure"] = (df["min_tenure_years"] + df["max_tenure_years"]) / 2

    model = train_model(df)
    

    df["ml_score"] = model.predict(
    df[["interest_rate", "max_amount", "tenure", "processing_fee"]]
)
    logging.info("ML scoring completed successfully")
    return df.sort_values(by="ml_score", ascending=False).to_dict(orient="records")


@app.get("/recommend-loans/{income}")
def recommend_loans_by_income(income: int):
    logging.info(f"🔹 Loan API called with income: {income}")

    res = supabase.table("loans").select("*").execute()
    df = pd.DataFrame(res.data)

    if df.empty:
        return {"loans": [], "feature_importance": {}}

    # Income filter
    df["min_income"] = df["min_income"].fillna(0)
    df["max_income"] = df["max_income"].fillna(10000000)

    df = df[
        (df["min_income"] <= income) &
        (df["max_income"] >= income)
    ]
    logging.info(f"Loans after filtering: {len(df)}")

    if df.empty:
        return {"loans": [], "feature_importance": {}}

    # Convert numeric safely
    df["interest_rate"] = pd.to_numeric(df["interest_rate"], errors="coerce")
    df["max_amount"] = pd.to_numeric(df["max_amount"], errors="coerce")
    df["min_tenure_years"] = pd.to_numeric(df["min_tenure_years"], errors="coerce")
    df["max_tenure_years"] = pd.to_numeric(df["max_tenure_years"], errors="coerce")

    # Clean processing fee
    df["processing_fee"] = (
        df["processing_fee"]
        .astype(str)
        .str.extract(r'(\d+)')[0]
        .fillna("10000")
        .astype(float)
    )

    df = df.dropna(subset=["interest_rate", "max_amount"])

    # Feature engineering
    df["tenure"] = (df["min_tenure_years"] + df["max_tenure_years"]) / 2

    # Model
    model = train_model(df)

    features = ["interest_rate", "max_amount", "tenure", "processing_fee"]

    importance = getattr(model, "feature_importances_", [0.25]*4)
    feature_importance = dict(zip(features, importance))

    features_df = df[features].fillna(0)

    df["ml_score"] = model.predict(features_df)

    # Explainability
    df["reason"] = (
        "Low interest rate (" + df["interest_rate"].astype(str) + "%), "
        + "High loan amount (₹" + df["max_amount"].astype(int).astype(str) + "), "
        + "Affordable processing fee"
    )

    return {
        "loans": df.sort_values(by="ml_score", ascending=False).to_dict(orient="records"),
        "feature_importance": feature_importance
    }
# ✅ INCOME-BASED RECOMMENDATION
@app.get("/recommended-scholarships/{income}/{category}")
def financial_plan(income: int, category: str):
    
    # 🔹 LOANS
    loan_res = supabase.table("loans").select("*").execute()
    df_loans = pd.DataFrame(loan_res.data)

    if df_loans.empty:
        return {"error": "No loan data"}

    df_loans["min_income"] = df_loans["min_income"].fillna(0)
    df_loans["max_income"] = df_loans["max_income"].fillna(10000000)

    df_loans = df_loans[
        (df_loans["min_income"] <= income) &
        (df_loans["max_income"] >= income)
    ]

    # clean processing fee
    df_loans["processing_fee"] = (
        df_loans["processing_fee"]
        .astype(str)
        .str.extract(r'(\d+)')[0]
        .fillna("10000")
        .astype(float)
    )

    df_loans["tenure"] = (df_loans["min_tenure_years"] + df_loans["max_tenure_years"]) / 2

    model = train_model(df_loans)

    df_loans["ml_score"] = model.predict(
        df_loans[["interest_rate", "max_amount", "tenure", "processing_fee"]]
    )

    top_loans = df_loans.sort_values(by="ml_score", ascending=False).head(3)

    # 🔹 SCHOLARSHIPS
    sch_res = supabase.table("scholarships").select("*").execute()
    df_sch = pd.DataFrame(sch_res.data)

    if not df_sch.empty:
        df_sch["min_income"] = df_sch["min_income"].fillna(0)
        df_sch["max_income"] = df_sch["max_income"].fillna(10000000)

        df_sch = df_sch[
            (df_sch["min_income"] <= income) &
            (df_sch["max_income"] >= income)
        ]

        df_sch["categories"] = df_sch["categories"].astype(str)

        df_sch = df_sch[
            df_sch["categories"].str.contains(category, case=False, na=False) |
            df_sch["categories"].str.contains("General", case=False, na=False)
        ]

        top_sch = df_sch.sort_values(by="amount", ascending=False).head(3)
    else:
        top_sch = pd.DataFrame()

    # 🔥 COMBINE PLAN
    total_scholarship = top_sch["amount"].sum() if not top_sch.empty else 0
    best_loan = top_loans.iloc[0] if not top_loans.empty else None

    return {
        "recommended_loans": top_loans.to_dict(orient="records"),
        "recommended_scholarships": top_sch.to_dict(orient="records"),
        "total_scholarship_amount": int(total_scholarship),
        "suggested_loan_amount": int(best_loan["max_amount"]) if best_loan is not None else 0
    }
@app.get("/recommend-colleges/{budget}")
def recommend_colleges_api(budget: int):
    res = supabase.table("universities").select("*").execute()
    df = pd.DataFrame(res.data)

    if df.empty:
        return {"error": "No universities found"}

    # CLEAN FEES (VERY IMPORTANT)
    df["fees"] = (
        df["fees"]
        .astype(str)
        .str.replace("₹", "")
        .str.replace(",", "")
    )
    df["fees"] = pd.to_numeric(df["fees"], errors="coerce").fillna(100000)

    recommended = recommend_colleges(df, budget)

    return recommended.to_dict(orient="records")