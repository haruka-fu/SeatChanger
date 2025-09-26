// シャッフルされた配列を生成する関数
export const shuffleArray = (array) => {
    return array
        .map(value => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value);
};

// 禁止ペアが隣接しているかをチェックする関数
export const hasForbiddenPairConflict = (seating, forbiddenPairs, rows, cols) => {
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols - 1; c++) {
            const pair = [seating[r][c], seating[r][c + 1]];
            if (forbiddenPairs.some(([a, b]) => pair.includes(a) && pair.includes(b))) {
                return true;
            }
        }
    }

    for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows - 1; r++) {
            const pair = [seating[r][c], seating[r + 1][c]];
            if (forbiddenPairs.some(([a, b]) => pair.includes(a) && pair.includes(b))) {
                return true;
            }
        }
    }

    return false;
};

// 固定席を配置する関数
export const placeFixedSeats = (seating, fixedSeats, shuffledStudents) => {
    fixedSeats.forEach(({ student, row, col }) => {
        seating[row][col] = student;
        shuffledStudents = shuffledStudents.filter(s => s !== student);
    });
    return shuffledStudents;
};

// Generate a seating layout from shuffled students given rows and cols
export const generateSeating = (shuffledStudents, rows, cols) => {
    const seating = Array.from({ length: rows }, () => Array.from({ length: cols }, () => null));
    let idx = 0;
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            seating[r][c] = idx < shuffledStudents.length ? shuffledStudents[idx++] : null;
        }
    }
    return seating;
};

// Try generating seating while avoiding forbidden pairs, with retries
export const generateSeatingWithRetries = (students, rows, cols, forbiddenPairs = [], fixedSeats = []) => {
    const maxSeats = rows * cols;
    const studentList = Array.from({ length: students }, (_, i) => i + 1);

    const MAX_RETRIES = 1000;
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        let shuffled = shuffleArray(studentList);

        // Place fixed seats first by removing them from the shuffled list and inserting later
        if (fixedSeats && fixedSeats.length) {
            shuffled = placeFixedSeats(Array.from({ length: rows }, () => Array.from({ length: cols }, () => null)), fixedSeats, shuffled);
            // After placeFixedSeats, the function returned the remaining shuffledStudents; but our usage requires
            // generating seating after placement — so handle fixed seats differently below.
        }

        // Build seating normally, then overwrite fixed seats
        const effectiveShuffled = shuffleArray(studentList);
        const seating = generateSeating(effectiveShuffled, rows, cols);

        // Apply fixed seats
        if (fixedSeats && fixedSeats.length) {
            fixedSeats.forEach(({ student, row, col }) => {
                seating[row][col] = student;
            });
        }

        // If forbiddenPairs are provided, check for conflicts
        if (!forbiddenPairs || forbiddenPairs.length === 0) {
            return seating;
        }

        if (!hasForbiddenPairConflict(seating, forbiddenPairs, rows, cols)) {
            return seating;
        }
    }

    throw new Error('最大リトライ回数を超えました。禁止ペアを避ける配置が見つかりませんでした。');
};
