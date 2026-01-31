/**
 * PDF Generation Script for Documentation
 * 
 * Usage:
 * 1. Install dependencies: npm install marked puppeteer
 * 2. Run: node scripts/generate-pdf.js
 * 3. PDF will be created in: Documentation/PDF/
 */

const fs = require('fs');
const path = require('path');
const { marked } = require('marked');
const puppeteer = require('puppeteer');

// Configuration
const DOCS_DIR = path.join(__dirname, '../Documentation');
const PDF_OUTPUT_DIR = path.join(DOCS_DIR, 'PDF');

// Documentation files to convert
const DOCS_TO_CONVERT = [
  {
    input: 'COMPLETE_CODE_EXPLANATION_HINDI.md',
    output: '01_Complete_Code_Explanation_Hindi.pdf',
    title: 'CNTX Portal - Complete Code Explanation (Hindi)'
  },
  {
    input: 'VISUAL_FLOW_DIAGRAM.md',
    output: '02_Visual_Flow_Diagrams.pdf',
    title: 'CNTX Portal - Visual Flow Diagrams'
  },
  {
    input: 'README_DOCUMENTATION.md',
    output: '03_Documentation_Index.pdf',
    title: 'CNTX Portal - Documentation Index'
  },
  {
    input: 'OTN_ROUTE_STATUS_FIX.md',
    output: '04_OTN_Route_Status_Fix.pdf',
    title: 'CNTX Portal - OTN Route Status Fix'
  },
  {
    input: 'SECURITY_AND_STANDARDS.md',
    output: '05_Security_And_Standards.pdf',
    title: 'CNTX Portal - Security & Standards'
  },
  {
    input: 'FILE_STRUCTURE_MIGRATION.md',
    output: '06_File_Structure_Migration.pdf',
    title: 'CNTX Portal - File Structure Migration'
  },
  {
    input: 'MIGRATION_COMPLETE.md',
    output: '07_Migration_Complete.pdf',
    title: 'CNTX Portal - Migration Complete'
  }
];

// HTML Template with better styling for print
const HTML_TEMPLATE = (title, content) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    @page {
      size: A4;
      margin: 2cm;
    }

    * {
      box-sizing: border-box;
    }

    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 100%;
      margin: 0;
      padding: 20px;
      background: white;
    }

    /* Cover Page */
    .cover-page {
      page-break-after: always;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      text-align: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      margin: -20px;
      padding: 40px;
    }

    .cover-page h1 {
      font-size: 48px;
      margin-bottom: 20px;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
    }

    .cover-page .subtitle {
      font-size: 24px;
      margin-bottom: 40px;
      opacity: 0.9;
    }

    .cover-page .info {
      font-size: 16px;
      margin-top: 60px;
      opacity: 0.8;
    }

    /* Headers */
    h1 {
      color: #2c3e50;
      border-bottom: 3px solid #667eea;
      padding-bottom: 10px;
      margin-top: 40px;
      page-break-after: avoid;
    }

    h2 {
      color: #34495e;
      border-bottom: 2px solid #95a5a6;
      padding-bottom: 8px;
      margin-top: 30px;
      page-break-after: avoid;
    }

    h3 {
      color: #555;
      margin-top: 25px;
      page-break-after: avoid;
    }

    h4 {
      color: #666;
      margin-top: 20px;
      page-break-after: avoid;
    }

    /* Code blocks */
    pre {
      background: #f4f4f4;
      border: 1px solid #ddd;
      border-left: 4px solid #667eea;
      padding: 15px;
      overflow-x: auto;
      border-radius: 4px;
      page-break-inside: avoid;
      font-size: 12px;
      line-height: 1.4;
    }

    code {
      background: #f4f4f4;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: 'Courier New', monospace;
      font-size: 13px;
      color: #e74c3c;
    }

    pre code {
      background: transparent;
      padding: 0;
      color: #333;
    }

    /* Lists */
    ul, ol {
      margin: 15px 0;
      padding-left: 30px;
    }

    li {
      margin: 8px 0;
    }

    /* Tables */
    table {
      border-collapse: collapse;
      width: 100%;
      margin: 20px 0;
      page-break-inside: avoid;
      font-size: 14px;
    }

    th, td {
      border: 1px solid #ddd;
      padding: 12px;
      text-align: left;
    }

    th {
      background: #667eea;
      color: white;
      font-weight: bold;
    }

    tr:nth-child(even) {
      background: #f9f9f9;
    }

    /* Blockquotes */
    blockquote {
      border-left: 4px solid #667eea;
      margin: 20px 0;
      padding: 10px 20px;
      background: #f9f9f9;
      font-style: italic;
      page-break-inside: avoid;
    }

    /* Links */
    a {
      color: #667eea;
      text-decoration: none;
    }

    a:hover {
      text-decoration: underline;
    }

    /* Horizontal rules */
    hr {
      border: none;
      border-top: 2px solid #ddd;
      margin: 30px 0;
    }

    /* Boxes */
    .info-box {
      background: #e3f2fd;
      border-left: 4px solid #2196f3;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
      page-break-inside: avoid;
    }

    .warning-box {
      background: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
      page-break-inside: avoid;
    }

    .success-box {
      background: #d4edda;
      border-left: 4px solid #28a745;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
      page-break-inside: avoid;
    }

    /* Page breaks */
    .page-break {
      page-break-after: always;
    }

    /* Footer */
    .footer {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      text-align: center;
      font-size: 10px;
      color: #999;
      padding: 10px;
      border-top: 1px solid #ddd;
    }

    /* Print-specific */
    @media print {
      body {
        font-size: 11pt;
      }
      
      a {
        color: #000;
        text-decoration: underline;
      }
      
      pre {
        font-size: 9pt;
      }
    }
  </style>
