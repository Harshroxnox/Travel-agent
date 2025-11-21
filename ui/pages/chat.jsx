import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function Chat() {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hi! How can I help you today?" }
  ]);
  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (!input.trim()) return;

    const newMsg = { sender: "user", text: input };

    setMessages((prev) => [...prev, newMsg]);

    // Simulate bot reply
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Thanks for your message!" }
      ]);
    }, 600);

    setInput("");
  };

  return (
    <div className="max-w-4xl mx-auto p-6 flex flex-col h-screen">
      <h1 className="text-3xl font-bold mb-4">Chat Assistant</h1>

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
