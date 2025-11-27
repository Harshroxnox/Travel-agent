from typing import Union
from agent_graph import agent_graph
from langchain.messages import HumanMessage
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from pydantic import BaseModel
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
