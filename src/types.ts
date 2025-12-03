export interface FlightOffer {
    source: 'amadeus' | 'serpapi';
    id: string;
    price: {
        currency: string;
        total: string;
    };
    itineraries: {
        duration: string;
        segments: {
            departure: {
                iataCode: string;
                at: string;
            };
            arrival: {
                iataCode: string;
                at: string;
            };
            carrierCode: string;
            number: string;
        }[];
    }[];
    airline: string; // Main carrier name
}

export interface SearchParams {
    origin: string;
    destination: string;
    departureDate: string;
    returnDate?: string;
    adults?: number;
    currency?: string;
    maxPrice?: number;
}
