from langchain_core.tools import tool
from dotenv import load_dotenv
import aiohttp
from typing import Dict, Any
import os

load_dotenv()

async def get_hotels(query: str, check_in_date: str, check_out_date: str, currency: str) -> Dict[str, Any]:
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
        "hotel_class": "3,4,5",
        "currency": currency,
        "rating": "7",
        "q": query,
        "check_in_date": check_in_date,
        "check_out_date": check_out_date,
        "api_key": os.getenv("SEARCHAPI_KEY")
    }

    async with aiohttp.ClientSession() as session:
        async with session.get(url, params=params) as resp:

            hotels = await resp.json()
            if resp.status != 200:
                return f"API request failed with status {resp.status}"
            
            hotels = hotels.get("properties", [])

            print(f"No. of hotels: {len(hotels)}")
            hotels = hotels[:7]
            
            print(params)
            return hotels
