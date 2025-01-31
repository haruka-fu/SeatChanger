const request = require('supertest');
const express = require('express');

const app = express();
app.use(express.json());

// サンプルのエンドポイント
app.post('/shuffle', (req, res) => {
    res.status(200).json({ seating: [], overflow: [] });
});

describe('POST /shuffle', () => {
    it('should return a 200 status and a JSON object', async () => {
        const response = await request(app)
            .post('/shuffle')
            .send({
                students: 32,
                rows: 4,
                cols: 8,
                forbiddenPairs: []
            });
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('seating');
        expect(response.body).toHaveProperty('overflow');
    });
});
