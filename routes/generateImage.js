import express from 'express';
import { createCanvas, registerFont } from 'canvas';

const router = express.Router();

// Register Japanese font
registerFont('public/fonts/NotoSansJP-VariableFont_wght.ttf', { family: 'Noto Sans JP' });

router.post('/generate-image', (req, res) => {
    const { seating, rows, cols } = req.body;
    try {
        // Configuration / constants for drawing
        const CELL_SIZE = 100; // px per seat cell
        const PADDING = 32; // outer margin in px
        const BORDER_COLOR = '#000000';
        const BACKGROUND_COLOR = '#b4d1ffff'; // page background color
        const FILLED_COLOR = '#fff8e1'; // color for occupied seat
        const EMPTY_COLOR = '#ffffff'; // color for empty seat

        const canvasWidth = cols * CELL_SIZE + PADDING * 2;
        const canvasHeight = rows * CELL_SIZE + PADDING * 2;

        const canvas = createCanvas(canvasWidth, canvasHeight);
        const ctx = canvas.getContext('2d');

        // Background
        ctx.fillStyle = BACKGROUND_COLOR;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Text and stroke styles
        ctx.strokeStyle = BORDER_COLOR;
        ctx.lineWidth = 2;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = `${Math.max(12, Math.floor(CELL_SIZE * 0.35))}px 'Noto Sans JP', sans-serif`;

        // Helper to draw a single seat cell
        function drawCell(r, c, value) {
            const x = PADDING + c * CELL_SIZE;
            const y = PADDING + r * CELL_SIZE;

            const fill = value ? FILLED_COLOR : EMPTY_COLOR;
            ctx.fillStyle = fill;
            ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);

            // cell border
            ctx.strokeRect(x, y, CELL_SIZE, CELL_SIZE);

            // choose contrasting text color
            const textColor = '#000000';
            ctx.fillStyle = textColor;
            const text = value ? String(value) : '';
            ctx.fillText(text, x + CELL_SIZE / 2, y + CELL_SIZE / 2);
        }

        // Draw seating chart
        seating.forEach((row, rowIndex) => {
            row.forEach((seat, colIndex) => {
                drawCell(rowIndex, colIndex, seat);
            });
        });

        res.setHeader('Content-Type', 'image/png');
        canvas.pngStream().pipe(res);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
