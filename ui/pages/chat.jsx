import React, { useState, useContext } from "react";
import { AppContext } from "../context/AppContext";
import { useNavigate } from "react-router";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function parseSSEChunk(chunk) {
  const lines = chunk.split("\n");

  let event = null;
  let data = null;
  let id = null;

  for (const line of lines) {
    if (line.startsWith("event:")) {
      event = line.replace("event: ", "").trim();
    } else if (line.startsWith("data:")) {
      const jsonPart = line.replace("data: ", "").trim();
      try {
        data = JSON.parse(jsonPart);
      } catch (e) {
        console.error("JSON parse error:", e, jsonPart);
      }
    } else if (line.startsWith("id:")) {
      id = line.replace("id: ", "").trim();
    }
  }
  return { event, data, id };
}


export default function Chat() {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hi! How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
	const {setData} = useContext(AppContext);
	const navigate = useNavigate();

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMsg = { sender: "user", text: input };
    setMessages((prev) => [...prev, newMsg]);

		const response = await fetch("http://127.0.0.1:2024/runs/stream", {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				assistant_id: 'agent',
				input: {
					messages: [
						{type: "human", content: input}
					]
				},
			})
		});

		setMessages((prev) => [
			...prev,
			{ sender: "bot", text: "Thinking..." }
		]);

		// create stream reader 
		const reader = response.body.getReader();
		const decoder = new TextDecoder();

		while (true) {
			const { done, value } = await reader.read();
			if (done) break;

			const chunk = decoder.decode(value, { stream: true });
			const parsed = parseSSEChunk(chunk)

			if(Array.isArray(parsed?.data?.messages)){
				const len = parsed.data.messages.length
				console.log(parsed.data)

				if(parsed.data.messages[len-1].type == 'ai'){
					if(parsed.data?.itinerary){
						setData(parsed.data.itinerary)
					}
					setMessages((prev) => {
						const updated = [...prev];
						updated[updated.length-1] = {
							sender:"bot",
							text: parsed.data.messages[len-1].content
						}
						return updated;
					});
				}
			}
		}

    setInput("");
  };

  return (
    <div className="max-w-4xl mx-auto p-6 flex flex-col h-screen">
			<div className="flex items-center justify-between">
				<h1 className="text-3xl font-bold mb-4">Chat Assistant</h1>
				<button
          onClick={() => navigate("/itinerary")}
          className="px-3 py-2 bg-gray-800 text-white rounded-xl shadow hover:bg-gray-900"
        >
          Itinerary
        </button>
			</div>
      

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto border rounded-xl p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`max-w-[70%] p-3 border rounded-xl text-sm whitespace-pre-wrap ${
              msg.sender === "user"
                ? "bg-gray-800 text-white ml-auto"
                : "bg-white text-gray-800"
            }`}
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
          </div>
        ))}
      </div>

      {/* Input Box */}
      <div className="mt-4 flex gap-2">
        <input
          type="text"
          className="flex-1 p-3 border rounded-xl focus:ring focus:ring-gray-800"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          onClick={sendMessage}
          className="px-5 py-3 bg-gray-800 text-white rounded-xl shadow hover:bg-gray-900"
        >
          Send
        </button>
      </div>
    </div>
  );
}
