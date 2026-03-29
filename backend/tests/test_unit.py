def calculate_emi(amount, rate, years):
    return (amount * rate) / years

def test_calculate_emi():
    result = calculate_emi(100000, 8, 5)
    assert result > 0