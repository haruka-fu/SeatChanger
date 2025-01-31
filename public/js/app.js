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
            studentOptions: Array.from({ length: 32 }, (_, i) => (i + 1).toString()), // 生徒番号のオプション
            errorMessage: "" // エラーメッセージを格納するプロパティ
        };
    },
    methods: {
        addForbiddenPair() {
            // 同じ生徒を選択していないか確認
            console.log(this.selectedStudent1, this.selectedStudent2);
            if (this.selectedStudent1 && this.selectedStudent2 && this.selectedStudent1 !== this.selectedStudent2) {
                const newPair = [this.selectedStudent1, this.selectedStudent2];
                // すでに追加されていないか確認
                const isAlreadyAdded = this.forbiddenPairs.some(pair =>
                    (pair[0] === newPair[0] && pair[1] === newPair[1]) ||
                    (pair[0] === newPair[1] && pair[1] === newPair[0])
                );
                if (!isAlreadyAdded) {
                    this.forbiddenPairs.push(newPair);
                    this.sortForbiddenPairs(); // 追加後にソート
                    this.errorMessage = ""; // エラーメッセージをクリア
                } else {
                    this.errorMessage = "このペアはすでに追加されています。"; // すでに追加されている場合のエラーメッセージ
                }
            } else {
                this.errorMessage = "無効なペアです。生徒1と生徒2を選択してください。"; // エラーメッセージを設定
            }
        },
        removeForbiddenPair(index) {
            // クリックされたインデックスのペアを削除
            this.forbiddenPairs.splice(index, 1);
            this.sortForbiddenPairs(); // 削除後にソート
        },
        sortForbiddenPairs() {
            // forbiddenPairsを生徒1を基準に、次に生徒2を基準にソート
            this.forbiddenPairs.sort((a, b) => {
                if (a[0] === b[0]) {
                    return a[1] - b[1];
                }
                return a[0] - b[0];
            });
        },
        async shuffleSeats() {
            // シャッフルリクエストを送信
            const response = await fetch("/shuffle", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                // サーバーに送信するデータをJSON形式で送信
                body: JSON.stringify({
                    students: this.students,
                    rows: this.rows,
                    cols: this.cols,
                    forbiddenPairs: this.forbiddenPairs  // 禁止された隣席ペアを送信
                })
            });
            // シャッフル結果を受信
            const data = await response.json();
            // シャッフル結果を表示
            this.seating = data.seating;
            // オーバーフロー生徒を表示
            this.overflowStudents = data.overflow;
        }
    }
}).mount("#app");
