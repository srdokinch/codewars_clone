export interface AdvancedSplashMessage {
  title: string;
  body: string;
}

const DEFAULT_MESSAGE: AdvancedSplashMessage = {
  title: "★ 応用問題だ！",
  body: "ここまで来たら十分えらい。あとはやってみるだけ！",
};

const ADVANCED_SPLASH_MESSAGES: Record<number, AdvancedSplashMessage> = {
  1: {
    title: "★ 応用問題だ！",
    body: "console.log も変数もお馴染みのはず。ここからは「自分の言葉」で語る番です！",
  },
  2: {
    title: "★ 型と演算、応用！",
    body: "数値も文字列もいじれるようになったあなたへ。計算はだいたい合ってればOK！",
  },
  3: {
    title: "★ if文の本番！",
    body: "条件分岐マスターへの最終関門。ここを抜けたら分岐は怖くない！",
  },
  5: {
    title: "★ 関数、応用モード！",
    body: "関数を「作って使う」側に回る時間。再利用の達人気分でいこう！",
  },
  6: {
    title: "★ オブジェクト応用！",
    body: "キーと値の組み合わせ遊びの本番。JSONの気分でいじってみよ！",
  },
  7: {
    title: "★ map/filter の応用！",
    body: "React で使うやつ、ここで握ろう。配列を好きになったら半分勝ち！",
  },
  8: {
    title: "★ DOM、直接いじるぞ！",
    body: "HTMLコーダーの本領発揮タイム。ブラウザを動かす側に回ろう！",
  },
  9: {
    title: "★ 非同期、応用だ！",
    body: "待つのが苦手でも大丈夫。Promise はちゃんと待ってくれる！",
  },
  10: {
    title: "★ ES6+、応用！",
    body: "モダン構文の総仕上げ。スプレッドもテンプレも、もう友達だよね？",
  },
  11: {
    title: "★ モジュール、応用！",
    body: "import/export の応用チャレンジ。npm 使いこなせたら強い！",
  },
  12: {
    title: "★ 総仕上げ、応用！",
    body: "React 入門前の最終関門。ここまで来たら、もうコーダーだよ！",
  },
};

export function getAdvancedSplashMessage(week: number): AdvancedSplashMessage {
  return ADVANCED_SPLASH_MESSAGES[week] ?? DEFAULT_MESSAGE;
}
