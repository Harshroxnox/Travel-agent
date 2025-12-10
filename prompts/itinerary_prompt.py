
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

    Things to keep in mind:
    - Be practical about how much can be done within a day.
    - Assume approximate prices of restaurants/food according to place.
    - Type of activity can be one of these "flight" or "hotel" or "food" or "activity"
    - Selected hotels should be according to itinerary like if we are staying 3 days in X, 3 days in Y and
    4 days in Z then 3 days hotel in X, 3 days hotel in Y and 4 days hotel in Z place.
    - Include the total price of a particular hotel/flight the first time it appears in itinerary 
    - Here currency will be according to origin/user's location and price will be according 
    to chosen currency
    - Date format YYYY-MM-DD.
    - Misc expenses should not include hotel, flight, activities or food costs as they are already covered.
    - Other sections is general and can include descriptive content related to the trip that 
    could be useful to the end user.
    - If the user doesn't specify the exact details then assume good defaults like 1 month into future 5-7 day trip and
    assume number of persons to be 1.
    - Try to be descriptive and informative providing useful details relating to user's query or travel.


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

        "currency": "",

        "misc_expenses": [
            {{
                "name": "Visa",
                "price": 0
            }},
            {{
                "name": "Local Transport",
                "price": 0
            }},
            ...
        ],

        "other_sections": [
            {{
                "title": "",
                "markdown_text": "Your markdown content here..."
            }},
            ...
        ]
    }}

    NOTE:
    If you output more than one JSON, the system will break.
    """
