import { useState } from "react";
import { AppContext } from "./AppContext";

export const AppProvider = ({ children }) => {
	const [data, setData] = useState({});
	const [messages, setMessages] = useState([
		{ sender: "bot", text: "Hi! How can I help you today?" }
	]);

	return (
		<AppContext.Provider value={{ messages, setMessages, data, setData }}>
			{children}
		</AppContext.Provider>
	);
};