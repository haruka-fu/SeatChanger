import express from 'express';
import nodeHtmlToImage from 'node-html-to-image';

const app = express();

app.use(express.json());
app.use(express.static("public"));

// シャッフル関数
const shuffleArray = (array) => {
    return array
        .map(value => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value);
};

// 席替えAPI
app.post("/shuffle", (req, res) => {
    const { students, rows, cols, forbiddenPairs, fixedSeats } = req.body;
    let studentNumbers = Array.from({ length: students }, (_, i) => i + 1);
    let shuffled = shuffleArray(studentNumbers);

    let maxSeats = rows * cols;
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

// 座席表を生成するAPI
app.post("/generate-image", async (req, res) => {
    const { seating } = req.body;

    const htmlContent = `
        <html>
        <body style="background-color: #f0f8ff; width: 800px; height: 450px; display: flex; justify-content: center; align-items: center;">
            <table style="width: 80%; height: 60%; border-collapse: collapse; font-size: 1.5rem;">
                ${seating.map(row => `
                    <tr>
                        ${row.map(seat => `
                            <td style="border: 1px solid #000; text-align: center; vertical-align: middle;">
                                ${seat !== null ? seat : ''}
                            </td>
                        `).join('')}
                    </tr>
                `).join('')}
            </table>
        </body>
        </html>
    `;

    try {
        const image = await nodeHtmlToImage({
            html: htmlContent,
            type: 'png',
            quality: 80 // 画像の品質を調整
        });

        res.set('Content-Type', 'image/png');
        res.status(200).send(image);
    } catch (error) {
        console.error('Error generating image:', error);
        res.status(500).send('Error generating image');
    }
});

export default app;
