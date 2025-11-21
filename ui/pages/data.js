let data = {
    itinerary: {
        trip_info: {
            title: "5-Day Enchanting Dubai Getaway from Delhi",
            description: "Embark on an unforgettable 5-day adventure to Dubai, exploring its futuristic marvels, rich cultural heritage, thrilling desert landscapes, and pristine beaches. This itinerary is designed for Indian travelers seeking a blend of luxury, adventure, and cultural immersion.",
            origin: "Delhi, India",
            destination: "Dubai, UAE",
            start_date: "2025-11-21",
            end_date: "2025-11-26",
            total_days: 5
        },
        itinerary: [
            {
                day: 1,
                date: "2025-11-21",
                title: "Arrival in Dubai & Leisure",
                activities: [
                    {
                        start_time: "21:30",
                        end_time: "23:59",
                        title: "Flight from Delhi to Dubai",
                        price: 47981,
                        markdown_text: "Depart from Indira Gandhi International Airport (DEL) on Emirates flight EK 515. Enjoy a comfortable direct flight to Dubai International Airport (DXB).\n\n**Suggested Flight:** Emirates (EK 515)\n*   **Departure:** Delhi (DEL) at 21:30\n*   **Arrival:** Dubai (DXB) at 23:59\n*   **Duration:** 3h 59m\n*   **Price (Round trip):** ₹47,981 (approx. $576)",
                    },
                    {
                        start_time: "00:30",
                        end_time: "02:00",
                        title: "Airport Transfer & Hotel Check-in",
                        price: 0,
                        markdown_text: "Upon arrival at DXB, clear immigration and customs. Take a taxi or pre-booked shuttle to your hotel. Check into the Grand Hyatt Dubai, settle in, and prepare for an exciting trip ahead.\n\n**Suggested Hotel:** Grand Hyatt Dubai\n*   **Description:** Sleek quarters in a plush 5-star hotel offering indoor & outdoor pools, 12 restaurants & bars, and excellent amenities.\n*   **Price (5 nights):** ₹138,378 (approx. $1660)\n*   **Rating:** 4.6/5 (15,711 reviews)"
                    }
                ]
            }
        ],
        price_estimation: {
            currency: "INR",
            approx_total_cost: 255759,
            breakdown: {
                flights: 47981,
                hotels: 138378,
                food: 24990,
                activities: 28322
            }
        },
        other_sections: [
            {
                title: "Visa Requirements for Indian Citizens",
                markdown_text: "Indian citizens generally require a visa to enter Dubai. Here are the key details:\n\n*   **Visa Types:** Common options include 14-day, 30-day (most preferred), 90-day, and multiple-entry tourist visas. A 96-hour transit visa is also available.\n*   **Visa on Arrival (VoA):** Available for Indian passport holders who possess a valid US visa, UK residence permit, or a visa/residence permit from Europe, Australia, Canada, Japan, New Zealand, Republic of Korea, or Singapore. This allows a 14-day visit at AED 100 (extendable once for AED 250).\n*   **General Requirements:** Valid passport (at least 6 months validity), recent passport-sized photograph, confirmed flight tickets, accommodation details, and potentially bank statements.\n*   **Application Methods:** Apply through airlines (Emirates, Etihad, Air India, IndiGO), online travel agencies (MakeMyTrip, Yatra), UAE-certified agents, or official UAE Immigration Portals (ICA/GDRFA).\n*   **Processing Time:** Regular visa takes 3-4 working days; express visa takes 24-48 hours (higher cost).\n*   **Fees (approximate):** 14-day visa: AED 250-300 (approx. ₹5,675 - ₹6,810). 30-day visa: AED 250-800.\n*   **Visa Validity & Extension:** Entry window is 58 days from issue date. Extensions are possible for 30, 60, or 90 days before visa expiration for AED 600.\n*   **Overstay Fine:** AED 50 per day."
            },
            {
                title: "Local Transportation in Dubai",
                markdown_text: "Dubai offers a modern and efficient public transportation system:\n\n*   **Dubai Metro:** An excellent way to get around, especially for major attractions like Burj Khalifa, The Dubai Mall, and Dubai Marina. It's clean, air-conditioned, and cost-effective. Purchase a Nol card for easy use.\n*   **Taxis:** Widely available, metered, and convenient. Can be hailed on the street or booked via apps.\n*   **Ride-sharing Apps:** Uber and Careem are popular and reliable options.\n*   **Abra Boats:** For a traditional experience, take an Abra across Dubai Creek between Bur Dubai and Deira."
            },
        ],
        flights: {
            query: {
                engine: "google_flights",
                flight_type: "round_trip",
                departure_id: "DEL",
                arrival_id: "DXB",
                outbound_date: "2025-11-21",
                api_key: "b32hbAGSxZ2XRmJKZ85xy2dr",
                return_date: "2025-11-26"
            },
            total_flights_found: 4,
            top_flights: [
                {
                    flights: [
                        {
                            departure_airport: {
                                name: "Indira Gandhi International Airport",
                                id: "DEL",
                                date: "2025-11-21",
                                time: "21:30"
                            },
                            arrival_airport: {
                                name: "Dubai International Airport",
                                id: "DXB",
                                date: "2025-11-21",
                                time: "23:59"
                            },
                            duration: 239,
                            airplane: "Boeing 777",
                            airline: "Emirates",
                            airline_logo: "https://www.gstatic.com/flights/airline_logos/70px/EK.png",
                            travel_class: "Economy",
                            flight_number: "EK 515",
                            extensions: [
                                "Power and USB outlets",
                                "On-demand video",
                                "Wi-Fi for fee",
                                "Seat type Above Average Legroom",
                                "Legroom 32 inches",
                                "Carbon emission: 187 kg"
                            ],
                            detected_extensions: {
                                has_power_and_usb_outlets: true,
                                has_on_demand_video: true,
                                wifi: "for fee",
                                seat_type: "Above Average Legroom",
                                legroom_short: "32 in",
                                legroom_long: "32 inches",
                                carbon_emission: 187
                            }
                        }
                    ],
                    total_duration: 239,
                    carbon_emissions: {
                        "this_flight": 188000,
                        "typical_for_this_route": 192000,
                        "difference_percent": -2,
                        "lowest_route": 256000
                    },
                    price: 576,
                    type: "Round trip",
                    extensions: [
                        "Bag and fare conditions depend on the return flight"
                    ],
                    airline_logo: "https://www.gstatic.com/flights/airline_logos/70px/EK.png",
                    departure_token: "WyJDalJJU1Y5M2JFVjBSMWxWV1RCQlEyMHlibmRDUnkwdExTMHRMUzB0TFhCcVluUmhNMEZCUVVGQlIydG5aR0ZKU2t4T1RGVkJFZ1ZGU3pVeE5Sb0xDTXpCQXhBQ0dnTlZVMFE0SEhETXdRTT0iLFtbIkRFTCIsIjIwMjUtMTEtMjEiLCJEWEIiLG51bGwsIkVLIiwiNTE1Il1dXQ=="
                },
            ]
        },
        hotels: [
            {
                type: "hotel",
                property_token: "ChYIjd6OnsPjnum9ARoJL20vMDViZnY4EAE",
                data_id: "0x3e5f5d46f88c69a3:0xbdd27b1c33c3af0d",
                name: "Grand Hyatt Dubai",
                link: "https://www.hyatt.com/grand-hyatt/en-US/dxbgh-grand-hyatt-dubai?src=corp_lclb_google_seo_dxbgh&utm_source=google&utm_medium=organic&utm_campaign=lmr",
                description: "Sleek quarters in a plush hotel offering indoor & outdoor pools, plus 12 restaurants & bars.",
                gps_coordinates: {
                    latitude: 25.2281408,
                    longitude: 55.3279029
                },
                city: "Dubai",
                country: "AE",
                check_in_time: "3:00PM",
                check_out_time: "12:00PM",
                price_per_night: {
                    price: "$332",
                    extracted_price: 332,
                    price_before_taxes: "$268",
                    extracted_price_before_taxes: 268
                },
                total_price: {
                    price: "$1,660",
                    extracted_price: 1660,
                    price_before_taxes: "$1,338",
                    extracted_price_before_taxes: 1338
                },
                deal: "29% less than usual",
                deal_description: "Great Deal",
                nearby_places: [
                    {
                        name: "Dubai Frame",
                        transportations: [
                            {
                                type: "Taxi",
                                duration: "7 min"
                            }
                        ]
                    },
                ],
                hotel_class: "5-star hotel",
                extracted_hotel_class: 5,
                rating: 4.6,
                reviews: 15711,
                reviews_histogram: {
                    5: 11822,
                    4: 2612,
                    3: 598,
                    2: 175,
                    1: 504
                },
                location_rating: 4.1,
                proximity_to_things_to_do_rating: 4.6,
                proximity_to_transit_rating: 3.9,
                airport_access_rating: 4.7,
                amenities: [
                    "Free Wi-Fi",
                    "Free parking",
                    "Pools",
                    "Hot tub",
                    "Air conditioning",
                    "Fitness center",
                    "Spa",
                    "Bar",
                    "Restaurant",
                    "Room service",
                    "Kitchen in some rooms",
                    "Full-service laundry",
                    "Accessible",
                    "Business center",
                    "Kid-friendly"
                ],
                images: [
                    {
                        thumbnail: "https://lh3.googleusercontent.com/p/AF1QipNKVlpTDrFcop172WNqFluxBUG96-8iyDgHnGIX=s287-w287-h192-n-k-no-v1",
                        original: "https://lh5.googleusercontent.com/p/AF1QipNKVlpTDrFcop172WNqFluxBUG96-8iyDgHnGIX=s10000"
                    },
                ]
            },
        ]
    }
}

export default data;