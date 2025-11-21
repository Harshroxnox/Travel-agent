import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useState, useEffect } from 'react'
import data from "./data"
import axios from 'axios';

const ItineraryApp = () => {
  const { itinerary, hotels, price_estimation, flights, other_sections } = data.itinerary;
	let thread_id;
	
	const fetchData = async () => {
		await axios.post('http://127.0.0.1:2024/threads', { 
			thread_id: ""
		})
		.then(res => thread_id = res.data.thread_id)
		.catch(err => console.log(err));
	}

  useEffect(()=>{
		fetchData()
  },[])

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-10">
      {/* Section 1: Itinerary */}
      <section>
        <h1 className="text-3xl font-bold mb-4">Itinerary</h1>
        {itinerary.map((day) => (
          <div key={day.day} className="mb-6 p-4 border rounded-xl shadow-sm">
            <h2 className="text-2xl font-semibold mb-2">Day {day.day}: {day.title}</h2>
            <p className="text-gray-500 mb-3">{day.date}</p>

            {day.activities.map((act, idx) => (
              <div key={idx} className="mb-4 p-4 border rounded-lg bg-gray-50">
                <h3 className="text-xl font-semibold">{act.title}</h3>
                <p className="text-sm text-gray-600">{act.start_time} - {act.end_time}</p>
                <p className="text-sm text-gray-700 font-medium mt-1">Price: ₹{act.price}</p>
                <div className="prose mt-3">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{act.markdown_text}</ReactMarkdown>
                </div>
              </div>
            ))}
          </div>
        ))}
      </section>

			{/* Section 2: Price Estimation */}
			<section>
				<h1 className="text-3xl font-bold mb-4">Price Estimation</h1>
				<div className="mb-6 p-4 border rounded-xl shadow-sm">
					<p className="text-xl font-semibold">Total Estimated Cost: {price_estimation.currency} {price_estimation.approx_total_cost}</p>
					<div className="mt-4">
						<p className="font-medium">Breakdown:</p>
						<ul className="list-disc ml-6 mt-2">
							<li>Flights: {price_estimation.breakdown.flights}</li>
							<li>Hotels: {price_estimation.breakdown.hotels}</li>
							<li>Food: {price_estimation.breakdown.food}</li>
							<li>Activities: {price_estimation.breakdown.activities}</li>
						</ul>
				  </div>
				</div>
			</section>

      {/* Section 3: Hotels */}
      <section>
        <h1 className="text-3xl font-bold mb-4">Hotels</h1>
        {hotels.map((hotel, idx) => (
          <div key={idx} className="mb-6 p-4 border rounded-xl shadow-sm">
            <h2 className="text-2xl font-semibold">{hotel.name}</h2>
            <p className="text-gray-600">{hotel.description}</p>
            <p className="font-medium mt-2">City: {hotel.city}</p>
            <p className="font-medium">Total Price: {hotel.total_price.price}</p>
            <p className="mt-2 text-yellow-600">Rating: {hotel.rating} ⭐ ({hotel.reviews} reviews)</p>
          </div>
        ))}
      </section>

      {/* Section 4: Flights */}
      <section>
        <h1 className="text-3xl font-bold mb-4">Flights</h1>
        {flights.top_flights.map((flight, idx) => (
          <div key={idx} className="mb-6 p-4 border rounded-xl shadow-sm">
            <h2 className="text-xl font-semibold mb-2">{flight.flights[0].airline} - {flight.flights[0].flight_number}</h2>
            <p>Price: ${flight.price}</p>
            <p>Duration: {flight.total_duration} mins</p>
            <div className="mt-3">
              <p className="font-medium">Departure:</p>
              <p>{flight.flights[0].departure_airport.name} at {flight.flights[0].departure_airport.time}</p>
              <p className="font-medium mt-2">Arrival:</p>
              <p>{flight.flights[0].arrival_airport.name} at {flight.flights[0].arrival_airport.time}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Section 5: Other Sections */}
      <section>
        <h1 className="text-3xl font-bold mb-4">Additional Information</h1>
        {other_sections.map((sec, idx) => (
          <div key={idx} className="mb-6 p-4 border rounded-xl shadow-sm">
            <h2 className="text-2xl font-semibold mb-3">{sec.title}</h2>
            <div className="prose">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{sec.markdown_text}</ReactMarkdown>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

export default ItineraryApp;
