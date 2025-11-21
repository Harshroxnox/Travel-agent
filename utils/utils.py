import re

def strip_code_fences(text: str) -> str:
    # Remove leading fence
    text = re.sub(r"^```[a-zA-Z0-9]*\n?", "", text.strip())

    # Remove trailing fence
    text = re.sub(r"```$", "", text.strip())

    return text.strip()

def preprocess_hotels(hotels):
    results = []
    for hotel in hotels:
        temp = {
            "name": hotel.get("name"),
            "description": hotel.get("description"),
            "city": hotel.get("city"),
            "country": hotel.get("country"),
            "price_per_night": hotel.get("price_per_night", {}).get("price"),
            "hotel_class": hotel.get("hotel_class"),
            "rating": hotel.get("rating"),
            "reviews": hotel.get("reviews")
        }
        # Price
        price_data = hotel.get("price_per_night", {})
        temp["price_per_night"] = price_data.get("price")

        # Nearby places
        nearby_list = hotel.get("nearby_places", [])
        temp["nearby_places"] = [place.get("name") for place in nearby_list]

        # Amenities
        temp["amenities"] = hotel.get("amenities", [])
        results.append(temp)
    return results
