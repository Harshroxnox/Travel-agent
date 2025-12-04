
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

    You MUST plan an itinerary with the given data and your own knowledge and output 
    ONLY ONE RAW JSON object in the format given below.

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

        "selected": {{
            "hotels": [
                {{
                    "days": 0,
                    "index": 0
                }},
                ...
            ],
            "flights": [ 
                {{
                    "index": 0
                }},
                ...
            ]
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
                        "markdown_text": "markdown content",
                        "type": "flight" | "hotel" | "food" | "activity"
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

    Things to keep in mind:
    - Be practical about how much can be done within a day.
    - Assume approximate prices of restaurants/food according to place.
    - Type of activity can be one of these "flight" or "hotel" or "food" or "activity"
    - If multiple in selected hotels then give in order from starting day to ending day
    - Include the total price of a particular hotel/flight the first time it appears in itinerary 
    - Here currency will be according to origin/user's location and 
    price will be according to chosen currency
    - Date format YYYY-MM-DD.
    - Other sections is general and can include descriptive content related to 
    the trip that could be useful to the end user.
    - If the user doesn't specify the exact details then assume good defaults like 1 month into future 5-7 day trip.
    - Try to be descriptive and informative providing useful details relating to user's query or travel.

    NOTE:
    If you output more than one JSON, the system will break.
    """