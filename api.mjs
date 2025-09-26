import express from 'express';
import shuffleRouter from './routes/shuffle.js';
import generateImageRouter from './routes/generateImage.js';

const app = express();

app.use(express.json());
app.use('/api', shuffleRouter);
app.use('/api', generateImageRouter);

export default app;
