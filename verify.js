import { AmadeusClient } from './build/amadeus-client.js';
import { SerpApiClient } from './build/serpapi-client.js';
import dotenv from 'dotenv';

dotenv.config();

const AMADEUS_ID = process.env.AMADEUS_CLIENT_ID;
const AMADEUS_SECRET = process.env.AMADEUS_CLIENT_SECRET;
const SERPAPI_KEY = process.env.SERPAPI_API_KEY;

async function test() {
    console.log('--- Testing Flight Deals Finder Components (Built) ---');

    // Test Amadeus Client
    try {
        if (!AMADEUS_ID || !AMADEUS_SECRET) {
            console.warn('⚠️ Amadeus credentials missing');
        } else {
            const amadeus = new AmadeusClient(AMADEUS_ID, AMADEUS_SECRET);
            console.log('✅ Amadeus Client initialized');
            // Optional: Perform a real search if you want, but initialization is a good start
        }
    } catch (e) {
        console.error('❌ Amadeus Client initialization failed', e);
    }

    // Test SerpApi Client
    try {
        if (!SERPAPI_KEY) {
            console.warn('⚠️ SerpApi key missing');
        } else {
            const serpApi = new SerpApiClient(SERPAPI_KEY);
            console.log('✅ SerpApi Client initialized');

            console.log('Searching for flights LHR -> JFK (2025-12-25)...');
            const results = await serpApi.searchFlights({
                origin: 'LHR',
                destination: 'JFK',
                departureDate: '2025-12-25'
            });
            console.log(`✅ SerpApi Search returned ${results.length} results`);
            if (results.length > 0) {
                console.log('Sample offer:', JSON.stringify(results[0], null, 2));
            }
        }
    } catch (e) {
        console.error('❌ SerpApi Search failed', e);
    }
}

test();
