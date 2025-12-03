# Flight Deals Finder MCP Server

## Project Overview
Flight Deals Finder is a Model Context Protocol (MCP) server that provides flight search capabilities using the Amadeus API and Google Flights (via SerpAPI). It is designed to be used with AI assistants like Claude to help users find the best flight deals.

## Features
- **Flight Search**: Search for flights using the Amadeus API.
- **Google Flights Integration**: Fetch flight data from Google Flights using SerpAPI.
- **MCP Compliant**: Fully compatible with the Model Context Protocol.

## Installation

1.  **Clone the repository** (if you haven't already):
    ```bash
    git clone <repository-url>
    cd flight-deals-finder
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Environment Setup**:
    Create a `.env` file in the root directory with your API keys:
    ```env
    AMADEUS_CLIENT_ID=your_amadeus_client_id
    AMADEUS_CLIENT_SECRET=your_amadeus_client_secret
    SERPAPI_API_KEY=your_serpapi_key
    ```

4.  **Build the project**:
    ```bash
    npm run build
    ```

## Usage

### Running the Server
To start the MCP server locally:
```bash
npm start
```

### Using with Claude Desktop
To use this server with Claude Desktop, follow these steps:

1.  Open Claude Desktop.
2.  Go to **Settings** -> **Developer**.
3.  Click on **Edit Config**. This will open the `claude_desktop_config.json` file in your default text editor.
4.  Paste the following configuration into the file:

```json
{
  "mcpServers": {
    "flight-deals-finder": {
      "command": "node",
      "args": [
        "/absolute/path/to/flight-deals-finder/build/index.js"
      ],
      "env": {
        "AMADEUS_CLIENT_ID": "your_amadeus_client_id",
        "AMADEUS_CLIENT_SECRET": "your_amadeus_client_secret",
        "SERPAPI_API_KEY": "your_serpapi_key"
      }
    }
  }
}
```
*Note: Replace `/absolute/path/to/` with the actual absolute path to your project directory.*

5.  Save the file.
6.  **Restart Claude Desktop fully** (quit the application and open it again).
7.  Start asking questions in Claude!

### Integration with Streamlit
If you are building a Streamlit application to interact with this server:
1.  Ensure this MCP server is running or accessible via a command execution.
2.  Use an MCP client library in your Streamlit Python code to connect to this server.
3.  Call the exposed tools (`search_flights`, etc.) from your Streamlit app logic.

## ⚠️ What NOT To Do
- **Do NOT commit your `.env` file** to version control. It contains sensitive API keys.
- **Do NOT share your API keys** publicly.
- **Do NOT modify files in the `build` directory** directly. Always modify the TypeScript source in `src` and run `npm run build`.

- Enhance error handling and rate limiting.

## Recommended Agent Instructions
Copy and paste the following instructions into your AI assistant (e.g., Claude) to enable the full booking workflow:

```text
You are a Flight Booking Assistant. Follow this step-by-step workflow for every user request:

1.  **Search & Sort**:
    - Use `search_flights` to find flights.
    - ALWAYS sort the results by price (cheapest first) before presenting them to the user.
    - If multiple providers (Amadeus/SerpApi) return results, compare them and recommend the best option.

2.  **Selection**:
    - Ask the user to select a specific flight from the list.

3.  **Seat Selection**:
    - **MANDATORY**: Once a flight is selected, you MUST use `get_seat_map` (passing the full flight offer JSON) to show available seats.
    - Do NOT ask "window or aisle?" before showing the map. Show the map first.

4.  **Payment**:
    - **PREREQUISITE**: You MUST have completed Step 3 (Seat Selection). Do NOT skip to payment without showing the seat map.
    - After seat selection, proceed to payment.
    - **CRITICAL**: You MUST explicitly ask: "Do you want to use your default details (Palani Prashanth B) or provide new ones?"
    - WAIT for the user's answer.
    - Only then call `create_payment_link`.
    - Generate the link and present it to the user.

## Negative Constraints
- **NEVER** invent seat numbers. If the tool says "Seat map not available", do **NOT** output a list like "12A - Window, 12B - Middle". This is strictly forbidden.
- **NEVER** assume the user wants to use default payment details without asking.
```

## Important Notes for Users
- **Free Claude Usage**: If you are using the free version of Claude, please be aware that there are daily message limits. Use the tool efficiently.
- **Default User Details**: The system is configured with default details for **Palani Prashanth B** (Email: palaniprashanth2001@gmail.com, Contact: 7397571872). You can ask the AI to use these defaults for faster booking.
- **Razorpay Test Mode**: The current integration uses Razorpay **Test Mode**. Payments will not process real money. To accept real payments, you must complete KYC verification with Razorpay and switch to Live Mode keys.
