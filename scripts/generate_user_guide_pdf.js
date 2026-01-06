const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const mdPath = path.join(__dirname, '../docs/Judo_Command_Center_User_Guide.md');
const pdfPath = path.join(__dirname, '../docs/Judo_Command_Center_User_Guide.pdf');

console.log(`Reading Markdown from: ${mdPath}`);
const content = fs.readFileSync(mdPath, 'utf8');

const doc = new PDFDocument({ margin: 50 });
doc.pipe(fs.createWriteStream(pdfPath));

// Fonts - using standard fonts
doc.font('Helvetica');

const lines = content.split('\n');

// Helper to parse and print formatted text
function printFormattedText(text, options = {}) {
    // Regex to split by bold (**...**) and italic (*...*) markers
    // Capturing groups allow split to include the delimiters and content
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);

    parts.forEach((part, index) => {
        let textToPrint = part;
        let font = 'Helvetica';

        if (part.startsWith('**') && part.endsWith('**')) {
            textToPrint = part.substring(2, part.length - 2);
            font = 'Helvetica-Bold';
        } else if (part.startsWith('*') && part.endsWith('*')) {
            textToPrint = part.substring(1, part.length - 1);
            font = 'Helvetica-Oblique';
        }

        const isLast = index === parts.length - 1;

        doc.font(font).fontSize(options.fontSize || 12).text(textToPrint, {
            continued: !isLast,
            indent: (index === 0) ? (options.indent || 0) : 0,
            ...options
        });
    });
}

for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith('# ')) {
        // H1
        doc.moveDown();
        doc.font('Helvetica-Bold').fontSize(24).text(trimmed.substring(2).trim());
        doc.moveDown(0.5);
    } else if (trimmed.startsWith('## ')) {
        // H2
        doc.moveDown();
        doc.font('Helvetica-Bold').fontSize(18).text(trimmed.substring(3).trim());
        doc.moveDown(0.5);
    } else if (trimmed.startsWith('### ')) {
        // H3
        doc.moveDown(0.5);
        doc.font('Helvetica-Bold').fontSize(14).text(trimmed.substring(4).trim());
        doc.moveDown(0.2);
    } else if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
        // Bullet
        printFormattedText(`• ${trimmed.substring(2).trim()}`, { indent: 20, fontSize: 12 });
    } else if (trimmed === '---') {
        // Horizontal Rule
        doc.moveDown();
        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown();
    } else if (trimmed.length > 0) {
        // Paragraph
        printFormattedText(trimmed, { fontSize: 12 });
    } else {
        // Empty line
        doc.moveDown(0.5);
    }
}

doc.end();
console.log(`PDF generated at: ${pdfPath}`);
