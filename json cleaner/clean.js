const fs = require('fs');
const path = require('path');

// Grab the input filename from the command line
const inputFile = process.argv[2];

if (!inputFile) {
  console.error('❌ Please provide a JSON filename, e.g., node sanitize-html-json.js myfile.json');
  process.exit(1);
}

// Full path resolution
const inputPath = path.resolve(__dirname, inputFile);
const ext = path.extname(inputFile);
const base = path.basename(inputFile, ext);
const outputPath = path.join(__dirname, `${base}-out${ext}`);

// Clean HTML content: remove newlines, trim, escape quotes
function cleanHTML(html) {
  return html
    .replace(/\n/g, '')                   // Remove all newlines
    .replace(/\s{2,}/g, ' ')              // Collapse multiple spaces
    .replace(/"/g, '\\"')                 // Escape double quotes
    .trim();
}

// Read and parse the JSON
let raw;
try {
  raw = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
} catch (err) {
  console.error(`❌ Failed to read or parse ${inputFile}:`, err.message);
  process.exit(1);
}

// Clean all relevant sections
const cleaned = raw.map(section => {
  const updated = { ...section };
  if (updated['html-image']) {
    updated['html-image'] = cleanHTML(updated['html-image']);
  }
  if (updated['html-text']) {
    updated['html-text'] = cleanHTML(updated['html-text']);
  }
  return updated;
});

// Write out the cleaned version
fs.writeFileSync(outputPath, JSON.stringify(cleaned, null, 2));
console.log(`✅ Cleaned HTML written to ${outputPath}`);
