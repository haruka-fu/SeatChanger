import express from 'express';
import puppeteer from 'puppeteer';

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

// 画像生成API
// app.post("/generate-image", async (req, res) => {
//     const { htmlContent } = req.body;

//     try {
//         const browser = await puppeteer.launch();
//         const page = await browser.newPage();
//         await page.setContent(htmlContent);
//         const imageBuffer = await page.screenshot({ type: 'png' });
//         await browser.close();

//         res.set('Content-Type', 'image/png');
//         res.status(200).send(imageBuffer);
//     } catch (error) {
//         res.status(500).send('Error generating image');
//     }
// });

export default app;
