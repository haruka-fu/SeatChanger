const express = require("express");
const app = express();

// dotenvパッケージを読み込み
require('dotenv').config();

const PORT = process.env.PORT || 8080;

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
    console.log("Received /shuffle request with body:", req.body);

    const { students, rows, cols, forbiddenPairs } = req.body;
    let studentNumbers = Array.from({ length: students }, (_, i) => i + 1);
    let shuffled = shuffleArray(studentNumbers);

    console.log("Shuffled student numbers:", shuffled);

    let maxSeats = rows * cols;
    let seating = [];
    let overflow = [];
    let pairwiseConflict = false;

    // 席割り
    let index = 0;
    for (let r = 0; r < rows; r++) {
        let row = [];
        for (let c = 0; c < cols; c++) {
            if (index < maxSeats) {
                row.push(shuffled[index++]);
            } else {
                row.push(null);
            }
        }
        seating.push(row);
    }

    console.log("Seating arrangement:", seating);

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

    console.log("Pairwise conflict:", pairwiseConflict);

    // 結果を返す
    res.json({ seating, overflow, pairwiseConflict });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
