const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

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
    const { students, rows, cols, forbiddenPairs } = req.body;
    let studentNumbers = Array.from({ length: students }, (_, i) => i + 1);
    let shuffled = shuffleArray(studentNumbers);

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

    // もし隣に座らせたくない生徒が隣接している場合、再シャッフルする
    if (pairwiseConflict) {
        shuffled = shuffleArray(studentNumbers);
        seating = [];
        index = 0;
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
    }

    // 溢れた生徒
    if (students > maxSeats) {
        overflow = shuffled.slice(maxSeats);
    }

    res.json({ seating, overflow });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
