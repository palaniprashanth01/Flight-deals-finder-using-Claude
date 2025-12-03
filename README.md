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
To use this server with Claude Desktop, add the following configuration to your `claude_desktop_config.json`:

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
*Note: Replace `/absolute/path/to/` with the actual path to your project directory.*

### Integration with Streamlit
If you are building a Streamlit application to interact with this server:
1.  Ensure this MCP server is running or accessible via a command execution.
2.  Use an MCP client library in your Streamlit Python code to connect to this server.
3.  Call the exposed tools (`search_flights`, etc.) from your Streamlit app logic.

## ⚠️ What NOT To Do
- **Do NOT commit your `.env` file** to version control. It contains sensitive API keys.
- **Do NOT share your API keys** publicly.
- **Do NOT modify files in the `build` directory** directly. Always modify the TypeScript source in `src` and run `npm run build`.

## Future Plans
- Add more flight search providers.
- Implement flight booking capabilities.
- Enhance error handling and rate limiting.