</head>
<body>
  <div class="cover-page">
    <h1>📚 ${title}</h1>
    <div class="subtitle">Complete Documentation</div>
    <div class="info">
      <p>Generated: ${new Date().toLocaleDateString('en-IN', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })}</p>
      <p>CNTX Portal - Network Monitoring System</p>
      <p>FMS Pathankot</p>
    </div>
  </div>
  
  <div class="content">
    ${content}
  </div>
  
  <div class="footer">
    CNTX Portal Documentation - Page <span class="pageNumber"></span>
  </div>
</body>
</html>
`;

// Create PDF output directory
function ensureOutputDir() {
  if (!fs.existsSync(PDF_OUTPUT_DIR)) {
    fs.mkdirSync(PDF_OUTPUT_DIR, { recursive: true });
    console.log(`✅ Created output directory: ${PDF_OUTPUT_DIR}`);
  }
}

// Convert Markdown to HTML
function markdownToHtml(markdown) {
  // Configure marked options
  marked.setOptions({
    breaks: true,
    gfm: true,
    headerIds: true,
    mangle: false
  });

  return marked(markdown);
}

// Generate PDF from HTML
async function generatePDF(html, outputPath, title) {
  console.log(`📄 Generating PDF: ${path.basename(outputPath)}...`);

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    await page.pdf({
      path: outputPath,
      format: 'A4',
      margin: {
        top: '2cm',
        right: '2cm',
        bottom: '2cm',
        left: '2cm'
      },
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: '<div></div>',
      footerTemplate: `
        <div style="font-size: 10px; text-align: center; width: 100%; color: #999;">
          <span class="pageNumber"></span> / <span class="totalPages"></span>
        </div>
      `
    });

    console.log(`✅ Generated: ${path.basename(outputPath)}`);
  } catch (error) {
    console.error(`❌ Error generating ${path.basename(outputPath)}:`, error.message);
  } finally {
    await browser.close();
  }
}

// Process single documentation file
async function processDoc(docConfig) {
  const inputPath = path.join(DOCS_DIR, docConfig.input);
  const outputPath = path.join(PDF_OUTPUT_DIR, docConfig.output);

  // Check if input file exists
  if (!fs.existsSync(inputPath)) {
    console.log(`⚠️  Skipping ${docConfig.input} - file not found`);
    return;
  }

  // Read markdown file
  const markdown = fs.readFileSync(inputPath, 'utf8');

  // Convert to HTML
  const htmlContent = markdownToHtml(markdown);

  // Create full HTML with template
  const fullHtml = HTML_TEMPLATE(docConfig.title, htmlContent);

  // Generate PDF
  await generatePDF(fullHtml, outputPath, docConfig.title);
}

// Main function
async function main() {
  console.log('🚀 Starting PDF generation...\n');

  // Ensure output directory exists
  ensureOutputDir();

  // Process each documentation file
  for (const docConfig of DOCS_TO_CONVERT) {
    await processDoc(docConfig);
  }

  // Generate combined PDF
  console.log('\n📚 Generating combined PDF...');
  await generateCombinedPDF();

  console.log('\n✅ PDF generation complete!');
  console.log(`📁 PDFs saved in: ${PDF_OUTPUT_DIR}`);
  console.log('\n📖 Generated PDFs:');
  
  const files = fs.readdirSync(PDF_OUTPUT_DIR);
  files.forEach(file => {
    const stats = fs.statSync(path.join(PDF_OUTPUT_DIR, file));
    const sizeKB = (stats.size / 1024).toFixed(2);
    console.log(`   - ${file} (${sizeKB} KB)`);
  });
}

// Generate combined PDF with all documentation
async function generateCombinedPDF() {
  let combinedMarkdown = '';

  for (const docConfig of DOCS_TO_CONVERT) {
    const inputPath = path.join(DOCS_DIR, docConfig.input);
    
    if (fs.existsSync(inputPath)) {
      const markdown = fs.readFileSync(inputPath, 'utf8');
      combinedMarkdown += `\n\n---\n\n# ${docConfig.title}\n\n${markdown}\n\n`;
      combinedMarkdown += '<div class="page-break"></div>\n\n';
    }
  }

  const htmlContent = markdownToHtml(combinedMarkdown);
  const fullHtml = HTML_TEMPLATE('CNTX Portal - Complete Documentation', htmlContent);
  const outputPath = path.join(PDF_OUTPUT_DIR, '00_COMPLETE_DOCUMENTATION.pdf');

  await generatePDF(fullHtml, outputPath, 'CNTX Portal - Complete Documentation');
}

// Run the script
main().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});
