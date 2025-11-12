from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
import os
import asyncio
import aiohttp

load_dotenv()

llm = ChatOpenAI(model="gpt-4o", tags=["internal"])


async def extract_data(query, crawled_site_data, url):
    ans = f"Url: {url} \n\n"

    extract_data_prompt = f"""
        You are a data cleaning/extraction assistant.

        Task:
        Given the user's query and the crawled site data, extract all the relevant information from the site data.

        Instructions:
        - Clean the crawled data so that it becomes readable
        - Preserve key facts, figures, or context.
        - Try to keep travel related info or other info related to users query

        User Query:
        {query}

        Crawled Site Data: 
        {crawled_site_data}
    """

    reply = await llm.ainvoke(extract_data_prompt)
    ans += reply.content

    return ans


async def web_search(query):

    async with aiohttp.ClientSession() as session:
        async with session.post(
            url="https://api.exa.ai/search", 
            headers={
                "Content-Type": "application/json",
                "x-api-key": os.getenv('EXA_API_KEY')
            }, 
            json={
                "query": query,
                "numResults": 2,
                "type": "neural",
                "contents": {
                    "text": True
                }
            }
        ) as response:
            results = await response.json()

    tasks = [extract_data(query, result["text"], result["url"]) for result in results["results"]]
    replies = await asyncio.gather(*tasks)

    answer = ""
    for reply in replies:
        answer += reply
        answer += "\n\n"

    return answer

