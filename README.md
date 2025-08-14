# Design Scraper MCP Server

An MCP (Model Context Protocol) server that analyzes websites and automatically generates comprehensive design systems and style guides. Simply provide a URL and get detailed design analysis including colors, typography, borders, themes, and visual elements.

## Features

🎨 **Comprehensive Design Analysis**

- **Color Extraction**: Automatically detects background and foreground colors
- **Typography Analysis**: Identifies heading and body font families
- **Border Properties**: Extracts border radius, width, and styling
- **Theme Detection**: Determines light/dark mode and overall theme
- **Visual Elements**: Analyzes buttons, headers, and interactive components

📸 **Visual Documentation**

- Full-page screenshot capture
- Visual reference for design system validation
- Responsive viewport analysis

🛠️ **Developer-Friendly Output**

- CSS custom properties generation
- Accessibility compliance checking (WCAG 2.1 AA)
- Interactive HTML style guide artifacts
- Copy-friendly code snippets

## Prerequisites

- Node.js v18.x or higher
- npm

## Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

## MCP Server Configuration

### Claude Desktop Configuration

To use this MCP server with Claude Desktop, add the following configuration to your Claude Desktop config file:

**Location of config file:**

- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

**Configuration:**

```json
{
  "mcpServers": {
    "design-scraper-mcp": {
      "command": "node",
      "args": ["/path/to/design-scraper-mcp/src/index.js"],
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

**If installed globally via npm:**

```json
{
  "mcpServers": {
    "design-scraper-mcp": {
      "command": "npx",
      "args": ["design-scraper-mcp"],
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

### Other MCP Clients

For other MCP-compatible clients, use these connection details:

**Stdio Transport:**

```bash
node /path/to/design-scraper-mcp/src/index.js
```

**Environment Variables:**

- `NODE_ENV`: Set to `production` for production use
- `DEBUG`: Set to `design-scraper-mcp:*` for debug logging

### Verification

After adding the configuration:

1. **Restart Claude Desktop** completely
2. **Look for the connection indicator** - you should see "design-scraper-mcp" in the MCP servers list
3. **Test the connection** by asking Claude to analyze a website:
   ```
   Can you analyze the design of https://example.com using the design scraper?
   ```

### Troubleshooting

**Server not connecting:**

- Verify the path to the script is correct
- Ensure Node.js is installed and accessible
- Check that all dependencies are installed (`npm install`)
- Restart Claude Desktop after configuration changes

**Permission issues:**

- Ensure the script has execute permissions
- On macOS/Linux: `chmod +x /path/to/design-scraper-mcp/src/index.js`

**Debug mode:**
Add debug environment variable to see detailed logs:

```json
{
  "mcpServers": {
    "design-scraper-mcp": {
      "command": "node",
      "args": ["/path/to/design-scraper-mcp/src/index.js"],
      "env": {
        "NODE_ENV": "production",
        "DEBUG": "design-scraper-mcp:*"
      }
    }
  }
}
```

## Usage

### As an MCP Server

Start the server:

```bash
npm start
```

The server provides two main tools:

#### 1. Design System Generator (`generate`)

Analyzes a website and creates a comprehensive style guide:

```javascript
// Example usage through MCP client
const result = await client.callTool({
  name: "generate",
  arguments: {
    url: "https://example.com",
  },
});
```

**Input Schema:**

- `url` (string, required): Valid URL to analyze

**Output includes:**

- Complete design system analysis with visual screenshot
- Color palette with background/foreground color extraction
- Typography hierarchy with heading and body font detection
- Visual design tokens (border radius, width, styling)
- Theme mode detection (light/dark/auto)
- Element-specific styling (buttons, headers, footers)
- Implementation guide with CSS custom properties
- Accessibility compliance checking

**Example Response Structure:**

```json
{
  "content": [
    {
      "type": "text",
      "text": "🎨 DESIGN SYSTEM GENERATOR\n\n📸 VISUAL REFERENCE\n- Full Page Screenshot Captured\n- Dimensions: 1920px x 1080px\n\nCreate a comprehensive website style guide HTML artifact...\n\n=== COMPLETE DESIGN DATA ===\n{\n  \"theme\": \"light\",\n  \"colors\": {\n    \"backgrounds\": [\"#ffffff\", \"#f8f9fa\"],\n    \"foregrounds\": [\"#212529\", \"#6c757d\"],\n    \"elements\": {\n      \"button\": [{\n        \"background\": \"#007bff\",\n        \"foreground\": \"#ffffff\",\n        \"score\": 5\n      }],\n      \"header\": {\n        \"background\": \"#ffffff\",\n        \"foreground\": \"#212529\"\n      }\n    }\n  },\n  \"fonts\": {\n    \"headings\": \"Inter\",\n    \"body\": \"system-ui\"\n  },\n  \"borders\": {\n    \"borderRadius\": \"8px\",\n    \"borderWidth\": \"1px\",\n    \"borderColor\": \"#dee2e6\"\n  }\n}"
    },
    {
      "type": "image",
      "data": "base64-encoded-screenshot",
      "mimeType": "image/png"
    }
  ]
}
```

#### 2. Website Screenshot (`screenshot`)

Captures full-page screenshots for visual reference:

```javascript
// Example usage through MCP client
const result = await client.callTool({
  name: "screenshot",
  arguments: {
    url: "https://example.com",
    viewportWidth: 1920, // optional, default: 1920
    viewportHeight: 1080, // optional, default: 1080
  },
});
```

**Input Schema:**

- `url` (string, required): Valid URL to capture
- `viewportWidth` (number, optional): Browser viewport width in pixels
- `viewportHeight` (number, optional): Browser viewport height in pixels

**Example Response:**

```json
{
  "content": [
    {
      "type": "image",
      "data": "base64-encoded-screenshot",
      "mimeType": "image/png"
    },
    {
      "type": "text",
      "text": "Screenshot details:\nURL: https://example.com\nWidth: 1920\nHeight: 1080\nSize: 245760 bytes"
    }
  ]
}
```

#### Individual Extractor APIs

**Color Extraction:**

```javascript
const colorData = await colors('https://example.com');
// Returns:
{
  backgrounds: ['#ffffff', '#f8f9fa'],
  foregrounds: ['#212529', '#6c757d'],
  elements: {
    button: [{ background: '#007bff', foreground: '#ffffff', score: 5 }],
    header: { background: '#ffffff', foreground: '#212529' },
    body: { background: '#ffffff', foreground: '#212529' },
    footer: { background: '#f8f9fa', foreground: '#6c757d' }
  }
}
```

**Font Analysis:**

```javascript
const fontData = await getFontUsage('https://example.com');
// Returns:
{
  headings: 'Inter',
  body: 'system-ui'
}
```

**Border Properties:**

```javascript
const borderData = await getBorderProperties('https://example.com');
// Returns:
{
  borderRadius: '8px',
  borderWidth: '1px',
  borderColor: '#dee2e6'
}
```

**Theme Detection:**

```javascript
const themeData = await theme("https://example.com");
// Returns: 'light' | 'dark'
```

**Screenshot Capture:**

```javascript
const screenshotData = await screenshots('https://example.com', {
  viewportWidth: 1920,
  viewportHeight: 1080
});
// Returns:
{
  screenshot: 'base64-encoded-image-data',
  dimensions: { width: 1920, height: 1080 },
  size: 245760
}
```

## Architecture

The project uses a modular extractor pipeline system with the following components:

### Core Components

- **`src/extractor.js`** - Core pipeline system for modular data extraction

  - Manages browser lifecycle and page navigation
  - Orchestrates sequential execution of extractors
  - Provides error handling and graceful degradation
  - Supports extractor chaining with `.add()` method

- **`src/browserManager.js`** - Singleton browser manager using Puppeteer

  - Handles browser initialization and cleanup
  - Manages page creation and navigation
  - Optimizes resource usage with singleton pattern

- **`src/generate.js`** - Main pipeline runner that orchestrates all extractors
  - Combines theme, colors, fonts, and borders extractors
  - Returns unified design system data structure
  - Entry point for complete design analysis

### Individual Extractors

- **`src/colors.js`** - Advanced color extraction and analysis

  - Extracts background and foreground colors from all elements
  - Analyzes button color combinations with scoring system
  - Identifies header, body, and footer color schemes
  - Converts all colors to consistent hex format
  - Filters out invalid/transparent color combinations

- **`src/fonts.js`** - Comprehensive typography detection and analysis

  - Analyzes font usage across heading and body elements
  - Categorizes fonts by type (serif, sans-serif, monospace, etc.)
  - Identifies web fonts vs system fonts
  - Provides usage statistics and font hierarchy
  - Extracts font weights, styles, and sizes

- **`src/borders.js`** - Border and visual element extraction

  - Analyzes border radius, width, and color properties
  - Tracks usage frequency across all elements
  - Identifies most common border patterns
  - Supports complex border-radius values
  - Converts colors to hex format for consistency

- **`src/theme.js`** - Intelligent theme mode detection

  - Analyzes background and text color brightness
  - Checks for dark theme CSS classes
  - Evaluates CSS `color-scheme` property
  - Considers user's `prefers-color-scheme` preference
  - Returns 'light' or 'dark' theme classification

- **`src/screenshots.js`** - Full-page screenshot capture
  - Captures complete page screenshots with custom viewport sizes
  - Returns base64-encoded image data
  - Provides image dimensions and file size metadata
  - Supports responsive viewport configuration

### Extractor Pipeline Usage

```javascript
import Extractor from "./src/extractor.js";

const extractor = new Extractor();
extractor
  .add("theme", themeExtractor)
  .add("colors", colorsExtractor)
  .add("fonts", fontsExtractor)
  .add("borders", bordersExtractor);

const results = await extractor.extract("https://example.com");
```

## Code Style Guidelines

- **ES6 Modules**: Uses `type: "module"` with `.js` extensions for imports
- **Async/Await**: Modern asynchronous patterns throughout
- **Error Handling**: Graceful degradation with proper try/catch blocks
- **Modular Design**: Each extractor is independent and reusable
- **JSDoc Comments**: Comprehensive documentation for methods and parameters
- **Consistent Naming**: PascalCase for classes, camelCase for functions
- **Color Normalization**: All colors converted to lowercase hex format

## Output Format Specification

The design system generator produces structured data:

### Complete Design System Structure

```javascript
{
  theme: 'light' | 'dark',
  colors: {
    backgrounds: ['#ffffff', '#f8f9fa'],
    foregrounds: ['#212529', '#6c757d'],
    elements: {
      button: [{ background: '#007bff', foreground: '#ffffff', score: 5 }],
      header: { background: '#ffffff', foreground: '#212529' },
      body: { background: '#ffffff', foreground: '#212529' },
      footer: { background: '#f8f9fa', foreground: '#6c757d' }
    }
  },
  fonts: {
    headings: 'Inter',
    body: 'system-ui'
  },
  borders: {
    borderRadius: '8px',
    borderWidth: '1px',
    borderColor: '#dee2e6'
  }
}
```

### Generated Style Guide Sections

1. **Color Palette** - Organized backgrounds, foregrounds, and element-specific colors with usage guidelines
2. **Typography System** - Font hierarchy with heading and body font specifications and examples
3. **Visual Design Tokens** - Border radius, spacing, and styling specifications with CSS custom properties
4. **Theme Specifications** - Light and dark mode color schemes with accessibility considerations
5. **Element Guidelines** - Button, header, body, footer color combinations with hover states
6. **Implementation Guide** - Ready-to-use CSS custom properties and code snippets
7. **Accessibility Report** - WCAG 2.1 AA compliance analysis with contrast ratios

## Performance Considerations

- **Browser Reuse**: Singleton browser manager reduces initialization overhead
- **Sequential Processing**: Extractors run sequentially to avoid resource conflicts
- **Memory Management**: Pages are properly closed after extraction
- **Error Isolation**: Failed extractors don't affect other pipeline components
- **Viewport Optimization**: Screenshots use efficient viewport sizing

## Testing

This project uses [Vitest](https://vitest.dev/) for unit testing with comprehensive test coverage.

### Running Tests

```bash
# Run tests in watch mode (development)
npm test

# Run tests once (CI/production)
npm run test:run

# Run tests with coverage report
npm run test:coverage
```

### Test Structure

Tests are located in the `test/` directory and follow the naming convention `*.test.js`. The test suite includes:

- **Unit Tests**: Individual extractor functions (color parsing, theme detection, etc.)
- **Integration Tests**: Full pipeline extraction workflows
- **Mock Tests**: Browser automation without actual network requests

### Coverage Reports

Coverage reports are generated in multiple formats:
- **Terminal**: Text summary displayed after test runs
- **HTML**: Interactive coverage report in `coverage/index.html`
- **LCOV**: Machine-readable format for CI integration

### GitHub Actions

Automated testing runs on every push and pull request:
- Tests against Node.js versions 18.x, 20.x, and 22.x
- Includes linting checks with Prettier
- Generates coverage reports
- Uploads coverage data to Codecov (optional)

## Dependencies

- **@modelcontextprotocol/sdk** (^1.17.2) - MCP server framework for tool registration
- **puppeteer** (^24.16.1) - Headless browser automation for web scraping and screenshots
- **chalk** (^5.5.0) - Terminal styling for colored console output
- **zod** (^3.25.76) - Schema validation for input parameters and type safety

### Development Dependencies

- **vitest** (^3.2.4) - Fast unit testing framework with native ES modules support
- **prettier** (^3.6.2) - Code formatting and style consistency

## Troubleshooting

### Common Issues

**Browser Launch Failures:**

- Ensure system has required dependencies for Puppeteer
- Check for sufficient memory and disk space
- Verify network connectivity for target URLs

**Color Extraction Issues:**

- Some websites may use CSS-in-JS or dynamic styling
- Transparent/inherited colors are filtered out automatically
- Complex CSS selectors may not capture all elements

**Font Detection Limitations:**

- Web fonts may not be detected if not fully loaded
- System font fallbacks are identified when possible
- Font variations (weights/styles) are captured separately

**Theme Detection Edge Cases:**

- Websites with mixed light/dark sections may be ambiguous
- CSS custom properties for theming may not be detected
- User preference detection requires browser support

## License

## License

MIT - See [LICENSE](LICENSE) file for details.
