import React, { useState, useContext } from "react";
import { AppContext } from "../context/AppContext";
import { data, useNavigate } from "react-router";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function parseSSEChunk(chunk) {
	const lines = chunk.split("\n");
	let data = null;

	for (const line of lines) {
		if (line.startsWith("data:")) {
			data = line.replace("data: ", "").trim();
		}
	}
	return data;
}


export default function Chat() {
	const [input, setInput] = useState("");
	const { setData, messages, setMessages } = useContext(AppContext);
	const navigate = useNavigate();
	const baseUrl = import.meta.env.VITE_BASE_URL;

	const sendMessage = async () => {
		if (!input.trim()) return;

		const newMsg = { sender: "user", text: input };
		setMessages((prev) => [...prev, newMsg]);

		setMessages((prev) => [
			...prev,
			{ sender: "bot", text: "Thinking..." }
		]);

		const response = await fetch(`${baseUrl}/api/invoke`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
                content: input,
			})
		});

		// convert response to json
		const ans = await response.json();
        console.log(ans)
		const len = ans.messages.length
        console.log(len)

		setMessages((prev) => {
			const updated = [...prev];
			updated[updated.length - 1] = {
				sender: "bot",
				text: ans.messages[len - 1].content
			}
			return updated;
		});

		if (ans?.itinerary) {
			setData(ans.itinerary)
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
						className={`max-w-[70%] p-3 border rounded-xl text-sm whitespace-pre-wrap ${msg.sender === "user"
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
