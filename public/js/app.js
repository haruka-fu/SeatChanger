const { createApp } = Vue;

createApp({
    data() {
        return {
            students: 32,  // デフォルトの生徒数
            rows: 4,        // デフォルトの行数
            cols: 8,        // デフォルトの列数
            seating: [],
            overflowStudents: [],
            forbiddenPairs: [], // 隣に座らせたくないペアのリスト
            selectedStudent1: "",
            selectedStudent2: "",
            studentOptions: Array.from({ length: 32 }, (_, i) => (i + 1).toString()) // 生徒番号のオプション
        };
    },
    methods: {
        addForbiddenPair() {
            if (this.selectedStudent1 && this.selectedStudent2 && this.selectedStudent1 !== this.selectedStudent2) {
                const newPair = [this.selectedStudent1, this.selectedStudent2];
                this.forbiddenPairs.push(newPair);
                this.selectedStudent1 = "";
                this.selectedStudent2 = "";
            } else {
                alert("無効なペアです。生徒1と生徒2を選択してください。");
            }
        },
        removeForbiddenPair(index) {
            this.forbiddenPairs.splice(index, 1);
        },
        async shuffleSeats() {
            const response = await fetch("/shuffle", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    students: this.students,
                    rows: this.rows,
                    cols: this.cols,
                    forbiddenPairs: this.forbiddenPairs  // 禁止された隣席ペアを送信
                })
            });
            const data = await response.json();
            this.seating = data.seating;
            this.overflowStudents = data.overflow;
        }
    }
}).mount("#app");
