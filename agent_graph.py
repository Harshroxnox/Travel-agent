from langgraph.graph import StateGraph, MessagesState, START, END
from langchain_google_genai import ChatGoogleGenerativeAI
from mock_apis import mock_flights_api, mock_hotels_api
from dotenv import load_dotenv

load_dotenv()

llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash")

# --- Node 1: Gather Intent ---
def gather_intent(state):
    user_msg = state["messages"][-1].content.lower()
    
    if "flight" in user_msg or "hotel" in user_msg or "book" in user_msg:
        intent = "booking"
    elif "plan" in user_msg or "itinerary" in user_msg or "trip" in user_msg:
        intent = "itinerary"
    elif "?" in user_msg or "what" in user_msg or "how" in user_msg:
        intent = "knowledge"
    else:
        intent = "general"

    return {"intent": intent}

# --- Node 2: Itinerary Node ---
def itinerary_node(state):
    user_msg = state["messages"][-1].content
    reply = llm.invoke(f"Create a short travel itinerary based on this: {user_msg}")
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
            {"role": "assistant", "content": "I'm sorry, could you please clarify your request?"}
        ]
    }

# --- Graph Setup ---
graph = StateGraph(MessagesState)

graph.add_node("gather_intent", gather_intent)
graph.add_node("itinerary", itinerary_node)
graph.add_node("booking", booking_node)
graph.add_node("knowledge", knowledge_node)
graph.add_node("chat", general_chat)
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
        return "chat"
    else:
        return "fallback"

graph.add_conditional_edges("gather_intent", route_after_intent)
graph.add_edge("itinerary", END)
graph.add_edge("booking", END)
graph.add_edge("knowledge", END)
graph.add_edge("chat", END)
graph.add_edge("fallback", END)

agent_graph = graph.compile()
