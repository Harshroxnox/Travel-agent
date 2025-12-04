import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useContext } from 'react'
import { useNavigate } from "react-router";
import { AppContext } from "../context/AppContext";

const ItineraryApp = () => {
	const { data } = useContext(AppContext);
	const navigate = useNavigate();

	if (!data || Object.keys(data).length === 0) {
		return (
			<div className="p-6 max-w-5xl mx-auto">
				<section>
					<div className="flex items-center justify-between">
						<h1 className="text-3xl font-bold mb-4">Itinerary</h1>
						<button
							onClick={() => navigate("/")}
							className="px-3 py-2 bg-gray-800 text-white rounded-xl shadow hover:bg-gray-900"
						>
							Chat
						</button>
					</div>
					<h1 className="text-2xl font-semibold">No Itinerary generated yet</h1>
				</section>
			</div>
		);
	}
	const { itinerary, hotels, selected, price_estimation, flights, other_sections } = data;
	console.log(flights);
	console.log(hotels);

	const selectedHotelIndexes = new Set(
		selected.hotels.map(h => h.index)
	);

	const selectedFlightIndexes = new Set(
		selected.flights.map(f => f.index)
	);

	return (
		<div className="p-6 max-w-5xl mx-auto space-y-10">
			{/* Section 1: Itinerary */}
			<section>
				<div className="flex items-center justify-between">
					<h1 className="text-3xl font-bold mb-4">Itinerary</h1>
					<button
						onClick={() => navigate("/")}
						className="px-3 py-2 bg-gray-800 text-white rounded-xl shadow hover:bg-gray-900"
					>
						Chat
					</button>
				</div>

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
					<div
						key={idx}
						className="p-5 mb-8 border rounded-2xl shadow-md hover:shadow-lg transition-all"
					>

						{/* Hotel Content */}
						<div className="pt-2 space-y-2">

							{/* Name + link */}
							<div className="flex items-center justify-between">
								<h2 className="flex items-center gap-2 text-2xl font-semibold">
									{/* Selected Badge */}
									{hotel?.name ?? "NA"}
									{selectedHotelIndexes.has(idx) && (
										<span className="text-sm bg-green-700 text-white p-1 pl-2 pr-2 rounded-md">
											Selected
										</span>
									)}
								</h2>

								{hotel?.link && (
									<a
										href={hotel.link}
										target="_blank"
										rel="noreferrer"
									>
										<button className="mt-2 px-4 py-1 bg-gray-800 cursor-pointer text-white rounded-md">
											Visit Site
										</button>
									</a>
								)}
							</div>

							{/* Description */}
							<p className="text-gray-600">{hotel?.description ?? "NA"}</p>

							{/* Location */}
							<p className="font-medium">
								📍 {hotel?.city ?? "NA"}, {hotel?.country ?? "NA"}
							</p>

							{/* Check-in / Check-out */}
							<p className="text-sm text-gray-700">
								Check-in: <span className="font-medium">{hotel?.check_in_time ?? "NA"}</span> |
								Check-out: <span className="font-medium">{hotel?.check_out_time ?? "NA"}</span>
							</p>

							{/* Deal */}
							{hotel?.deal && (
								<p className="text-green-700 font-semibold">
									💥 {hotel.deal} ({hotel?.deal_description})
								</p>
							)}

							{/* Price */}
							<p className="text-lg font-semibold mt-2">
								Price per night (incl. tax): {hotel?.price_per_night?.price ?? "NA"}
							</p>

							{/* Hotel class */}
							<p className="text-sm text-gray-700">🏨 {hotel?.hotel_class ?? "NA"}</p>

							{/* Rating */}
							<p className="text-yellow-950 font-medium">
								⭐ {hotel?.rating ?? "NA"} ({hotel?.reviews ?? "NA"} reviews)
							</p>

							{/* Amenities */}
							{hotel?.amenities?.length > 0 && (
								<div className="mt-3 flex flex-wrap gap-2">
									{hotel.amenities.slice(0, 10).map((a, i) => (
										<span
											key={i}
											className="text-xs px-3 py-1 bg-gray-200 rounded-full"
										>
											{a}
										</span>
									))}
								</div>
							)}
						</div>

					</div>
				))}
			</section>

			{/* Section 4: Flights */}
			<section>

				<h1 className="text-3xl font-bold mb-4">Flights</h1>

				{flights.map((item, idx) => {
					const first = item.flights[0];
					const last = item.flights[item.flights.length - 1];

					const stops = item.flights.length - 1;
					const stopLabel =
						stops === 0 ? "Non-stop" : stops === 1 ? "1 Stop" : `${stops} Stops`;

					return (
						<div
							key={idx}
							className="border rounded-xl shadow-md p-4 mb-6 hover:shadow-lg transition"
						>
							{/* Airline Row */}
							<div className="flex items-center gap-3 mb-3">
								<img
									src={item.airline_logo || first.airline_logo}
									alt="logo"
									className="w-10 h-10 object-contain"
								/>
								<div>
									<h2 className="text-xl font-semibold">
										{first.airline ?? "NA"}
									</h2>
									<p className="text-gray-600 text-sm">
										{item.flights.map(f => f.flight_number).join(", ")}
									</p>
								</div>
								<div className="ml-auto text-right">
									<p className="text-2xl font-bold">
										{price_estimation.currency} {item.price ?? "NA"}
									</p>
									<button className="mt-2 px-4 py-1 bg-gray-800 text-white rounded-md">
										View Prices
									</button>
								</div>
							</div>

							{/* Timeline Block */}
							<div className="grid grid-cols-3 items-center mt-4">
								{/* Departure */}
								<div>
									<p className="text-xl font-bold">{first.departure_airport.time}</p>
									<p className="text-gray-600">
										{first.departure_airport.name} ({first.departure_airport.id})
									</p>
								</div>

								{/* Duration + Stops */}
								<div className="text-center">
									<p className="text-gray-800 font-medium">
										{Math.floor(item.total_duration / 60)}h{" "}
										{item.total_duration % 60}m
									</p>

									{/* Horizontal Line + Stops */}
									<div className="flex items-center justify-center my-1">
										<div className="w-20 h-0.5 bg-gray-400"></div>
									</div>

									<p className="text-sm text-gray-800 font-semibold">{stopLabel}</p>

									{/* Layover Name */}
									{item.layovers?.length > 0 && (
										<p classn="text-xs text-gray-500 mt-1">
											via {item.layovers.map(l => l.name).join(", ")}
										</p>
									)}
								</div>

								{/* Arrival */}
								<div className="text-right">
									<p className="text-xl font-bold">{last.arrival_airport.time}</p>
									<p className="text-gray-600">
										{last.arrival_airport.name} ({last.arrival_airport.id})
									</p>
								</div>
							</div>

							{/* Refundability */}
							<div className="flex items-center gap-2">
								<p
									className={`mt-2 font-semibold ${item.refundable ? "text-green-700" : "text-red-700"
										}`}
								>
									{item.refundable ? "Partially Refundable" : "Non Refundable"}
								</p>

								{selectedHotelIndexes.has(idx) && (
									<span className="text-sm mt-2 p-1 pl-2 pr-2 bg-green-700 text-white rounded-md">
										Selected
									</span>
								)}
								
							</div>

						</div>
					);
				})}

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
