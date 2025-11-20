from langchain_core.tools import tool
from dotenv import load_dotenv
import aiohttp
from typing import Dict, Any
import os

load_dotenv()

async def get_hotels(query: str, check_in_date: str, check_out_date: str) -> Dict[str, Any]:
    """
    Search hotels using the Google Hotels engine via searchapi.io.

    Parameters:
    - query: Search query text. Example: "Hotels in Manhattan New York"
    - check_in_date: Date in YYYY-MM-DD format
    - check_out_date: Date in YYYY-MM-DD format
    """

    url = "https://www.searchapi.io/api/v1/search"
    params = {
        "engine": "google_hotels",
        "q": query,
        "check_in_date": check_in_date,
        "check_out_date": check_out_date,
        "api_key": os.getenv("SEARCHAPI_KEY")
    }
    print(params)

    async with aiohttp.ClientSession() as session:
        async with session.get(url, params=params) as resp:

            hotels = await resp.json()
            if resp.status != 200:
                return f"API request failed with status {resp.status}"
            
            hotels = hotels.get("properties", [])
            hotels = hotels[:6]

            results = []
            for hotel in hotels:
                temp = {
                    "name": hotel.get("name"),
                    "description": hotel.get("description"),
                    "city": hotel.get("city"),
                    "country": hotel.get("country"),
                    "price_per_night": hotel["price_per_night"]["price"],
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
