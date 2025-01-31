const app = Vue.createApp({
    data() {
        return {
            students: 32,
            rows: 4,
            cols: 8,
            forbiddenPairs: [],
            fixedSeats: [],
            showForbiddenList: false,
            showFixedSeatList: false,
            seating: Array.from({ length: 4 }, () => Array(8).fill(null)), // 初期化
            selectedStudent1: null,
            selectedStudent2: null,
            selectedFixedStudent: null,
            selectedRow: 0,
            selectedCol: 0,
            forbiddenErrorMessage: "",
            fixedSeatErrorMessage: ""
        };
    },
    computed: {
        availableRows() {
            return Array.from({ length: this.rows }, (_, i) => i);
        },
        availableCols() {
            return Array.from({ length: this.cols }, (_, i) => i);
        }
    },
    mounted() {
        this.shuffleSeats();
    },
    methods: {
        // 隣に座らせたくないペアを追加します
        addForbiddenPair() {
            if (this.selectedStudent1 && this.selectedStudent2 && this.selectedStudent1 !== this.selectedStudent2) {
                const newPair = [this.selectedStudent1, this.selectedStudent2];
                const isAlreadyAdded = this.forbiddenPairs.some(pair =>
                    (pair[0] === newPair[0] && pair[1] === newPair[1]) ||
                    (pair[0] === newPair[1] && pair[1] === newPair[0])
                );
                const isAdjacent = this.fixedSeats.some(seat => {
                    const [a, b] = newPair;
                    return (
                        (seat.student === a && (
                            (this.seating[seat.row]?.[seat.col - 1] === b) ||
                            (this.seating[seat.row]?.[seat.col + 1] === b) ||
                            (this.seating[seat.row - 1]?.[seat.col] === b) ||
                            (this.seating[seat.row + 1]?.[seat.col] === b)
                        )) ||
                        (seat.student === b && (
                            (this.seating[seat.row]?.[seat.col - 1] === a) ||
                            (this.seating[seat.row]?.[seat.col + 1] === a) ||
                            (this.seating[seat.row - 1]?.[seat.col] === a) ||
                            (this.seating[seat.row + 1]?.[seat.col] === a)
                        ))
                    );
                });
                if (!isAlreadyAdded && !isAdjacent) {
                    this.forbiddenPairs.push(newPair);
                    this.sortForbiddenPairs();
                    this.forbiddenErrorMessage = "";
                } else if (isAdjacent) {
                    this.forbiddenErrorMessage = "このペアは既に隣に座っています。";
                } else {
                    this.forbiddenErrorMessage = "このペアはすでに追加されています。";
                }
            } else {
                this.forbiddenErrorMessage = "無効なペアです。生徒1と生徒2を選択してください。";
            }
        },
        // 隣に座らせたくないペアを削除します
        removeForbiddenPair(index) {
            this.forbiddenPairs.splice(index, 1);
            this.sortForbiddenPairs();
        },
        // 隣に座らせたくないペアをソートします
        sortForbiddenPairs() {
            this.forbiddenPairs.sort((a, b) => {
                if (a[0] === b[0]) {
                    return a[1] - b[1];
                }
                return a[0] - b[0];
            });
        },
        // 固定席を追加します
        addFixedSeat() {
            if (this.selectedFixedStudent && this.selectedRow !== null && this.selectedCol !== null) {
                const newFixedSeat = {
                    student: this.selectedFixedStudent,
                    row: this.selectedRow,
                    col: this.selectedCol
                };
                const isAlreadyAdded = this.fixedSeats.some(seat =>
                    seat.student === newFixedSeat.student ||
                    (seat.row === newFixedSeat.row && seat.col === newFixedSeat.col)
                );
                const isForbiddenPair = this.forbiddenPairs.some(pair => {
                    const [a, b] = pair;
                    return (
                        (a === newFixedSeat.student && (
                            (this.seating[newFixedSeat.row]?.[newFixedSeat.col - 1] === b) ||
                            (this.seating[newFixedSeat.row]?.[newFixedSeat.col + 1] === b) ||
                            (this.seating[newFixedSeat.row - 1]?.[newFixedSeat.col] === b) ||
                            (this.seating[newFixedSeat.row + 1]?.[newFixedSeat.col] === b)
                        )) ||
                        (b === newFixedSeat.student && (
                            (this.seating[newFixedSeat.row]?.[newFixedSeat.col - 1] === a) ||
                            (this.seating[newFixedSeat.row]?.[newFixedSeat.col + 1] === a) ||
                            (this.seating[newFixedSeat.row - 1]?.[newFixedSeat.col] === a) ||
                            (this.seating[newFixedSeat.row + 1]?.[newFixedSeat.col] === a)
                        ))
                    );
                });
                if (!isAlreadyAdded && !isForbiddenPair) {
                    this.fixedSeats.push(newFixedSeat);
                    this.seating[newFixedSeat.row][newFixedSeat.col] = newFixedSeat.student; // 座席に固定生徒を配置
                    this.fixedSeatErrorMessage = "";
                } else if (isForbiddenPair) {
                    this.fixedSeatErrorMessage = "この生徒は隣に座らせたくないリストに含まれています。";
                } else {
                    this.fixedSeatErrorMessage = "この生徒または座標はすでに固定されています。";
                }
            } else {
                this.fixedSeatErrorMessage = "無効な固定席です。生徒と座標を選択してください。";
            }
        },
        // 固定席を削除します
        removeFixedSeat(index) {
            const seat = this.fixedSeats.splice(index, 1)[0];
            this.seating[seat.row][seat.col] = null; // 座席から固定生徒を削除
        },
        // 席替えを実行します
        async shuffleSeats() {
            const response = await fetch("/shuffle", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    students: this.students,
                    rows: this.rows,
                    cols: this.cols,
                    forbiddenPairs: this.forbiddenPairs,
                    fixedSeats: this.fixedSeats
                })
            });
            const data = await response.json();
            this.seating = data.seating;
            this.overflowStudents = data.overflow;
        },
        // 座席表を画像として保存します
        saveSeatChartAsImage() {
            const seatChartElement = document.getElementById('seat-chart');
            html2canvas(seatChartElement).then(canvas => {
                // 新しいキャンバスを作成して9:16のサイズに設定
                const newCanvas = document.createElement('canvas');
                const context = newCanvas.getContext('2d');
                const aspectRatio = 9 / 16;
                const originalWidth = canvas.width;
                const originalHeight = canvas.height;
                const newWidth = originalWidth;
                const newHeight = originalWidth * aspectRatio;

                newCanvas.width = newWidth;
                newCanvas.height = newHeight;

                // 背景を白に設定
                context.fillStyle = '#ffffff';
                context.fillRect(0, 0, newCanvas.width, newCanvas.height);

                // 元のキャンバスを新しいキャンバスの中央に描画
                const offsetX = (newWidth - originalWidth) / 2;
                const offsetY = (newHeight - originalHeight) / 2;
                context.drawImage(canvas, offsetX, offsetY);

                // 画像をダウンロード
                const link = document.createElement('a');
                const now = new Date();
                const formattedDate = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
                link.href = newCanvas.toDataURL('image/png');
                link.download = `seat-chart_${formattedDate}.png`;
                link.click();
            });
        }
    }
});

app.mount('#app');
