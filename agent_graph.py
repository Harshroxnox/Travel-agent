from typing import Dict, Optional
from langgraph.graph import StateGraph, MessagesState, START, END
from langchain.messages import AIMessage
from langchain_google_genai import ChatGoogleGenerativeAI
from tools.web_search import web_search
from tools.hotels import get_hotels
from tools.flights import get_flights
from dotenv import load_dotenv
from prompts.gather_intent_prompt import gather_intent_prompt
from prompts.planner_prompt import planner_prompt
from prompts.itinerary_prompt import itinerary_prompt
from utils.utils import strip_code_fences, preprocess_hotels
import json
import asyncio
from datetime import date

user_location = "Delhi, India"
current_date = date.today()
current_date = current_date.strftime("%d %B %Y")

load_dotenv()

intents = ["itinerary", "knowledge", "general", "flight", "hotel"]

llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", tags=["internal"])

final_llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", tags=["final"])


# Define State
class AgentState(MessagesState):
    itinerary: Optional[Dict]


# --- Node 1: Gather Intent ---
async def gather_intent(state):
    user_msg = state["messages"][-1].content.lower()

    reply = await llm.ainvoke(gather_intent_prompt(user_msg))
    response = strip_code_fences(reply.content)
    
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
async def itinerary_node(state):
    user_msg = state["messages"][-1].content

    # STEP 1 — Ask LLM for search queries
    plan_prompt = planner_prompt(user_msg, user_location, current_date)

    planner_response = await llm.ainvoke(plan_prompt)
    print(strip_code_fences(planner_response.content))

    try:
        data = json.loads(strip_code_fences(planner_response.content))
    except:
        return {"messages": [
            AIMessage(content="I could not understand the travel details. Please rephrase your request.")
        ]}

    search_queries = data.get("search_queries", [])
    flight_inputs = data.get("flight_inputs", {})
    hotel_inputs = data.get("hotel_inputs", {})

    # Extract trip info from planner
    trip_info = data.get("trip_info", {})
    print(trip_info)

    # Building flight params to send to frontend
    flight_params = {
        "engine": "google_flights",
        "flight_type": flight_inputs.get("flight_type"),
        "currency": flight_inputs.get("currency"),
        "departure_id": flight_inputs.get("departure_id"),
        "arrival_id": flight_inputs.get("arrival_id"),
        "show_cheapest_flights": "true",
        "outbound_date": flight_inputs.get("outbound_date"),
        "return_date": flight_inputs.get("return_date")
    }

    # STEP 2 — parallel tool calls
    search_tasks = [web_search(query=q) for q in search_queries]
    flight_task = get_flights(**flight_inputs)
    hotel_task = get_hotels(**hotel_inputs)
    
    (
        search_results,
        flight_data,
        hotel_data
    ) = await asyncio.gather(
        asyncio.gather(*search_tasks),
        flight_task,
        hotel_task
    )
    
    llm_hotel_data = preprocess_hotels(hotel_data)
    combined_results = "\n\n".join(
        f"Search Query: {q}\nResult:\n{r}\n\n" 
        for q, r in zip(search_queries, search_results)
    )

    # STEP 3 — Final LLM call to generate itinerary
    trip_prompt = itinerary_prompt(user_msg, user_location, current_date, trip_info, combined_results, flight_data, llm_hotel_data)

    final_reply = await final_llm.ainvoke(trip_prompt)
    print("Final LLM Usage:", final_reply.usage_metadata)

    try:
        ans = json.loads(strip_code_fences(final_reply.content))
    except:
        return {"messages": [
            AIMessage(content="I could not understand the travel details. Please rephrase your request.")
        ]}
    
    ans["flights"] = flight_data
    ans["hotels"] = hotel_data
    ans["flight_params"] = flight_params
    ans["trip_info"] = trip_info

    return {
        "messages": [
            AIMessage(content="I have generated the complete itinerary for you.")
        ],
        "itinerary": ans
    }


# --- Node 3: Knowledge Node ---
async def knowledge_node(state):
    user_msg = state["messages"][-1].content

    try:
        web_context = await web_search(user_msg)
        final_prompt = f"""
        You are an AI assistant specializing in travel and general queries.
        Use the web search results below to answer the user's question.

        Web search results:
        {web_context}

        User question:
        {user_msg}

        - If the web information seems irrelevant or insufficient, combine it with your own knowledge.
        - Try to be descriptive and informative providing useful details relating to user's query or travel.
        - Try to answer in bullet points in a presentable format
        """
    except Exception as e:
        final_prompt = f"The web search failed with error: {e}. Still try to answer this: {user_msg}"

    reply = await final_llm.ainvoke(final_prompt)
    print(reply.usage_metadata)
    return {"messages": [reply]}


# --- Node 4: General Chat ---
async def general_chat(state):
    user_msg = state["messages"][-1].content
    final_prompt = f"""
    You are an AI assistant specializing in travel and general queries.
    Answer this general question: {user_msg}
    """
    reply = await final_llm.ainvoke(final_prompt)
    print(reply.usage_metadata)
    return {"messages": [reply]}


