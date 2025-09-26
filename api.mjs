import express from 'express';
import { createCanvas, registerFont } from 'canvas'; // registerFontを追加
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const app = express();

app.use(express.json());
app.use(express.static("public"));

// __dirnameの代わりにimport.meta.urlを使用
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// NotoSansJPフォントを登録
const fontPath = path.join(__dirname, 'public', 'fonts', 'NotoSansJP-VariableFont_wght.ttf');
if (fs.existsSync(fontPath)) {
    registerFont(fontPath, { family: 'NotoSansJP' });
    console.log('Font registered successfully.');
} else {
    console.error('Font file does not exist:', fontPath);
}

// シャッフル関数
const shuffleArray = (array) => {
    return array
        .map(value => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value);
};

// 禁止ペアを避けるロジックを追加
const avoidForbiddenPairs = (seating, forbiddenPairs, rows, cols) => {
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols - 1; c++) {
            const pair = [seating[r][c], seating[r][c + 1]];
            if (forbiddenPairs.some(([a, b]) => pair.includes(a) && pair.includes(b))) {
                return false; // 禁止ペアが隣接している場合
            }
        }
    }

    for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows - 1; r++) {
            const pair = [seating[r][c], seating[r + 1][c]];
            if (forbiddenPairs.some(([a, b]) => pair.includes(a) && pair.includes(b))) {
                return false; // 禁止ペアが隣接している場合
            }
        }
    }

    return true; // 禁止ペアが隣接していない
};

// リトライ機構を追加
const generateSeatingWithRetries = (students, rows, cols, forbiddenPairs, fixedSeats, maxRetries = 10) => {
    let retries = 0;
    while (retries < maxRetries) {
        let studentNumbers = Array.from({ length: students }, (_, i) => i + 1);
        let shuffled = shuffleArray(studentNumbers);

        let seating = Array.from({ length: rows }, () => Array(cols).fill(null));

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

        // 禁止ペアを避けるロジックを適用
        if (avoidForbiddenPairs(seating, forbiddenPairs, rows, cols)) {
            return seating; // 成功した場合
        }

        retries++;
    }

    throw new Error('最大リトライ回数を超えました。禁止ペアを避ける配置が見つかりませんでした。');
};

// 席替えAPI
app.post("/shuffle", (req, res) => {
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

// 座席表を生成するAPI
app.post("/generate-image", async (req, res) => {
    const { seating } = req.body;

    if (!Array.isArray(seating) || !seating.every(row => Array.isArray(row))) {
        return res.status(500).json({ error: 'Error generating image: Invalid seating data' });
    }

    try {
        const canvasWidth = 1000;
        const canvasHeight = 600;
        const canvas = createCanvas(canvasWidth, canvasHeight);
        const ctx = canvas.getContext('2d');

        // 背景色を設定
        ctx.fillStyle = '#f0f8ff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // タイトルを描画
        ctx.fillStyle = '#000';
        ctx.font = 'bold 40px NotoSansJP'; // フォントサイズを40pxに変更し、太字に設定
        ctx.textAlign = 'center';
        ctx.fillText('座席表', canvasWidth / 2, 50);

        // 座席表の描画領域を設定
        const seatingWidth = canvasWidth * 0.8;
        const seatingHeight = canvasHeight * 0.6;
        const seatingX = (canvasWidth - seatingWidth) / 2;
        const seatingY = (canvasHeight - seatingHeight) / 2 + 50;

        ctx.fillStyle = '#000';
        ctx.font = 'bold 30px NotoSansJP'; // フォントサイズを30pxに変更し、太字に設定
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const cellWidth = seatingWidth / seating[0].length;
        const cellHeight = seatingHeight / seating.length;

        seating.forEach((row, rowIndex) => {
            row.forEach((seat, colIndex) => {
                const x = seatingX + colIndex * cellWidth + cellWidth / 2;
                const y = seatingY + rowIndex * cellHeight + cellHeight / 2;
                ctx.strokeRect(seatingX + colIndex * cellWidth, seatingY + rowIndex * cellHeight, cellWidth, cellHeight);
                if (seat !== null) {
                    ctx.fillText(seat, x, y);
                }
            });
        });

        const buffer = canvas.toBuffer('image/png');
        res.set('Content-Type', 'image/png');
        res.status(200).send(buffer);
    } catch (error) {
        console.error('Error generating image:', error);
        res.status(500).json({ error: 'Error generating image' });
    }
});

export default app;
