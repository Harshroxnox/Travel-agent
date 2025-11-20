from langchain_core.tools import tool
from dotenv import load_dotenv
import aiohttp
from typing import Dict, Any
import os

load_dotenv()

async def get_flights(
    departure_id: str,
    arrival_id: str,
    outbound_date: str,
    return_date: str,
    flight_type: str = "round_trip",
) -> Dict[str, Any]:
    """
    Search Google Flights (via searchapi.io).
    Required Input Parameters:
    - departure_id (str): IATA airport code of the origin (e.g., 'JFK').
    - arrival_id (str): IATA airport code of the destination (e.g., 'MAD').
    - outbound_date (str): Outbound date in YYYY-MM-DD format.
    - return_date (str): Return date in YYYY-MM-DD format (use None for one-way).
    - flight_type (str): Type of trip — 'round_trip' or 'one_way'.

    What the tool does:
    Makes an async request to searchapi.io's Google Flights engine and retrieves 
    real-time flight options.
    """

    url = "https://www.searchapi.io/api/v1/search"

    # Build request parameters
    params = {
        "engine": "google_flights",
        "flight_type": flight_type,
        "departure_id": departure_id,
        "arrival_id": arrival_id,
        "outbound_date": outbound_date,
        "api_key": os.getenv("SEARCHAPI_KEY")
    }
    print(params)

    if flight_type == "round_trip":
        params["return_date"] = return_date

    async with aiohttp.ClientSession() as session:
        async with session.get(url, params=params) as resp:

            data = await resp.json()
            if resp.status != 200:
                return f"API request failed with status {resp.status}"


            # Extract top 4 flights (default behavior)
            flights = data.get("best_flights", [])[:5]

            results =  {
                "query": params,
                "total_flights_found": len(data.get("best_flights", [])),
                "top_flights": flights,
            }
            return results
