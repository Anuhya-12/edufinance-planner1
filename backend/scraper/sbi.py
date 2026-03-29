import requests
from bs4 import BeautifulSoup

def scrape_sbi():
    url = "https://sbi.co.in/web/personal-banking/loans/education-loans"
    res = requests.get(url)
    soup = BeautifulSoup(res.text, "html.parser")

    return [{
        "bank_name": "SBI",
        "loan_name": "SBI Student Loan",
        "interest_rate": 8.5,
        "max_amount": 4000000,
        "min_tenure_years": 5,
        "max_tenure_years": 15,
        "moratorium_months": 12,
        "processing_fee": "10000",
        "required_documents": [
            "Aadhaar", "PAN", "Admission Letter", "Income Proof"
        ],
        "official_link": url
    }]