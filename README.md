# Atlas Alt — 無知の知プラットフォーム

人類知への、オルタナティブ。答え（Answer）ではなく、問い（Question）をマッピングする
次世代の共有アーキテクチャのブランド LP。

> “What questions you ask is the hardest part, not what you answer.” — Elon Musk
> 「無知の知」 — Socrates

## 技術スタック

- **Next.js 14**（App Router）/ **React 18**
- **Tailwind CSS 3**
- **Framer Motion**（スクロールリビール・ヒーローのアニメーション）
- **Lucide React**（アイコン）
- フォント: Playfair Display × しっぽり明朝（見出し）/ Zen Kaku Gothic New（本文）/ IBM Plex Mono（座標・ラベル）

## デザインの核

「Atlas＝地図製作」と「無知の知」を軸に、**知の地形図**を視覚言語に。
中心の密な既知ノードが等高線状に広がり、外縁では「?」ノードが白へ溶けていく——
**未知の縁（フチ）** をシグネチャに据えている（`components/FrontierMap.tsx`）。
各セクションは連番ではなく **地図のセクター座標**（`SECTOR 01`, `N 40° · E 12°`）で構造化。

## 開発

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # 本番ビルド
npm run start    # 本番サーバー
```

## 構成

```
app/
  layout.tsx        フォント読み込み・メタデータ
  page.tsx          セクションの組み立て
  globals.css       Tailwind + カートグラフィックなグリッド背景
components/
  Nav.tsx           固定ヘッダー（スクロールで背景・モバイルメニュー）
  Hero.tsx          ヒーロー（見出し・対の引用・CTA）
  FrontierMap.tsx   シグネチャ：未知の地形図（SVG + Framer Motion）
  Concept.tsx       Answer → Question の転回
  Sectors.tsx       マッピングする4領域
  Architecture.tsx  4モジュール一覧
  Manifesto.tsx     無知の知（ダーク帯）
  CTA.tsx           参加への誘導
  Footer.tsx        モジュールリンク・著作権
  Reveal.tsx        スクロールリビールの共通ラッパー
lib/
  site.ts           ナビ・モジュールのデータ
```

## アクセシビリティ

- `prefers-reduced-motion` を尊重（アニメーション無効化）
- キーボードフォーカスの可視化
- レスポンシブ（モバイル〜デスクトップ）