# --- Node 5: Flight Node ---
async def flight_node(state):
    user_msg = state["messages"][-1].content

    flight_inputs_prompt = f"""
    You need to extract flight data from the given information.
    User Request: {user_msg}
    User's Location: {user_location}
    Current Date: {current_date}

    Create values for the function get_flights:
    - departure_id (str): IATA airport code of the origin (e.g., 'JFK').
    - arrival_id (str): IATA airport code of the destination (e.g., 'MAD').
    - currency: ISO currency code according to users location
    - outbound_date (str): Outbound date in YYYY-MM-DD format.
    - return_date (str): Return date in YYYY-MM-DD format (use None for one-way).
    - flight_type (str): Type of trip — 'round_trip' or 'one_way'.

    If the user doesn't specify the exact dates then assume good defaults like 1 month into future.

    OUTPUT FORMAT (IMPORTANT)
    You MUST output ONLY one raw JSON object.
    The JSON MUST follow this exact structure:
    {{
        "departure_id": "string",
        "arrival_id": "string",
        "currency": "string",
        "outbound_date": "YYYY-MM-DD",
        "return_date": "YYYY-MM-DD",
        "flight_type": "round_trip"
    }}
    """

    flight_inputs = await llm.ainvoke(flight_inputs_prompt)
    try:
        flight_inputs = json.loads(strip_code_fences(flight_inputs.content))
    except:
        return {"messages": [
            AIMessage(content="I could not understand the travel details. Please rephrase your request.")
        ]}

    flight_data = await get_flights(**flight_inputs)

    final_prompt = f"""
    You are an AI assistant specializing in travel and general queries.
    Use the data below to answer the user's question.

    Web search results:
    {flight_data}

    User question:
    {user_msg}

    - If the web information seems irrelevant or insufficient, combine it with your own knowledge.
    - Try to be descriptive and informative providing useful details relating to user's query or travel.
    - Try to answer in bullet points in a presentable format
    """

    reply = await final_llm.ainvoke(final_prompt)

    print(reply.usage_metadata)
    return {"messages": [reply]}


# --- Node 6: Hotel Node ---
async def hotel_node(state):
    user_msg = state["messages"][-1].content

    hotel_inputs_prompt = f"""
    You need to extract hotel data from the given information.
    User Request: {user_msg}
    User's Location: {user_location}
    Current Date: {current_date}

    Create values for the function get_hotels:
    - query: Search query text. Example: "Hotels in Manhattan New York"
    - currency: ISO currency code according to users location
    - check_in_date: Date in YYYY-MM-DD format
    - check_out_date: Date in YYYY-MM-DD format

    If the user doesn't specify the exact dates then assume good defaults like 1 month into future.

    OUTPUT FORMAT (IMPORTANT)
    You MUST output ONLY one raw JSON object.
    The JSON MUST follow this exact structure:
    {{
        "query": "string",
        "currency": "string",
        "check_in_date": "YYYY-MM-DD",
        "check_out_date": "YYYY-MM-DD"
    }}
    """

    hotel_inputs = await llm.ainvoke(hotel_inputs_prompt)
    try:
        hotel_inputs = json.loads(strip_code_fences(hotel_inputs.content))
    except:
        return {"messages": [
            AIMessage(content="I could not understand the travel details. Please rephrase your request.")
        ]}

    # NOTE: We have to see this whether to give hotel_data or llm_hotel_data
    hotel_data = await get_hotels(**hotel_inputs)
    llm_hotel_data = preprocess_hotels(hotel_data)

    final_prompt = f"""
    You are an AI assistant specializing in travel and general queries.
    Use the data below to answer the user's question.

    Data:
    {llm_hotel_data}

    User question:
    {user_msg}

    - If the web information seems irrelevant or insufficient, combine it with your own knowledge.
    - Try to be descriptive and informative providing useful details relating to user's query or travel.
    - Try to answer in bullet points in a presentable format
    """

    reply = await final_llm.ainvoke(final_prompt)

    print(reply.usage_metadata)
    return {"messages": [reply]}


# --- Node 7: Fallback ---
def fallback(state):
    return {
        "messages": [
            AIMessage(content= "I am sorry I couldn't get what you were trying to say could you please clarify?")
        ]
    }

# --- Graph Setup ---
graph = StateGraph(AgentState)

graph.add_node("gather_intent", gather_intent)
graph.add_node("itinerary", itinerary_node)
graph.add_node("knowledge", knowledge_node)
graph.add_node("hotel", hotel_node)
graph.add_node("flight", flight_node)
graph.add_node("general", general_chat)
graph.add_node("fallback", fallback)

graph.add_edge(START, "gather_intent")

def route_after_intent(state):
    intent = state.get("intent")
    if intent == "itinerary":
        return "itinerary"
    elif intent == "knowledge":
        return "knowledge"
    elif intent == "hotel":
        return "hotel"
    elif intent == "flight":
        return "flight"
    elif intent == "general":
        return "general"
    else:
        return "fallback"

graph.add_conditional_edges("gather_intent", route_after_intent)
graph.add_edge("itinerary", END)
graph.add_edge("knowledge", END)
graph.add_edge("hotel", END)
graph.add_edge("flight", END)
graph.add_edge("general", END)
graph.add_edge("fallback", END)

agent_graph = graph.compile()
