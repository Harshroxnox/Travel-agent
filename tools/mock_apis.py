import random

def mock_flights_api(source, destination, date):
    flights = [
        {"flight": "IndiGo 6E-203", "time": "09:30", "price": 4500},
        {"flight": "Air India AI-433", "time": "13:45", "price": 5200},
        {"flight": "Vistara UK-567", "time": "20:15", "price": 6100},
    ]
    return random.sample(flights, 2)

def mock_hotels_api(location, checkin, checkout):
    hotels = [
        {"name": "Taj Palace", "rating": 4.8, "price": 9500},
        {"name": "Marriott Inn", "rating": 4.6, "price": 7200},
        {"name": "Ginger Stay", "rating": 4.2, "price": 3400},
    ]
    return random.sample(hotels, 2)