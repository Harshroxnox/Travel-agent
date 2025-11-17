from agent_graph import agent_graph
import asyncio

async def agent_stream(user_input):
    async for message_chunk, metadata in agent_graph.astream(
        {"messages": [{"role": "user", "content": user_input}]},
        stream_mode="messages", 
    ):
        tags = metadata.get("tags", [])
        if "internal" not in tags:
            print(message_chunk.content, end="")
    print("\n")

asyncio.run(agent_stream("Plan a 5 day trip to Dubai?"))
