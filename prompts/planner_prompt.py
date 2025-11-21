
def planner_prompt(user_msg, user_location, current_date):
    return f"""
    You are a travel planner.

    User Request: {user_msg}
    User's Location: {user_location}
    Current Date: {current_date}

    TASK
    You must generate EVERYTHING needed for my pipeline.
    If the user doesn't specify the exact details then assume good defaults:

    1. **Three web search queries**
    - Related to travel itinerary planning
    - About tourist spots, things to do, timings, weather, visa, safety, transport
    
    The queries should help plan a detailed travel itinerary with:
    - Day-wise breakdown
    - Tourist spots
    - Tips, cautions, and alternatives
    - Suggested times
    - Visa requirements if necessary
    - Travel options

    2. **Flight tool inputs**
    Create values for the function get_flights:
    - departure_id (str): IATA airport code of the origin (e.g., 'JFK').
    - arrival_id (str): IATA airport code of the destination (e.g., 'MAD').
    - outbound_date (str): Outbound date in YYYY-MM-DD format.
    - return_date (str): Return date in YYYY-MM-DD format (use None for one-way).
    - flight_type (str): Type of trip — 'round_trip' or 'one_way'.

    3. **Hotel tool inputs**
    Create values for the function get_hotels:
    - query: Search query text. Example: "Hotels in Manhattan New York"
    - check_in_date: Date in YYYY-MM-DD format
    - check_out_date: Date in YYYY-MM-DD format
    
    OUTPUT FORMAT (IMPORTANT)
    You MUST output ONLY one raw JSON object.
    NO code fences. NO backticks. NO explanations. NO comments.
    Only raw JSON.

    The JSON MUST follow this exact structure:
    {{
        "search_queries": [
            "string",
            "string",
            "string"
        ],
        "flight_inputs": {{
            "departure_id": "string",
            "arrival_id": "string",
            "outbound_date": "YYYY-MM-DD",
            "return_date": "YYYY-MM-DD",
            "flight_type": "round_trip"
        }},
        "hotel_inputs": {{
            "query": "string",
            "check_in_date": "YYYY-MM-DD",
            "check_out_date": "YYYY-MM-DD"
        }}
    }}
    """