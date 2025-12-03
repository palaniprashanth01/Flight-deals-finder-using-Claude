import { getJson } from "serpapi";
import { FlightOffer, SearchParams } from './types.js';

export class SerpApiClient {
    private apiKey: string;

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    async searchFlights(params: SearchParams): Promise<FlightOffer[]> {
        try {
            // Mapping params to SerpApi Google Flights engine
            const queryParams = {
                engine: "google_flights",
                api_key: this.apiKey,
                departure_id: params.origin,
                arrival_id: params.destination,
                outbound_date: params.departureDate,
                return_date: params.returnDate,
                type: params.returnDate ? "1" : "2", // 1 = Round Trip, 2 = One Way
                currency: params.currency || "INR",
                adults: params.adults || 1,
                hl: "en", // Language
            };

            const response = await getJson(queryParams);

            if (!response.best_flights) {
                return [];
            }

            return response.best_flights.map((flight: any) => this.mapToFlightOffer(flight));
        } catch (error: any) {
            console.error('SerpApi Error:', error.message || error);
            return [];
        }
    }

    private mapToFlightOffer(flight: any): FlightOffer {
        // SerpApi structure varies, this is a best-effort mapping based on typical Google Flights response
        const firstLeg = flight.flights[0];

        return {
            source: 'serpapi',
            id: "serpapi_" + Math.random().toString(36).substr(2, 9), // SerpApi doesn't always give a unique ID per offer in the same way
            price: {
                currency: "INR", // SerpApi usually returns in requested currency
                total: flight.price?.toString() || "N/A",
            },
            itineraries: flight.flights.map((leg: any) => ({
                duration: leg.duration?.toString() || "N/A",
                segments: [{
                    departure: {
                        iataCode: leg.departure_airport?.id || "N/A",
                        at: leg.departure_airport?.time || "N/A"
                    },
                    arrival: {
                        iataCode: leg.arrival_airport?.id || "N/A",
                        at: leg.arrival_airport?.time || "N/A"
                    },
                    carrierCode: leg.airline || "N/A",
                    number: leg.flight_number || "N/A"
                }]
            })),
            airline: firstLeg.airline || "Unknown",
        };
    }
}
