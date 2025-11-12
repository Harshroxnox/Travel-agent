import streamlit as st
from agent_graph import agent_graph


# Set page title and layout
st.set_page_config(page_title="LangGraph Travel Agent", layout="centered")
st.title("🧳 Travel Agent Assistant")


if "chat_history" not in st.session_state:
    st.session_state.chat_history = []

# Display chat
for msg in st.session_state.chat_history:
    with st.chat_message(msg["role"]):
        st.markdown(msg["content"])

# Get user input
user_input = st.chat_input("Ask me about your trip, bookings, or travel info...")

# Instantly show user message
if user_input:
    st.session_state.chat_history.append({"role": "user", "content": user_input})
    st.rerun()

if st.session_state.chat_history and st.session_state.chat_history[-1]["role"] == "user":
    user_input = st.session_state.chat_history[-1]["content"]

    with st.chat_message("assistant"):
        response_placeholder = st.empty()
        full_response = ""

        # Streaming loop
        for message_chunk, metadata in agent_graph.stream(
            {"messages": [{"role": "user", "content": user_input}]},
            stream_mode="messages", 
        ):  
            tags = metadata.get("tags", [])
            if "internal" not in tags:
                full_response += message_chunk.content
                response_placeholder.markdown(full_response)

        # Save final response to history
        st.session_state.chat_history.append({"role": "assistant", "content": full_response})
        st.rerun()

