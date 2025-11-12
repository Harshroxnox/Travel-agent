from dotenv import load_dotenv
import os
import requests

load_dotenv()

def web_search(query):

    response = requests.post(
        url="https://api.exa.ai/search", 
        headers={
            "Content-Type": "application/json",
            "x-api-key": os.getenv('EXA_API_KEY')
        }, 
        json={
            "query": query,
            "numResults": 3,
            "context": True,
            "contents": {
                "text": True,
                "context": True
            }
    })

    results = response.json()
    return results["context"]
