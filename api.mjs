import express from 'express';
import path from 'path';
import shuffleRouter from './routes/shuffle.js';
import generateImageRouter from './routes/generateImage.js';

const app = express();

// Serve static files from the public directory (index.html, css, js, images, .well-known, etc.)
app.use(express.static(path.join(process.cwd(), 'public')));

app.use(express.json());
app.use('/api', shuffleRouter);
app.use('/api', generateImageRouter);

export default app;
