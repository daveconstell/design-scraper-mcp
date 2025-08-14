import chalk from 'chalk';

class ColorPrinter {
  constructor() {
    this.colorCache = new Map();
  }

  // Convert hex to RGB values
  hexToRgb(hex) {
    if (!hex || !hex.startsWith('#')) return null;
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  // Get contrast color (black or white) for better text visibility
  getContrastColor(hex) {
    const rgb = this.hexToRgb(hex);
    if (!rgb) return '#000000';
    
    // Calculate luminance
    const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
    return luminance > 0.5 ? '#000000' : '#ffffff';
  }

  // Create a color swatch with text
  createColorSwatch(hex, label = '', width = 20) {
    if (!hex) return '';
    
    const rgb = this.hexToRgb(hex);
    if (!rgb) return `${label} ${hex}`;

    const contrastColor = this.getContrastColor(hex);
    const contrastRgb = this.hexToRgb(contrastColor);
    
    // Create the colored background with text
    const paddedLabel = label.padEnd(width - hex.length - 1);
    const text = `${paddedLabel} ${hex}`;
    
    return chalk.rgb(contrastRgb.r, contrastRgb.g, contrastRgb.b)
                .bgRgb(rgb.r, rgb.g, rgb.b)(text);
  }

  // Print a single color with label
  printColor(hex, label = '') {
    if (!hex) return;
  }

  // Print a color palette
  printColorPalette(colors, title = 'Color Palette') {
    if (!colors || colors.length === 0) return;
    
    colors.forEach((color, index) => {
      if (color) {
        this.printColor(color, `Color ${index + 1}`);
      }
    });
  }

  // Print color combinations (background + foreground)
  printColorCombination(bgColor, fgColor, label = '') {
    if (!bgColor && !fgColor) return;
    
    const bgRgb = bgColor ? this.hexToRgb(bgColor) : null;
    const fgRgb = fgColor ? this.hexToRgb(fgColor) : { r: 255, g: 255, b: 255 };
    
    if (!bgRgb && !fgRgb) return;
    
    let text = label || 'Sample Text';
    text = text.padEnd(25);
    
    // Color combination processing without console output
  }

  // Print element-specific colors
  printElementColors(elements) {
    if (!elements) return;
    
    // Process element colors without console output
    if (elements.body && (elements.body.background || elements.body.foreground)) {
      this.printColorCombination(elements.body.background, elements.body.foreground, 'Body Content');
    }
    
    if (elements.header && (elements.header.background || elements.header.foreground)) {
      this.printColorCombination(elements.header.background, elements.header.foreground, 'Header Content');
    }
    
    if (elements.footer && (elements.footer.background || elements.footer.foreground)) {
      this.printColorCombination(elements.footer.background, elements.footer.foreground, 'Footer Content');
    }
    
    if (elements.button && elements.button.length > 0) {
      elements.button.forEach((button, index) => {
        if (button.background || button.foreground) {
          const label = `Button ${index + 1} (${button.score}x)`;
          this.printColorCombination(button.background, button.foreground, label);
        }
      });
    }
  }

  // Main function to print all color data
  printColorAnalysis(colorData, url = '') {
    // Process color data without console output
    if (colorData.backgrounds && colorData.backgrounds.length > 0) {
      this.printColorPalette(colorData.backgrounds, '🎭 Background Colors');
    }
    
    if (colorData.foregrounds && colorData.foregrounds.length > 0) {
      this.printColorPalette(colorData.foregrounds, '✍️  Foreground Colors');
    }
    
    this.printElementColors(colorData.elements);
  }

  // Utility function to print a color grid
  printColorGrid(colors, title = 'Colors', columns = 4) {
    if (!colors || colors.length === 0) return;
    
    for (let i = 0; i < colors.length; i += columns) {
      const row = colors.slice(i, i + columns);
      const swatches = row.map(color => 
        color ? this.createColorSwatch(color, '', 15) : ''
      ).join(' ');
    }
  }
}

// Export singleton instance
const colorPrinter = new ColorPrinter();
export default colorPrinter;

// Also export the class for advanced usage
export { ColorPrinter };
