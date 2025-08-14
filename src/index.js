#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import screenshots from './screenshots.js';

// Create an MCP server
const server = new McpServer({
  name: "design-scraper-mcp",
  version: "1.0.0"
});

// Simple tool registration - user only provides URL
server.registerTool("generate", {
  title: "Website Design System Generator",
  description: "Analyze a website and automatically generate a comprehensive style guide - just provide the URL",
  inputSchema: {
    url: z.string().url("Must be a valid URL")
  }
}, async ({ url }) => {
  const screenshotData = await screenshots(url);
  const { main: generateMain } = await import('./generate.js');
  const results = await generateMain(url);

  // Generate instructions based on your specific data structure
  const hasColors = results.colors && (results.colors.backgrounds?.length > 0 || results.colors.foregrounds?.length > 0);
  const hasFonts = results.fonts && (results.fonts.headings || results.fonts.body);
  const hasBorders = results.borders && (results.borders.borderRadius || results.borders.borderWidth);
  const theme = results.theme || 'unknown';

  const instructions = `🎨 DESIGN SYSTEM GENERATOR

📸 VISUAL REFERENCE
- Full Page Screenshot Captured
- Dimensions: ${screenshotData.dimensions.width}px x ${screenshotData.dimensions.height}px
- Use this screenshot as the primary visual context for design system analysis

Create a comprehensive website style guide HTML artifact from this design analysis data.

AUTOMATIC GENERATION REQUIREMENTS:
• Professional design system documentation with ${theme} theme
• Interactive color palette with background/foreground colors
• Typography system using detected font families
• Border and visual element specifications
• CSS custom properties for easy implementation
• Developer-friendly code snippets with copy functionality
• Modern, accessible presentation

DETECTED ELEMENTS:
${hasColors ? '✓ Color System - backgrounds, foregrounds, and element-specific colors' : ''}
${hasFonts ? '✓ Typography - heading and body font specifications' : ''}
${hasBorders ? '✓ Visual Elements - border radius, width, and styling' : ''}
${theme ? `✓ Theme - ${theme} mode detected` : ''}

SPECIFIC DATA TO PROCESS:
• Background colors: ${results.colors?.backgrounds?.join(', ') || 'None detected'}
• Foreground colors: ${results.colors?.foregrounds?.join(', ') || 'None detected'}
• Heading font: ${results.fonts?.headings || 'Not detected'}
• Body font: ${results.fonts?.body || 'Not detected'}
• Border radius: ${results.borders?.borderRadius || 'Not detected'}
• Border specifications: Width ${results.borders?.borderWidth || 'N/A'}, Color ${results.borders?.borderColor || 'N/A'}

STYLE GUIDE SECTIONS TO CREATE:
1. **Color Palette** - Organize backgrounds, foregrounds, and element colors with usage guidelines
2. **Typography System** - Document heading and body fonts with hierarchy and examples
3. **Visual Design Tokens** - Border radius, spacing, and styling specifications
4. **Theme Mode** - Light, dark, and high-contrast mode specifications
5. **Element Specifications** - Button, header, body, footer color combinations
6. **Implementation Guide** - CSS custom properties and code snippets
7. **Usage Guidelines** - Best practices for applying the design system

IMPORTANT:
1. Analyze the screenshot and compare it with the detected design data to ensure accuracy.
2. Use the provided data to create a cohesive, modern design system reference.
3. Ensure the final HTML artifact is accessible, responsive, and developer-friendly.
4. Detect the theme mode (light/dark) based on the website's design and apply it consistently throughout the style guide.
5. Detect the primary, secondary, and accent colors from the website's design and include them in the color palette.
5. Compare the detected design elements with the screenshot to ensure consistency and accuracy.
6. Contrast check the colors to ensure they meet accessibility standards (WCAG 2.1 AA).
7. Buttons and interactive elements should have clear hover and active states defined.
8. Foreground and background colors should be paired to ensure readability and accessibility.

Source: ${url}
Theme: ${theme}
Generated: ${new Date().toLocaleDateString()}

=== COMPLETE DESIGN DATA ===
${JSON.stringify(results, null, 2)}

Create this as a single, comprehensive HTML artifact that serves as a complete design system reference for designers and developers.`;

  return {
    content: [
      {
        type: "text",
        text: instructions
      },
      {
        type: "image",
        data: screenshotData.screenshot,
        mimeType: "image/png"
      }
    ]
  };
});

// Screenshot tool registration
server.registerTool("screenshot", {
  title: "Website Screenshot",
  description: "Take a full-page screenshot of a website",
  inputSchema: {
    url: z.string().url("Must be a valid URL"),
    viewportWidth: z.number().optional(),
    viewportHeight: z.number().optional()
  }
}, async ({ url, viewportWidth, viewportHeight }) => {
  const screenshotData = await screenshots(url, { viewportWidth, viewportHeight });
  
  return {
    content: [
      {
        type: "image",
        data: screenshotData.screenshot,
        mimeType: "image/png"
      },
      {
        type: "text",
        text: `Screenshot details:\nURL: ${url}\nWidth: ${screenshotData.dimensions.width}\nHeight: ${screenshotData.dimensions.height}\nSize: ${screenshotData.size} bytes`
      }
    ]
  };
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  process.exit(1);
});