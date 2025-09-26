import express from 'express';
import { shuffleArray, hasForbiddenPairConflict, placeFixedSeats, generateSeatingWithRetries } from '../utils.js';

const router = express.Router();

router.post('/shuffle', (req, res) => {
    const { students, rows, cols, forbiddenPairs, fixedSeats } = req.body;
    try {
        const seating = generateSeatingWithRetries(students, rows, cols, forbiddenPairs, fixedSeats);
        const maxSeats = rows * cols;
        const overflow = students > maxSeats ? Array.from({ length: students - maxSeats }, (_, i) => maxSeats + i + 1) : [];

        res.status(200).json({ seating, overflow, pairwiseConflict: false });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
