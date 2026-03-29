from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_recommend_loans():
    response = client.get("/recommend-loans/150000")
    assert response.status_code == 200
    assert "loans" in response.json()