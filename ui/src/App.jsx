import { useState } from 'react'
import ItineraryApp from "../pages/itinerary"
import { AppProvider } from '../context/AppProvider';
import Chat from '../pages/chat';
import { Routes, Route } from "react-router";
import './App.css'

function App() {
  return (
    <AppProvider>
			<Routes>
				<Route path="/" element={ <Chat/> } />
				<Route path="/itinerary" element={ <ItineraryApp/>} />
			</Routes>
    </AppProvider>
  )
}

export default App
