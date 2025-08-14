# Design Scraper - Agent Guidelines

## Commands
- **Build/Run**: `npm run scrape` (main extraction), `npm run demo` (color demo), `npm run screenshots` (screenshot test)
- **Test**: No formal test suite - use demo scripts (`test-screenshots.js`) for testing individual extractors
- **Development**: Run individual extractors with `node src/index.js` or specific test files

## Architecture
- **Core**: Extractor pipeline system in `src/extractor.js` for modular data extraction
- **Browser**: Singleton browser manager (`src/browserManager.js`) using Puppeteer headless browser
- **Extractors**: Modular extractors in `src/` for colors, fonts, screenshots, themes, borders
- **Entry Points**: `src/index.js` (main), `src/generate.js` (pipeline runner), test files in root

## Code Style
- **Modules**: ES6 modules (`type: "module"` in package.json)
- **Imports**: Use `.js` extensions for relative imports (`./extractor.js`)
- **Classes**: PascalCase with JSDoc comments for methods and parameters
- **Functions**: camelCase with async/await pattern, proper error handling with try/catch
- **Exports**: Default exports for classes/singletons, named exports for utilities
- **Console**: Emoji prefixed logging (`🚀`, `✅`, `❌`) with descriptive messages
- **Error Handling**: Graceful degradation - extractors return `null` on failure, continue pipeline
