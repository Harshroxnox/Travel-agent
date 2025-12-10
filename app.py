from typing import Union
from agent_graph import agent_graph
from langchain.messages import HumanMessage
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from pydantic import BaseModel
import aiohttp
import os

app = FastAPI()

load_dotenv()

origins = [
    os.getenv("FRONTEND_URL"),
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Message(BaseModel):
    content: str

class FlightParams(BaseModel):
    engine: str
    flight_type: str
    currency: str
    departure_id: str
    arrival_id: str
    show_cheapest_flights: str
    outbound_date: str
    return_date: str
    departure_token: str

class HotelPropertyParams(BaseModel):
    engine: str
    property_token: str
    check_in_date: str
    check_out_date: str
    currency: str


@app.get("/api/hello")
def hello():
    return {"Hello": "World"}


@app.post("/api/invoke")
async def invoke(msg: Message):
    reply =  await agent_graph.ainvoke({
        "messages": [
            HumanMessage(content=msg.content)
        ]
    })
    return reply


@app.post("/api/flights_booking")
async def flights_booking(params: FlightParams):
    url = "https://www.searchapi.io/api/v1/search"
    
    select_params = params.model_dump()
    select_params["api_key"] = os.getenv("SEARCHAPI_KEY")

    # Select the default return flight i.e first flight
    async with aiohttp.ClientSession() as session:
        async with session.get(url, params=select_params) as resp:
            
            data = await resp.json()
            if resp.status != 200:
                return f"API request failed with status {resp.status}"
            
            return_flight = data.get("other_flights", [])[0]
            booking_token = return_flight.get("booking_token")

        book_params = params.model_dump(exclude={"departure_token"})
        book_params["api_key"] = os.getenv("SEARCHAPI_KEY")
        book_params["booking_token"] = booking_token

        async with session.get(url, params=book_params) as resp:

            data = await resp.json()
            if resp.status != 200:
                return f"API request failed with status {resp.status}"
            
            return data


@app.post("/api/hotels_booking")
async def hotels_booking(params: HotelPropertyParams):
    url = "https://www.searchapi.io/api/v1/search"

    book_params = params.model_dump()
    book_params["api_key"] = os.getenv("SEARCHAPI_KEY")

    async with aiohttp.ClientSession() as session:
        async with session.get(url, params=book_params) as resp:

            data = await resp.json()
            if resp.status != 200:
                return f"API request failed with status {resp.status}"
            
            property = data.get("property")
            return property.get("featured_offers")
