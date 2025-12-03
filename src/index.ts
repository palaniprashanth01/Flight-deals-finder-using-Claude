import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import dotenv from 'dotenv';
import { AmadeusClient } from './amadeus-client.js';
import { SerpApiClient } from './serpapi-client.js';
import { RazorpayClient } from './razorpay-client.js';
import { SearchParams } from './types.js';

dotenv.config();

const AMADEUS_CLIENT_ID = process.env.AMADEUS_CLIENT_ID;
const AMADEUS_CLIENT_SECRET = process.env.AMADEUS_CLIENT_SECRET;
const SERPAPI_API_KEY = process.env.SERPAPI_API_KEY;

const amadeusClient = (AMADEUS_CLIENT_ID && AMADEUS_CLIENT_SECRET)
    ? new AmadeusClient(AMADEUS_CLIENT_ID, AMADEUS_CLIENT_SECRET)
    : null;

const serpApiClient = SERPAPI_API_KEY
    ? new SerpApiClient(SERPAPI_API_KEY)
    : null;

const razorpayClient = new RazorpayClient();

const server = new Server(
    {
        name: "flight-deals-finder",
        version: "1.0.0",
    },
    {
        capabilities: {
            tools: {},
        },
    }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "search_flights",
                description: "Search for flight deals using Amadeus and/or SerpApi (Google Flights). Returns a list of flight offers.",
                inputSchema: {
                    type: "object",
                    properties: {
                        origin: {
                            type: "string",
                            description: "IATA code of the origin airport (e.g., 'LHR')",
                        },
                        destination: {
                            type: "string",
                            description: "IATA code of the destination airport (e.g., 'JFK')",
                        },
                        departureDate: {
                            type: "string",
                            description: "Departure date in YYYY-MM-DD format",
                        },
                        returnDate: {
                            type: "string",
                            description: "Return date in YYYY-MM-DD format (optional)",
                        },
                        adults: {
                            type: "number",
                            description: "Number of adult passengers (default 1)",
                        },
                        currency: {
                            type: "string",
                            description: "Currency code (default INR)",
                        },
                        maxPrice: {
                            type: "number",
                            description: "Maximum price filter",
                        },
                        provider: {
                            type: "string",
                            enum: ["amadeus", "serpapi", "both"],
                            description: "Specific provider to use (default 'both' if available)",
                        },
                    },
                    required: ["origin", "destination", "departureDate"],
                },
            },
            {
                name: "get_price_alerts",
                description: "Get simulated price alerts for a route.",
                inputSchema: {
                    type: "object",
                    properties: {
                        origin: { type: "string" },
                        destination: { type: "string" },
                    },
                    required: ["origin", "destination"],
                },
            },
            {
                name: "create_payment_link",
                description: "Create a payment link for a flight booking. Default user details: Name: Palani Prashanth B, Email: palaniprashanth2001@gmail.com, Contact: 7397571872. MANDATORY PREREQUISITE: You MUST have already called `get_seat_map` and shown the seats to the user. Do NOT call this tool if you haven't shown the seat map. Also, ask 'Do you want to use your default details?' BEFORE calling this tool.",
                inputSchema: {
                    type: "object",
                    properties: {
                        amount: { type: "number", description: "Amount in major currency unit (e.g., 100 for 100 INR)" },
                        currency: { type: "string", description: "Currency code (e.g., INR)" },
                        description: { type: "string", description: "Description of the payment" },
                        name: { type: "string", description: "Customer name (Default: Palani Prashanth B)" },
                        email: { type: "string", description: "Customer email (Default: palaniprashanth2001@gmail.com)" },
                        contact: { type: "string", description: "Customer contact number (Default: 7397571872)" },
                    },
                    required: ["amount", "currency", "description", "name", "email", "contact"],
                },
            },
            {
                name: "get_seat_map",
                description: "MANDATORY: Call this tool to retrieve and display the actual seat map. Do NOT ask for generic preferences (window/aisle) without showing the map first. IMPORTANT: If this tool returns 'Seat map not available', tell the user exactly that. Do NOT make up seat numbers (like 12A, 12B) if you don't see them in the tool output.",
                inputSchema: {
                    type: "object",
                    properties: {
                        flightOffer: {
                            type: "string",
                            description: "The full flight offer object as a JSON string (returned from search_flights)",
                        },
                    },
                    required: ["flightOffer"],
                },
            },
        ],
    };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
    switch (request.params.name) {
        case "search_flights": {
            const { origin, destination, departureDate, returnDate, adults, currency, maxPrice, provider } = request.params.arguments as any;
            const params: SearchParams = { origin, destination, departureDate, returnDate, adults, currency: currency || 'INR', maxPrice };

            let results: any[] = [];
            const errors: string[] = [];

            const useAmadeus = (provider === 'amadeus' || provider === 'both' || !provider) && amadeusClient;
            const useSerpApi = (provider === 'serpapi' || provider === 'both' || !provider) && serpApiClient;

            if (!useAmadeus && !useSerpApi) {
                return {
                    content: [{ type: "text", text: "No active flight providers configured. Please set API credentials." }],
                    isError: true,
                };
            }

            if (useAmadeus) {
                try {
                    const amadeusResults = await amadeusClient!.searchFlights(params);
                    results = [...results, ...amadeusResults];
                } catch (e: any) {
                    errors.push(`Amadeus Error: ${e.message}`);
                }
            }

            if (useSerpApi) {
                try {
                    const serpApiResults = await serpApiClient!.searchFlights(params);
                    results = [...results, ...serpApiResults];
                } catch (e: any) {
                    errors.push(`SerpApi Error: ${e.message}`);
                }
            }

            if (results.length === 0 && errors.length > 0) {
                return {
                    content: [{ type: "text", text: `Search failed:\n${errors.join('\n')}` }],
                    isError: true,
                };
            }

            return {
                content: [{ type: "text", text: JSON.stringify(results, null, 2) }],
            };
        }

        case "get_price_alerts": {
            // Mock implementation
            return {
                content: [{
                    type: "text",
                    text: JSON.stringify({
                        message: "Price alert subscription created (Simulated)",
                        route: `${request.params.arguments?.origin} -> ${request.params.arguments?.destination}`,
                        status: "active"
                    }, null, 2)
                }],
            };
        }



        case "create_payment_link": {
            const { amount, currency, description, name, email, contact } = request.params.arguments as any;
            try {
                const paymentLink = await razorpayClient.createPaymentLink(amount, currency, description, { name, email, contact });
                return {
                    content: [{ type: "text", text: JSON.stringify(paymentLink, null, 2) }],
                };
            } catch (error: any) {
                return {
                    content: [{ type: "text", text: `Error creating payment link: ${error.message}` }],
                    isError: true,
                };
            }
        }

        case "get_seat_map": {
            const { flightOffer } = request.params.arguments as any;
            try {
                const offerObj = JSON.parse(flightOffer);
                if (!amadeusClient) {
                    return {
                        content: [{ type: "text", text: "Amadeus client not initialized." }],
                        isError: true,
                    };
                }
                const seatMap = await amadeusClient.getSeatMap(offerObj);
                return {
                    content: [{ type: "text", text: JSON.stringify(seatMap, null, 2) }],
                };
            } catch (error: any) {
                return {
                    content: [{ type: "text", text: `SYSTEM_ALERT: SEAT_MAP_UNAVAILABLE. STOP. DO NOT GENERATE A LIST OF SEATS. YOU MUST TELL THE USER: "Real-time seat map is not available for this flight." (Error: ${error.message}). Ask the user for their preference (Window/Aisle) instead.` }],
                    isError: true,
                };
            }
        }

        default:
            throw new Error("Unknown tool");
    }
});

const transport = new StdioServerTransport();

async function run() {
    await server.connect(transport);
    console.error("Flight Deals Finder MCP Server running on stdio");
}

run().catch((error) => {
    console.error("Server error:", error);
    process.exit(1);
});

