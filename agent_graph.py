from langgraph.graph import StateGraph, MessagesState, START, END
from langchain.messages import AIMessage
from langchain_openai import ChatOpenAI
from langchain_google_genai import ChatGoogleGenerativeAI
from tools.web_search import web_search
from tools.hotels import get_hotels
from tools.flights import get_flights
from dotenv import load_dotenv
from prompts.gather_intent_prompt import gather_intent_prompt
from prompts.planner_prompt import planner_prompt
from utils.utils import strip_code_fences
import json
import asyncio

from datetime import date

user_location = "Delhi, India"
current_date = date.today()
current_date = current_date.strftime("%d %B %Y")

load_dotenv()

intents = ["itinerary", "knowledge", "general"]

# llm = ChatOpenAI(model="gpt-4o", tags=["internal"])
llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", tags=["internal"])

# final_llm = ChatOpenAI(model="gpt-4o", tags=["final"])
final_llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", tags=["final"])


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

    # STEP 1 — Ask LLM to generate 1–6 search queries
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

    # STEP 2 — Run all web searches in parallel
    # Each is an async tool call
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

    # Concatenate results into a single string
    combined_results = "\n\n".join(
        f"Search Query: {q}\nResult:\n{r}\n\n" 
        for q, r in zip(search_queries, search_results)
    )

    # STEP 3 — Final LLM call to generate itinerary using real search results
    itinerary_prompt = f"""
    You are an AI assistant specializing in travel and general queries.
    Use the web search results data below to generate an itinerary along with hotels and transporation options.

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

    Now generate a detailed travel itinerary:
    - Day-wise breakdown
    - Tourist spots
    - Suggested times
    - Travel options
    - Hotels and flights suggestions along with prices
    - Tips, cautions, and alternatives

    If the user doesn't specify the exact details then assume good defaults.
    Try to be descriptive and informative providing useful details relating to user's query or travel.
    """

    final_reply = await final_llm.ainvoke(itinerary_prompt)
    print("Final LLM Usage:", final_reply.usage_metadata)

    return {"messages": [final_reply]}

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

# --- Node 5: Fallback ---
def fallback(state):
    return {
        "messages": [
            AIMessage(content= "I am sorry I couldn't get what you were trying to say could you please clarify?")
        ]
    }

# --- Graph Setup ---
graph = StateGraph(MessagesState)

graph.add_node("gather_intent", gather_intent)
graph.add_node("itinerary", itinerary_node)
graph.add_node("knowledge", knowledge_node)
graph.add_node("general", general_chat)
graph.add_node("fallback", fallback)

graph.add_edge(START, "gather_intent")

def route_after_intent(state):
    intent = state.get("intent")
    if intent == "itinerary":
        return "itinerary"
    elif intent == "knowledge":
        return "knowledge"
    elif intent == "general":
        return "general"
    else:
        return "fallback"

graph.add_conditional_edges("gather_intent", route_after_intent)
graph.add_edge("itinerary", END)
graph.add_edge("knowledge", END)
graph.add_edge("general", END)
graph.add_edge("fallback", END)

agent_graph = graph.compile()
