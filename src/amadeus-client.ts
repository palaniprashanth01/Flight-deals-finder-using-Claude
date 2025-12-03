import Amadeus from 'amadeus';
import { FlightOffer, SearchParams } from './types.js';

export class AmadeusClient {
    private amadeus: any;

    constructor(clientId: string, clientSecret: string) {
        this.amadeus = new Amadeus({
            clientId,
            clientSecret,
        });
    }

    async searchFlights(params: SearchParams): Promise<FlightOffer[]> {
        try {
            const response = await this.amadeus.shopping.flightOffersSearch.get({
                originLocationCode: params.origin,
                destinationLocationCode: params.destination,
                departureDate: params.departureDate,
                returnDate: params.returnDate,
                adults: params.adults || 1,
                currencyCode: params.currency || 'INR',
                maxPrice: params.maxPrice,
            });

            return response.data.map((offer: any) => this.mapToFlightOffer(offer));
        } catch (error: any) {
            console.error('Amadeus API Error:', error.response?.result || error.message);
            return [];
        }
    }

    private mapToFlightOffer(offer: any): FlightOffer {
        return {
            source: 'amadeus',
            id: offer.id,
            price: {
                currency: offer.price.currency,
                total: offer.price.total,
            },
            itineraries: offer.itineraries.map((itinerary: any) => ({
                duration: itinerary.duration,
                segments: itinerary.segments.map((segment: any) => ({
                    departure: {
                        iataCode: segment.departure.iataCode,
                        at: segment.departure.at,
                    },
                    arrival: {
                        iataCode: segment.arrival.iataCode,
                        at: segment.arrival.at,
                    },
                    carrierCode: segment.carrierCode,
                    number: segment.number,
                })),
            })),
            airline: offer.validatingAirlineCodes[0],
        };
    }
    async getSeatMap(flightOffer: any): Promise<any> {
        try {
            const response = await this.amadeus.shopping.seatmaps.post({
                data: [flightOffer]
            });
            return response.data;
        } catch (error: any) {
            console.error('Amadeus SeatMap Error:', error.response?.result || error.message);
            // Throwing a specific error that index.ts will catch and format for the AI
            throw new Error('Seat map data unavailable from airline.');
        }
    }
}
