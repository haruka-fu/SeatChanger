import { expect, describe, it } from 'vitest';
import request from 'supertest';
import app from '../app.js';

describe('POST /generate-image', () => {
    it('should generate an image from the seating chart', async () => {
        const response = await request(app)
            .post('/api/generate-image')
            .send({
                seating: [
                    [1, 2, 3],
                    [4, 5, 6],
                    [7, 8, 9]
                ],
                rows: 3,
                cols: 3
            });
        expect(response.status).toBe(200);
        expect(response.headers['content-type']).toContain('image/png');
    }, 10000); // タイムアウトを10秒に延長
});
