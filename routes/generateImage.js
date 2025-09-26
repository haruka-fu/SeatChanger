import express from 'express';
import { createCanvas } from 'canvas';

const router = express.Router();

router.post('/generate-image', (req, res) => {
    const { seating, rows, cols } = req.body;
    try {
        const canvas = createCanvas(cols * 100, rows * 100);
        const ctx = canvas.getContext('2d');

        // Draw seating chart
        seating.forEach((row, rowIndex) => {
            row.forEach((seat, colIndex) => {
                ctx.fillStyle = seat ? 'blue' : 'white';
                ctx.fillRect(colIndex * 100, rowIndex * 100, 100, 100);
                ctx.strokeRect(colIndex * 100, rowIndex * 100, 100, 100);
                ctx.fillStyle = 'black';
                ctx.fillText(seat || '', colIndex * 100 + 50, rowIndex * 100 + 50);
            });
        });

        res.setHeader('Content-Type', 'image/png');
        canvas.pngStream().pipe(res);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
