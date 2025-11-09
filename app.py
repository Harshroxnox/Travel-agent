import streamlit as st
from agent_graph import agent_graph

st.set_page_config(page_title="LangGraph Travel Agent", layout="centered")
st.title("🧳 Travel Agent Assistant")

if "chat_history" not in st.session_state:
    st.session_state.chat_history = []

user_input = st.chat_input("Ask me about your trip, bookings, or travel info...")

if user_input:
    st.session_state.chat_history.append({"role": "user", "content": user_input})

    result = agent_graph.invoke({"messages": [{"role": "user", "content": user_input}]})
    bot_msg = result["messages"][-1].content
    st.session_state.chat_history.append({"role": "assistant", "content": bot_msg})

for msg in st.session_state.chat_history:
    with st.chat_message(msg["role"]):
        st.markdown(msg["content"])
