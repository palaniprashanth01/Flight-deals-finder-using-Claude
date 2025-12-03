import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import dotenv from 'dotenv';
import { AmadeusClient } from './amadeus-client.js';
import { SerpApiClient } from './serpapi-client.js';
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

