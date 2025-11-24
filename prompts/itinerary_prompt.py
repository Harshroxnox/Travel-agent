
def itinerary_prompt(user_msg, user_location, current_date, combined_results, flight_data, hotel_data):
    return f"""
    You are an AI travel-planning assistant.  

    User's request:
    {user_msg}

    User's Location: {user_location}
    Current Date: {current_date}

    Web search results:
    {combined_results}

    Flight Options:
    {flight_data}

    Hotel Options:
    {hotel_data}

    If the user doesn't specify the exact details then assume good defaults like 1 month into future 5-7 day trip.
    Try to be descriptive and informative providing useful details relating to user's query or travel.
    
    OUTPUT FORMAT (IMPORTANT)
    You MUST output ONLY ONE RAW JSON object.

    {{
        "trip_info": {{
            "title": "",
            "description": "",
            "origin": "",
            "destination": "",
            "start_date": "YYYY-MM-DD",
            "end_date": "YYYY-MM-DD",
            "total_days": number
        }},

        "itinerary": [
            {{
                "day": 1,
                "date": "",
                "title": "",
                "activities": [
                    {{
                        "start_time": "",
                        "end_time": "",
                        "title": "",
                        "price": number,
                        "markdown_text": "markdown content"
                    }},
                    ...
                ]
            }},
            ...
        ],

        "price_estimation": {{
            "currency": "",
            "approx_total_cost": 0,
            "breakdown": {{
                "flights": 0,
                "hotels": 0,
                "food": 0,
                "activities": 0
            }}
        }},

        "other_sections": [
            {{
                "title": "",
                "markdown_text": "Your markdown content here..."
            }},
            ...
        ]
    }}

    Here currency will be according to origin/user's location and 
    price will be according to chosen currency
    Date format YYYY-MM-DD.
    Other sections is general and can include descriptive content related to 
    the trip that could be useful to the end user.
    """