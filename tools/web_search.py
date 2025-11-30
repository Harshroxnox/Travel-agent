from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain_google_genai import ChatGoogleGenerativeAI
from crawl4ai import AsyncWebCrawler
import os
import asyncio
import aiohttp
import re
from markdownify import markdownify as md
from bs4 import BeautifulSoup

load_dotenv()

# summarizer_llm = ChatOpenAI(model="gpt-4o", tags=["internal"])
summarizer_llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash-lite", tags=["internal"])

def clean_markdown(text: str) -> str:
    # 1) Remove code blocks ```...``` completely
    text = re.sub(r"```.*?```", "", text, flags=re.DOTALL)

    # 2) Remove images ![alt](url)
    text = re.sub(r"!\[.*?\]\(.*?\)", "", text)

    # 3) Remove links [text](url) → keep only "text"
    text = re.sub(r"\[(.*?)\]\((.*?)\)", r"\1", text)

    # 4) Remove empty []() links
    text = re.sub(r"\[\]\(.*?\)", "", text)

    # 5) Convert leftover markdown → plain text
    html = md(text)
    soup = BeautifulSoup(html, "html.parser")
    text = soup.get_text(separator=" ")

    # 6) Remove ASCII noise / random characters lines
    cleaned_lines = []
    for line in text.split("\n"):
        # noise threshold: remove lines with <30% letters
        if len(line.strip()) == 0:
            continue
        
        letters = sum(c.isalpha() for c in line)
        ratio = letters / max(len(line), 1)

        if ratio < 0.3:
            continue
        
        cleaned_lines.append(line.strip())

    # 7) Remove duplicate lines
    final = []
    seen = set()
    for line in cleaned_lines:
        if line not in seen:
            seen.add(line)
            final.append(line)

    return "\n".join(final)


async def summarize(query, crawled_site_data):

    extract_data_prompt = f"""
        You are a data cleaning/extraction assistant.

        Task:
        Given the user's query and the crawled site data, extract all the relevant information that could
        be useful in answering users query from the site data.

        Instructions:
        - Clean the crawled data so that it becomes readable
        - Preserve key facts, figures, or context.
        - Keep information related to users query

        User Query:
        {query}

        Crawled Site Data: 
        {crawled_site_data}
    """

    reply = await summarizer_llm.ainvoke(extract_data_prompt)
    print(reply.usage_metadata)

    return reply.content

async def extract(url):
    async with AsyncWebCrawler() as crawler:
        result = await crawler.arun(
            url=url,
        )      
        return clean_markdown(result.markdown)

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
                "type": "auto"
            }
        ) as response:
            results = await response.json()
    print("Web Search Completed")

    urls = [r.get("url", "") for r in results["results"]]
    # Extract the content from URLs in parallel 
    tasks = [extract(url) for url in urls]
    texts = await asyncio.gather(*tasks)

    cleaned_web_search = ""
    for url, text in zip(urls, texts):
        cleaned_web_search += f"Url:{url}\nText:{text}\n\n"

    answer = await summarize(query, cleaned_web_search)
    print("Summarization of results done")

    return answer

