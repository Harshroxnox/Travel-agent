import { useState } from "react";
import { AppContext } from "./AppContext";

export const AppProvider = ({ children }) => {
  const [data, setData] = useState({})
  const [threadId, setThreadId] = useState("")

  return (
    <AppContext.Provider value={{ data, setData, threadId, setThreadId }}>
      {children}
    </AppContext.Provider>
  );
};