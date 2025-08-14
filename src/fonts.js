import browserManager from './browserManager.js';

class FontAnalyzer {
  constructor() {
    this.page = null;
  }

  async init() {
    this.page = await browserManager.newPage();
  }

  async close() {
    if (this.page) {
      await this.page.close();
    }
  }

  // Parse font-family string into individual fonts
  parseFontFamily(fontFamily) {
    if (!fontFamily || fontFamily === 'inherit' || fontFamily === 'initial') {
      return [];
    }

    // Split by comma and clean up each font name
    return fontFamily
      .split(',')
      .map(font => font.trim().replace(/['"]/g, ''))
      .filter(font => font.length > 0);
  }

  // Categorize font types
  categorizeFontType(fontName) {
    const serifFonts = [
      'times', 'times new roman', 'georgia', 'garamond', 'baskerville',
      'minion', 'caslon', 'palatino', 'book antiqua', 'serif'
    ];
    
    const sansSerifFonts = [
      'arial', 'helvetica', 'verdana', 'tahoma', 'trebuchet ms', 'geneva',
      'lucida grande', 'lucida sans unicode', 'ms sans serif', 'sans-serif',
      'roboto', 'open sans', 'lato', 'montserrat', 'source sans pro',
      'ubuntu', 'nunito', 'poppins', 'inter', 'system-ui'
    ];
    
    const monospaceFonts = [
      'courier', 'courier new', 'monaco', 'menlo', 'consolas',
      'lucida console', 'monospace', 'source code pro', 'fira code',
      'inconsolata', 'roboto mono'
    ];
    
    const cursiveFonts = [
      'comic sans ms', 'brush script mt', 'lucida handwriting',
      'cursive', 'dancing script', 'pacifico', 'great vibes'
    ];

    const fontLower = fontName.toLowerCase();
    
    if (serifFonts.some(serif => fontLower.includes(serif))) {
      return 'serif';
    } else if (sansSerifFonts.some(sans => fontLower.includes(sans))) {
      return 'sans-serif';
    } else if (monospaceFonts.some(mono => fontLower.includes(mono))) {
      return 'monospace';
    } else if (cursiveFonts.some(cursive => fontLower.includes(cursive))) {
      return 'cursive';
    } else if (fontLower.includes('fantasy')) {
      return 'fantasy';
    }
    
    return 'custom';
  }

  // Check if font is a web font (Google Fonts, custom, etc.)
  isWebFont(fontName) {
    const systemFonts = [
      'arial', 'helvetica', 'times', 'times new roman', 'courier',
      'courier new', 'verdana', 'georgia', 'palatino', 'garamond',
      'bookman', 'comic sans ms', 'trebuchet ms', 'arial black',
      'impact', 'lucida sans unicode', 'tahoma', 'lucida console',
      'monaco', 'serif', 'sans-serif', 'monospace', 'cursive', 'fantasy'
    ];
    
    return !systemFonts.includes(fontName.toLowerCase());
  }

  // Extract fonts used on the website
  async extractFonts(url) {
    await this.page.goto(url, { waitUntil: 'networkidle2' });
    
    const fontData = await this.page.evaluate(() => {
      const fontUsage = new Map();
      const elements = document.querySelectorAll('*');
      
      // Define heading selectors
      const headingSelectors = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
      const bodySelectors = ['p', 'div', 'span', 'a', 'li', 'td', 'th', 'body'];
      
      elements.forEach(el => {
        const styles = window.getComputedStyle(el);
        const fontFamily = styles.fontFamily;
        const fontSize = styles.fontSize;
        const fontWeight = styles.fontWeight;
        const fontStyle = styles.fontStyle;
        
        if (fontFamily && fontFamily !== 'inherit') {
          const tagName = el.tagName.toLowerCase();
          const isHeading = headingSelectors.includes(tagName);
          const isBody = bodySelectors.includes(tagName) || 
                        (!headingSelectors.includes(tagName) && 
                         !['script', 'style', 'meta', 'link', 'title'].includes(tagName));
          
          const fontKey = `${fontFamily}|${fontSize}|${fontWeight}|${fontStyle}`;
          
          if (!fontUsage.has(fontKey)) {
            fontUsage.set(fontKey, {
              fontFamily,
              fontSize,
              fontWeight,
              fontStyle,
              headingCount: 0,
              bodyCount: 0,
              totalCount: 0,
              elements: []
            });
          }
          
          const usage = fontUsage.get(fontKey);
          usage.totalCount++;
          
          if (isHeading) {
            usage.headingCount++;
          } else if (isBody) {
            usage.bodyCount++;
          }
          
          // Store sample elements (limit to avoid memory issues)
          if (usage.elements.length < 5) {
            usage.elements.push({
              tagName,
              className: el.className,
              textContent: el.textContent?.substring(0, 100) || ''
            });
          }
        }
      });
      
      return Array.from(fontUsage.values());
    });
    
    return fontData;
  }

  // Get comprehensive font analysis
  async analyzeFonts(url) {
    try {
      await this.init();
      
      const fontData = await this.extractFonts(url);
      
      // Process and categorize fonts
      const processedFonts = fontData.map(font => {
        const fonts = this.parseFontFamily(font.fontFamily);
        const primaryFont = fonts[0] || 'unknown';
        
        return {
          ...font,
          fonts,
          primaryFont,
          fontType: this.categorizeFontType(primaryFont),
          isWebFont: this.isWebFont(primaryFont)
        };
      });
      
      // Sort by usage
      processedFonts.sort((a, b) => b.totalCount - a.totalCount);
      
      // Categorize by usage context
      const headingFonts = processedFonts
        .filter(font => font.headingCount > 0)
        .sort((a, b) => b.headingCount - a.headingCount);
      
      const bodyFonts = processedFonts
        .filter(font => font.bodyCount > 0)
        .sort((a, b) => b.bodyCount - a.bodyCount);
      
      // Get unique font families
      const uniqueFontFamilies = new Map();
      processedFonts.forEach(font => {
        const key = font.primaryFont.toLowerCase();
        if (!uniqueFontFamilies.has(key)) {
          uniqueFontFamilies.set(key, {
            name: font.primaryFont,
            fontType: font.fontType,
            isWebFont: font.isWebFont,
            totalUsage: font.totalCount,
            headingUsage: font.headingCount,
            bodyUsage: font.bodyCount,
            variants: []
          });
        }
        
        const family = uniqueFontFamilies.get(key);
        family.totalUsage += font.totalCount;
        family.headingUsage += font.headingCount;
        family.bodyUsage += font.bodyCount;
        
        family.variants.push({
          fontSize: font.fontSize,
          fontWeight: font.fontWeight,
          fontStyle: font.fontStyle,
          usage: font.totalCount
        });
      });
      
      const fontFamilies = Array.from(uniqueFontFamilies.values())
        .sort((a, b) => b.totalUsage - a.totalUsage);
      
      await this.close();
      
      return {
        headings: this.getTopFonts(headingFonts, 'heading'),
        body: this.getTopFonts(bodyFonts, 'body'),
        allFonts: fontFamilies,
        summary: this.generateSummary(fontFamilies)
      };
      
    } catch (error) {
      await this.close();
      throw error;
    }
  }

  // Get top fonts for a specific context
  getTopFonts(fonts, context) {
    const topFonts = fonts.slice(0, 5).map(font => ({
      fontFamily: font.primaryFont,
      fullFontFamily: font.fontFamily,
      fontSize: font.fontSize,
      fontWeight: font.fontWeight,
      fontStyle: font.fontStyle,
      fontType: font.fontType,
      isWebFont: font.isWebFont,
      usage: context === 'heading' ? font.headingCount : font.bodyCount,
      totalUsage: font.totalCount
    }));
    
    return topFonts;
  }

  // Generate font usage summary
  generateSummary(fontFamilies) {
    const totalFonts = fontFamilies.length;
    const webFonts = fontFamilies.filter(f => f.isWebFont).length;
    const systemFonts = totalFonts - webFonts;
    
    const typeDistribution = fontFamilies.reduce((acc, font) => {
      acc[font.fontType] = (acc[font.fontType] || 0) + 1;
      return acc;
    }, {});
    
    const primaryHeadingFont = fontFamilies
      .filter(f => f.headingUsage > 0)
      .sort((a, b) => b.headingUsage - a.headingUsage)[0];
    
    const primaryBodyFont = fontFamilies
      .filter(f => f.bodyUsage > 0)
      .sort((a, b) => b.bodyUsage - a.bodyUsage)[0];
    
    return {
      totalFontFamilies: totalFonts,
      webFonts,
      systemFonts,
      typeDistribution,
      primaryHeadingFont: primaryHeadingFont?.name || 'Not detected',
      primaryBodyFont: primaryBodyFont?.name || 'Not detected'
    };
  }

  // Display font analysis results
  displayFontAnalysis(analysis) {
    return analysis;
  }
}

// Main function to analyze fonts on a website
async function analyzeFonts(url) {
  const analyzer = new FontAnalyzer();
  
  try {
    const analysis = await analyzer.analyzeFonts(url);
    return analysis;
  } catch (error) {
    throw error;
  }
}

// Convenience function to get just heading and body fonts
async function getFontUsage(url) {
  const analyzer = new FontAnalyzer();
  
  try {
    const analysis = await analyzer.analyzeFonts(url);
    
    const result = {
      headings: analysis.headings.length > 0 ? analysis.headings[0].fontFamily : 'Not detected',
      body: analysis.body.length > 0 ? analysis.body[0].fontFamily : 'Not detected'
    };
    
    return result;
  } catch (error) {
    throw error;
  }
}

// Export for use
export { FontAnalyzer, analyzeFonts, getFontUsage };
