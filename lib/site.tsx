import type { ReactNode } from "react";

export const NAV_LINKS = [
  { label: "Concept", href: "#concept" },
  { label: "Sectors", href: "#sectors" },
  { label: "Architecture", href: "#architecture" },
  { label: "Manifesto", href: "#manifesto" },
];

export type Module = {
  name: ReactNode;
  coord: string;
  desc: string;
};

export const MODULES: Module[] = [
  {
    name: "Open Atlas",
    coord: "MODULE · 01",
    desc: "誰もが未解決の問いを起票し、繋ぎ、更新できるオープンな問いの地図。",
  },
  {
    name: "Closed Atlas",
    coord: "MODULE · 02",
    desc: "機関・法人向けに、Atlas と OVAL のアーキテクチャをクローズド環境で提供する。",
  },
  {
    name: "Prediction Commons",
    coord: "MODULE · 03",
    desc: "問いの帰結を人類とAIが共に予測し、不確実性を可視化する共有地。",
  },
  {
    name: "Proof of Humanity Contribution",
    coord: "MODULE · 04",
    desc: "AIではなく人が刻んだ問い・洞察の貢献を証明するプロトコル。",
  },
  {
    name: (
      <>
        Ontology Validator ( <em className="italic">oval</em> )
      </>
    ),
    coord: "MODULE · 05",
    desc: "意味論的認証。その問いが本質的に意味を持ち、倫理に適うかを、AIと人間の混合バリデーターが検証する。",
  },
  {
    name: "Atlas Accelerator",
    coord: "MODULE · 06",
    desc: "特定の問題領域に照準を定めたスタートアップを支援し、問いを事業へと接続する。",
  },
];
