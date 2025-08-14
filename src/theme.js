import browserManager from "./browserManager.js";

async function comprehensiveThemeDetection(url) {
    const page = await browserManager.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });
    
    const themeInfo = await page.evaluate(() => {
      // Helper function to calculate brightness
      function getBrightness(rgb) {
        const match = rgb.match(/\d+/g);
        if (!match) return null;
        const [r, g, b] = match.map(Number);
        return (r * 299 + g * 587 + b * 114) / 1000;
      }
      
      // Check various elements
      const body = document.body;
      const html = document.documentElement;
      
      // Get background colors
      const bodyBg = window.getComputedStyle(body).backgroundColor;
      const htmlBg = window.getComputedStyle(html).backgroundColor;
      
      // Get text colors
      const bodyColor = window.getComputedStyle(body).color;
      
      // Check for dark theme classes
      const hasDarkClass = body.classList.contains('dark') || 
                          html.classList.contains('dark') ||
                          body.classList.contains('dark-theme') ||
                          html.classList.contains('dark-theme');
      
      // Check color-scheme CSS property
      const colorScheme = window.getComputedStyle(html).colorScheme;
      
      // Calculate brightness
      const bgBrightness = getBrightness(bodyBg !== 'rgba(0, 0, 0, 0)' ? bodyBg : htmlBg);
      const textBrightness = getBrightness(bodyColor);
      
      return {
        backgroundColor: bodyBg !== 'rgba(0, 0, 0, 0)' ? bodyBg : htmlBg,
        textColor: bodyColor,
        backgroundBrightness: bgBrightness,
        textBrightness: textBrightness,
        hasDarkClass,
        colorScheme,
        prefersDark: window.matchMedia('(prefers-color-scheme: dark)').matches
      };
    });
    
    await page.close();
    
    // Determine theme based on multiple factors
    let theme = 'light'; // Default to light
    
    if (themeInfo.hasDarkClass) {
      theme = 'dark';
    } else if (themeInfo.colorScheme === 'dark') {
      theme = 'dark';
    } else if (themeInfo.backgroundBrightness !== null) {
      theme = themeInfo.backgroundBrightness < 128 ? 'dark' : 'light';
    }
    
    return theme;
  }

  export default comprehensiveThemeDetection;