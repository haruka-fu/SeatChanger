const request = require('supertest');
const express = require('express');

const app = express();
app.use(express.json());

// サンプルのエンドポイント
app.post('/shuffle', (req, res) => {
    const { students, rows, cols, forbiddenPairs, fixedSeats } = req.body;
    let studentNumbers = Array.from({ length: students }, (_, i) => i + 1);
    let shuffled = shuffleArray(studentNumbers);

    let seating = Array.from({ length: rows }, () => Array(cols).fill(null));
    let overflow = [];
    let pairwiseConflict = false;

    // 固定席を配置
    fixedSeats.forEach(seat => {
        seating[seat.row][seat.col] = seat.student;
        shuffled = shuffled.filter(student => student !== seat.student);
    });

    // 残りの席をシャッフル
    let index = 0;
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (!seating[r][c] && index < shuffled.length) {
                seating[r][c] = shuffled[index++];
            }
        }
    }

    // 隣に座らせたくない生徒のペアが隣接しているかチェック
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols - 1; c++) {  // 横の隣接をチェック
            const pair = [seating[r][c], seating[r][c + 1]];
            if (forbiddenPairs.some(([a, b]) => pair.includes(a) && pair.includes(b))) {
                pairwiseConflict = true;
                break;
            }
        }
        if (pairwiseConflict) break;
    }

    for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows - 1; r++) {  // 縦の隣接をチェック
            const pair = [seating[r][c], seating[r + 1][c]];
            if (forbiddenPairs.some(([a, b]) => pair.includes(a) && pair.includes(b))) {
                pairwiseConflict = true;
                break;
            }
        }
        if (pairwiseConflict) break;
    }

    // 結果を返す
    res.status(200).json({ seating, overflow, pairwiseConflict });
});

// シャッフル関数
const shuffleArray = (array) => {
    return array
        .map(value => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value);
};

describe('POST /shuffle', () => {
    // 基本的なエンドポイントのテスト
    it('should return a 200 status and a JSON object', async () => {
        const response = await request(app)
            .post('/shuffle')
            .send({
                students: 32,
                rows: 4,
                cols: 8,
                forbiddenPairs: [],
                fixedSeats: []
            });
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('seating');
        expect(response.body).toHaveProperty('overflow');
    });

    // 固定席のテスト
    it('should handle fixed seats correctly', async () => {
        const response = await request(app)
            .post('/shuffle')
            .send({
                students: 32,
                rows: 4,
                cols: 8,
                forbiddenPairs: [],
                fixedSeats: [{ student: 1, row: 0, col: 0 }]
            });
        expect(response.status).toBe(200);
        expect(response.body.seating[0][0]).toBe(1);
    });

    // 隣に座らせたくないペアのテスト
    it('should handle forbidden pairs correctly', async () => {
        const response = await request(app)
            .post('/shuffle')
            .send({
                students: 32,
                rows: 4,
                cols: 8,
                forbiddenPairs: [[1, 2]],
                fixedSeats: []
            });
        expect(response.status).toBe(200);
        const seating = response.body.seating;
        let pairwiseConflict = false;
        for (let r = 0; r < seating.length; r++) {
            for (let c = 0; c < seating[r].length - 1; c++) {
                const pair = [seating[r][c], seating[r][c + 1]];
                if (pair.includes(1) && pair.includes(2)) {
                    pairwiseConflict = true;
                    break;
                }
            }
            if (pairwiseConflict) break;
        }
        expect(pairwiseConflict).toBe(false);
    });

    // 固定席と隣に座らせたくないペアの組み合わせのテスト
    it('should not allow forbidden pairs to be adjacent when using fixed seats', async () => {
        // テストリクエストを送信
        const response = await request(app)
            .post('/shuffle')
            .send({
                students: 32, // 生徒の数
                rows: 4, // 行数
                cols: 8, // 列数
                forbiddenPairs: [[1, 2]], // 隣に座らせたくないペア
                fixedSeats: [{ student: 1, row: 0, col: 0 }, { student: 2, row: 0, col: 2 }] // 固定席の設定
            });
        expect(response.status).toBe(200); // ステータスコードが200であることを確認

        const seating = response.body.seating; // 席配置を取得
        let pairwiseConflict = false; // 隣接する禁止ペアがあるかどうかのフラグ

        // 横方向の隣接をチェック
        for (let r = 0; r < seating.length; r++) {
            for (let c = 0; c < seating[r].length - 1; c++) {
                const pair = [seating[r][c], seating[r][c + 1]]; // 隣接するペアを取得
                if (pair.includes(1) && pair.includes(2)) { // 禁止ペアが隣接しているかチェック
                    pairwiseConflict = true;
                    break;
                }
            }
            if (pairwiseConflict) break;
        }

        // 縦方向の隣接をチェック
        if (!pairwiseConflict) {
            for (let c = 0; c < seating[0].length; c++) {
                for (let r = 0; r < seating.length - 1; r++) {
                    const pair = [seating[r][c], seating[r + 1][c]]; // 隣接するペアを取得
                    if (pair.includes(1) && pair.includes(2)) { // 禁止ペアが隣接しているかチェック
                        pairwiseConflict = true;
                        break;
                    }
                }
                if (pairwiseConflict) break;
            }
        }

        expect(pairwiseConflict).toBe(false); // 禁止ペアが隣接していないことを確認
    });

    // 固定席を設定した後に隣に座らせたくないペアを追加しようとした場合のテスト
    it('should not allow adding forbidden pairs that are already adjacent due to fixed seats', async () => {
        // 固定席を設定
        const fixedSeatsResponse = await request(app)
            .post('/shuffle')
            .send({
                students: 32,
                rows: 4,
                cols: 8,
                forbiddenPairs: [],
                fixedSeats: [{ student: 1, row: 0, col: 0 }, { student: 2, row: 0, col: 1 }]
            });
        expect(fixedSeatsResponse.status).toBe(200);

        // 隣に座らせたくないペアを追加しようとする
        const forbiddenPairsResponse = await request(app)
            .post('/shuffle')
            .send({
                students: 32,
                rows: 4,
                cols: 8,
                forbiddenPairs: [[1, 2]],
                fixedSeats: [{ student: 1, row: 0, col: 0 }, { student: 2, row: 0, col: 1 }]
            });
        expect(forbiddenPairsResponse.status).toBe(200);
        expect(forbiddenPairsResponse.body.pairwiseConflict).toBe(true); // 隣接する禁止ペアがあることを確認
    });
});
