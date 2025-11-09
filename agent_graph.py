from langgraph.graph import StateGraph, MessagesState, START, END
from langchain_google_genai import ChatGoogleGenerativeAI
from mock_apis import mock_flights_api, mock_hotels_api
from dotenv import load_dotenv
from prompts.gather_intent_prompt import gather_intent_prompt
import json

load_dotenv()

llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash")

intents = ["booking", "itinerary", "knowledge", "general"]

# --- Node 1: Gather Intent ---
def gather_intent(state):
    user_msg = state["messages"][-1].content.lower()

    response = llm.invoke(gather_intent_prompt(user_msg)).content
    
    try:
        data = json.loads(response)
        data["intent"] = (data.get("intent") or "").lower()
    except:
        data = { "intent": None }

    if data.get("intent") not in intents:
        data["intent"] = None

    print(user_msg)
    print(data)
    return data

# --- Node 2: Itinerary Node ---
def itinerary_node(state):
    user_msg = state["messages"][-1].content

    itinerary_prompt = f"""
    You are a travel planner. Create a travel itinerary based on this:
    {user_msg}

    Include:
    - Tourist spots to visit each day
    - Suggested times for each activity
    - Any tips or recommendations
    Respond in a friendly, readable itinerary format.
    """

    reply = llm.invoke(itinerary_prompt)
    return {"messages": [reply]}

# --- Node 3: Booking Node ---
def booking_node(state):
    user_msg = state["messages"][-1].content.lower()
    if "flight" in user_msg:
        data = mock_flights_api("Delhi", "Goa", "2025-12-12")
        response = f"Here are some flight options:\n" + "\n".join(
            [f"{d['flight']} at {d['time']} ₹{d['price']}" for d in data]
        )
    elif "hotel" in user_msg:
        data = mock_hotels_api("Goa", "2025-12-12", "2025-12-15")
        response = f"Here are some hotels:\n" + "\n".join(
            [f"{d['name']} ({d['rating']}⭐) ₹{d['price']}" for d in data]
        )
    else:
        response = "Please specify whether you want to check flights or hotels."
    return {"messages": [{"role": "assistant", "content": response}]}

# --- Node 4: Knowledge Node ---
def knowledge_node(state):
    user_msg = state["messages"][-1].content
    reply = llm.invoke(f"Answer this general travel question: {user_msg}")
    return {"messages": [reply]}

# --- Node 5: General Chat ---
def general_chat(state):
    msg = state["messages"][-1].content
    reply = llm.invoke(msg)
    return {"messages": [reply]}

# --- Node 6: Fallback ---
def fallback(state):
    return {
        "messages": [
            {"role": "assistant", "content": "I am sorry I couldn't get what you were trying to say could you please clarify?"}
        ]
    }

# --- Graph Setup ---
graph = StateGraph(MessagesState)

graph.add_node("gather_intent", gather_intent)
graph.add_node("itinerary", itinerary_node)
graph.add_node("booking", booking_node)
graph.add_node("knowledge", knowledge_node)
graph.add_node("general", general_chat)
graph.add_node("fallback", fallback)

graph.add_edge(START, "gather_intent")

def route_after_intent(state):
    intent = state.get("intent")
    if intent == "itinerary":
        return "itinerary"
    elif intent == "booking":
        return "booking"
    elif intent == "knowledge":
        return "knowledge"
    elif intent == "general":
        return "general"
    else:
        return "fallback"

graph.add_conditional_edges("gather_intent", route_after_intent)
graph.add_edge("itinerary", END)
graph.add_edge("booking", END)
graph.add_edge("knowledge", END)
graph.add_edge("general", END)
graph.add_edge("fallback", END)

agent_graph = graph.compile()
