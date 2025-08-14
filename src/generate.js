import { getBorderProperties } from './borders.js';
import colors from './colors.js';
import Extractor from './extractor.js';
import { getFontUsage } from './fonts.js';
import theme from './theme.js';

// Wrapper functions to match the extractor pipeline interface
async function themeExtractor(page, url) {
    return await theme(url);
}

async function colorsExtractor(page, url) {
    return await colors(url);
}

async function fontsExtractor(page, url) {
    return await getFontUsage(url);
}

async function bordersExtractor(page, url) {
    return await getBorderProperties(url);
}

export async function main(url) {
    try {
        // Create extractor pipeline and add all extractors
        const extractor = new Extractor();
        extractor
            .add('theme', themeExtractor)
            .add('colors', colorsExtractor)
            .add('fonts', fontsExtractor)
            .add('borders', bordersExtractor);

        // Extract all data using the pipeline
        const results = await extractor.extract(url);

        return results;
    } catch (error) {
        // Error handling without logging
        throw error;
    }
}