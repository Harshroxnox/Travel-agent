import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useContext } from 'react'
import { useNavigate } from "react-router";
import { AppContext } from "../context/AppContext";

const ItineraryApp = () => {
	const [bookingOptions, setBookingOptions] = useState({});
	const [loadingHotelIdx, setLoadingHotelIdx] = useState(null);

	const [flightBookingOptions, setFlightBookingOptions] = useState({});
	const [loadingFlightIdx, setLoadingFlightIdx] = useState(null);

	const { data } = useContext(AppContext);
	const navigate = useNavigate();
	const baseUrl = import.meta.env.VITE_BASE_URL;

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
	const { trip_info, itinerary, hotels, selected, misc_expenses, flight_params, currency, flights, other_sections } = data;


	const handleFlightBooking = async (flightItem, idx) => {
		try {
			setLoadingFlightIdx(idx);

			const payload = {
				engine: flight_params.engine,
				flight_type: flight_params.flight_type,
				currency: flight_params.currency,
				departure_id: flight_params.departure_id,
				arrival_id: flight_params.arrival_id,
				show_cheapest_flights: flight_params.show_cheapest_flights,
				outbound_date: flight_params.outbound_date,
				return_date: flight_params.return_date,
				departure_token: flightItem.departure_token // from selected flight
			};

			const res = await fetch(`${baseUrl}/api/flights_booking`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload)
			});

			const result = await res.json(); // { booking_options: [...] }

			setFlightBookingOptions(prev => ({
				...prev,
				[idx]: result.booking_options || []
			}));

		} catch (err) {
			console.error("Flight booking error:", err);
			alert("Failed to fetch flight booking options");
		} finally {
			setLoadingFlightIdx(null);
		}
	};


	const handleHotelBooking = async (hotel, idx) => {
		try {
			setLoadingHotelIdx(idx);

			let checkInDate = trip_info.start_date;
			let checkOutDate = trip_info.end_date;

			// Use selected hotel dates if selected
			const selectedHotel = selected.hotels.find(h => h.index === idx);
			if (selectedHotel) {
				checkInDate = selectedHotel.check_in_date;
				checkOutDate = selectedHotel.check_out_date;
			}

			const payload = {
				engine: "google_hotels_property",
				property_token: hotel.property_token,
				check_in_date: checkInDate,
				check_out_date: checkOutDate,
				currency: currency || "USD"
			};

			const res = await fetch(`${baseUrl}/api/hotels_booking`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload)
			});

			const result = await res.json(); 

			setBookingOptions(prev => ({
				...prev,
				[idx]: result
			}));

		} catch (err) {
			console.error("Booking fetch error:", err);
			alert("Failed to fetch booking options");
		} finally {
			setLoadingHotelIdx(null);
		}
	};

	const selectedHotelIndexes = new Set(
		selected.hotels.map(h => h.index)
	);

	const selectedFlightIndexes = new Set(
		selected.flights.map(f => f.index)
	);

	const formatPrice = (amount) => {
		const currency_safe = currency || '$';
		const price = (typeof amount === 'number') ? amount : 0;
		return `${currency_safe} ${price.toLocaleString()}`;
	};

	// NOTE: This detailedHotels and detailedFlights can be reduced and needs to be optimized
	// but for now this is fine
	// Calculate and gather hotels data
	let totalHotelsCost = 0;
	const detailedHotels = selected.hotels.map(sel => {
		const hotel = hotels[sel.index];
		// Safely extract price, default to 0 if not found
		const pricePerNight = hotel.price_per_night?.extracted_price || 0;
		const totalCost = sel.days * pricePerNight;
		totalHotelsCost += totalCost; // Sum the total cost

		return {
			name: hotel.name,
			days: sel.days,
			price_per_night: pricePerNight,
			total_cost: totalCost
		};
	});

	// Calculate and gather flights data
	let totalFlightsCost = 0;
	const detailedFlights = selected.flights.map(sel => {
		const flightOption = flights[sel.index];
		const price = flightOption.price || 0; // Total price for this option
		totalFlightsCost += price; // Sum the total cost

		// Extract detailed info for display
		const primarySegment = flightOption.flights[0];

		return {
			airline: primarySegment.airline,
			flight_number: primarySegment.flight_number,
			route: `${primarySegment.departure_airport.id} → ${primarySegment.arrival_airport.id}`,
			type: flightOption.type,
			price: price
		};
	});

	// Calculate food and activities from itinerary
	let totalFoodCost = 0;
	let totalActivitiesCost = 0;

	itinerary.forEach(day => {
		day.activities.forEach(activity => {
			const price = activity.price || 0; // Get the price for the activity
			const type = activity.type; // Get the type

			if (type === 'food') {
				totalFoodCost += price;
			} else if (type === 'activity') {
				totalActivitiesCost += price;
			}
			// Note: 'flight' and 'hotel' types are handled in steps 1 and 2
		});
	});

	// Calculate Misc Expenses
	let miscPrices = 0;
	misc_expenses.forEach(expense => {
		miscPrices = miscPrices + expense.price;
	})

	// Calculate Overall Total Cost
	const calculatedApproxTotalCost =
		totalHotelsCost +
		totalFlightsCost +
		totalFoodCost +
		totalActivitiesCost +
		miscPrices;


	return (
		<div className="p-6 max-w-5xl mx-auto space-y-10">
{/* 
					This Itinerary rendering page is divided into 5 sections namely 
					1. Itinerary
					2. Price Estimation
					3. Hotels
					4. Flights
					5. Additional Sections
*/}
			
{/* ------------------------------------------------------Itinerary------------------------------------------------------ */}
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


{/* ------------------------------------------------------Price-Estimation------------------------------------------------------ */}
			<section>
				<h1 className="text-3xl font-bold mb-4">Price Estimation</h1>
				<div className="p-5 mb-8 border rounded-2xl shadow-md hover:shadow-lg transition-all">

					{/* Total Estimated Cost */}
					<p className="text-2xl font-extrabold text-blue-900 mb-6">
						Total Calculated Cost: {formatPrice(calculatedApproxTotalCost)}
					</p>

					{/* Detailed Breakdown */}
					<p className="font-semibold text-xl mb-3 border-b pb-2">Detailed Breakdown for 1 Person</p>

					{/* Flights Detail */}
					<div className="mb-4">
						<h2 className="text-lg font-bold text-blue-700 mb-2">
							✈️ Flights Total: {formatPrice(totalFlightsCost)}
						</h2>
						<ul className="space-y-3 pl-4">
							{detailedFlights.map((flight, index) => (
								<li key={index} className="p-3 bg-blue-50 rounded-lg shadow-sm">
									<p className="font-medium">
										{flight.airline} ({flight.flight_number})
									</p>
									<p className="text-sm text-gray-600 ml-1">
										<span className="font-semibold">Route:</span> {flight.route} |
										<span className="font-semibold ml-2">Type:</span> {flight.type}
									</p>
									<p className="text-right font-bold text-lg text-blue-800">
										Price: {formatPrice(flight.price)}
									</p>
								</li>
							))}
						</ul>
					</div>

					{/* Hotels Detail */}
					<div className="mb-3">
						<h2 className="text-lg font-bold text-green-700 mb-2">
							🏨 Hotels Total: {formatPrice(totalHotelsCost)}
						</h2>
						<ul className="space-y-3 pl-4">
							{detailedHotels.map((hotel, index) => (
								<li key={index} className="p-3 bg-green-50 rounded-lg shadow-sm">
									<p className="font-medium text-green-800">
										{hotel.name}
									</p>
									<p className="text-sm text-gray-600 ml-1">
										<span className="font-semibold">{hotel.days} days</span>
										× {formatPrice(hotel.price_per_night)} per night
									</p>
									<p className="text-right font-bold text-lg text-green-800">
										Total: {formatPrice(hotel.total_cost)}
									</p>
								</li>
							))}
						</ul>
					</div>

					{/* Other Breakdown Items */}
					<div className="mt-3 pt-2 border-t">
						<h2 className="text-lg font-bold mb-1">💸 Estimated Costs</h2>
						<ul className="space-y-1">
							<li className="flex justify-between p-1">
								<span className="font-medium text-gray-700">🍔 Food Total:</span>
								<span className="text-gray-900 font-semibold">
									{formatPrice(totalFoodCost)}
								</span>
							</li>
							<li className="flex justify-between p-1">
								<span className="font-medium text-gray-700">🎟️ Activities Total:</span>
								<span className="text-gray-900 font-semibold">
									{formatPrice(totalActivitiesCost)}
								</span>
							</li>
						</ul>
					</div>

					{/* Miscellaneous Expenses */}
					<div className="mt-3 pt-2 border-t">
						<h2 className="text-lg font-bold mb-1">💸 Miscellaneous Expenses</h2>
						<ul className="space-y-1">
							{misc_expenses.map(expense => (
								<li className="flex justify-between p-1">
									<span className="font-medium text-gray-700">{expense.name}</span>
									<span className="text-gray-900 font-semibold">
										{formatPrice(expense.price)}
									</span>
								</li>
							))}
						</ul>
					</div>

				</div>
			</section>


{/* ---------------------------------------------------------Hotels------------------------------------------------------ */}
			<section>
				<h1 className="text-3xl font-bold mb-4">Hotels</h1>

				{hotels.map((hotel, idx) => (
					<div
						key={idx}
						className="p-5 mb-8 border rounded-2xl shadow-md hover:shadow-lg transition-all"
					>

						{/* Hotel Content */}
						<div className="space-y-2">

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

								<button
									onClick={() => handleHotelBooking(hotel, idx)}
									className="mt-2 px-4 py-1 bg-blue-900 cursor-pointer text-white rounded-md"
									disabled={loadingHotelIdx === idx}
								>
									{loadingHotelIdx === idx ? "Fetching..." : "Book Now"}
								</button>
							</div>

							{/* Booking Options */}
							{bookingOptions[idx]?.length > 0 && (
								<div className="mt-5 border-t pt-4 space-y-4">
									<h3 className="text-lg font-bold text-blue-900">
										Available Booking Options
									</h3>

									{bookingOptions[idx].map((provider, pIdx) => (
										<div
											key={pIdx}
											className="border rounded-xl p-4 bg-blue-50 shadow-sm"
										>
											{/* Provider Row */}
											<div className="flex items-center justify-between mb-2">
												<div className="flex items-center gap-3">
													<img
														src={provider.logo}
														alt={provider.source}
														className="h-8 object-contain"
													/>
													<span className="font-semibold">{provider.source}</span>
												</div>

												<span className="text-sm font-bold text-green-800">
													Total: {provider.total_price?.price}
												</span>
											</div>

											{/* Rooms */}
											<div className="space-y-3 mt-3">
												{provider.rooms?.map((room, rIdx) => (
													<div
														key={rIdx}
														className="flex items-center justify-between bg-white p-3 rounded-lg shadow"
													>
														<div>
															<p className="font-medium">{room.name}</p>
															<p className="text-sm text-gray-600">
																{room.price_per_night?.price} per night
															</p>
															<p className="text-sm text-green-700 font-semibold">
																Total: {room.total_price?.price}
															</p>
														</div>

														<button
															onClick={() => window.open(room.link, "_blank")}
															className="px-4 py-1 bg-green-700 text-white rounded-md hover:bg-green-800"
														>
															Book Room
														</button>
													</div>
												))}
											</div>
										</div>
									))}
								</div>
							)}

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


{/* ---------------------------------------------------------Flights------------------------------------------------------ */}
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
										{formatPrice(item.price)}
									</p>
									<button
										onClick={() => handleFlightBooking(item, idx)}
										disabled={loadingFlightIdx === idx}
										className="mt-2 px-4 py-1 bg-blue-800 text-white rounded-md hover:bg-blue-900"
									>
										{loadingFlightIdx === idx ? "Fetching..." : "Book Now"}
									</button>
								</div>
							</div>

							{/* Flight Booking Options */}
							{flightBookingOptions[idx]?.length > 0 && (
								<div className="mt-5 border-t pt-4 space-y-4">
									<h3 className="text-lg font-bold text-blue-900">
										Available Booking Options
									</h3>

									{flightBookingOptions[idx].map((opt, oIdx) => (
										<div
											key={oIdx}
											className="border rounded-xl p-4 bg-blue-50 shadow-sm space-y-2"
										>
											{/* Airline + Price */}
											<div className="flex items-center justify-between">
												<div className="flex items-center gap-2">
													{opt.airline_logos?.map((logo, i) => (
														<img key={i} src={logo} alt="logo" className="h-6" />
													))}
													<span className="font-semibold">{opt.book_with}</span>
												</div>

												<span className="font-bold text-green-800">
													{formatPrice(opt.price)}
												</span>
											</div>

											{/* Flight Numbers */}
											<p className="text-sm text-gray-700">
												{opt.flight_numbers?.join(" , ")}
											</p>

											{/* Extensions */}
											{opt.extensions?.length > 0 && (
												<ul className="text-xs text-gray-600 list-disc ml-4">
													{opt.extensions.map((e, i) => (
														<li key={i}>{e}</li>
													))}
												</ul>
											)}

											{/* Baggage */}
											{opt.baggage_prices?.length > 0 && (
												<p className="text-xs text-gray-700">
													🎒 {opt.baggage_prices.join(" | ")}
												</p>
											)}

											{/* Book Flight Button */}
											{opt.booking_request && (
												<button
													onClick={() => {
														const formHtml = `
															<html>
																<body onload="document.forms[0].submit()">
																	<form method="POST" action="${opt.booking_request.url}">
																		<input type="hidden" name="u" value="${opt.booking_request.post_data.replace(
																			/^u=/,
																			""
																		)}">
																	</form>
																</body>
															</html>
														`;
														const newTab = window.open("", "_blank");
														newTab.document.write(formHtml);
														newTab.document.close();
													}}
													className="mt-2 px-4 py-1 bg-green-700 text-white rounded-md hover:bg-green-800"
												>
													Book This Flight
												</button>
											)}

											{/* 📞 Phone Booking Fallback */}
											{opt.booking_phone && (
												<p className="text-sm text-gray-800 mt-2">
													📞 Book via Phone: {opt.booking_phone}
													{opt.estimated_phone_service_fee && (
														<span className="ml-2 text-xs text-gray-500">
															(+{formatPrice(opt.estimated_phone_service_fee)} service fee)
														</span>
													)}
												</p>
											)}
										</div>
									))}
								</div>
							)}

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
										<p className="text-xs text-gray-500 mt-1">
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

								{selectedFlightIndexes.has(idx) && (
									<span className="text-sm mt-2 p-1 pl-2 pr-2 bg-green-700 text-white rounded-md">
										Selected
									</span>
								)}
							</div>
						</div>
					);
				})}
			</section>


{/* ---------------------------------------------------------Other-Sections------------------------------------------------------ */}
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
