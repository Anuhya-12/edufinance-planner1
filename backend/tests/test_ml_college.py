import pandas as pd
from ml.college_model import recommend_colleges

def test_recommend_colleges_basic():
    df = pd.DataFrame({
        "id": [1, 2, 3],
        "name": ["JNTU", "OU", "IIT"],
        "fees": [50000, 100000, 150000]
    })

    result = recommend_colleges(df, 80000)

    assert not result.empty
    assert "name" in result.columns


def test_budget_filter_logic():
    df = pd.DataFrame({
        "name": ["A", "B", "C"],
        "fees": [50000, 80000, 150000]
    })

    result = recommend_colleges(df, 80000)

    assert len(result) > 0


def test_empty_dataframe():
    df = pd.DataFrame()

    result = recommend_colleges(df, 100000)

    assert result.empty


def test_small_dataset():
    df = pd.DataFrame({
        "name": ["A", "B"],
        "fees": [50000, 70000]
    })

    result = recommend_colleges(df, 60000)

    assert len(result) <= 2


def test_output_limit():
    df = pd.DataFrame({
        "name": ["A", "B", "C", "D", "E", "F"],
        "fees": [50000, 60000, 70000, 80000, 90000, 100000]
    })

    result = recommend_colleges(df, 75000)

    assert len(result) <= 5