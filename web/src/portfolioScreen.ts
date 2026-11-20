import { CanvasTexture, NearestFilter, SRGBColorSpace } from "three";
import { computerScience, type Language } from "./catalog";

export function portfolioScreen(language: Language) {
  const canvas = document.createElement("canvas");
  canvas.width = 176;
  canvas.height = 104;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#102d22";
  ctx.fillRect(0, 0, 176, 104);
  ctx.fillStyle = "#a8e7af";
  ctx.font = "bold 10px monospace";
  ctx.fillText("UFS / DCOMP", 7, 13);
  ctx.fillRect(7, 17, 162, 1);
  ctx.font = "bold 21px monospace";
  const [first, last] = computerScience.title[language].split(/ (?=\S+$)/);
  ctx.fillText(first, 6, 40);
  ctx.fillText(last, 6, 61);
  ctx.font = "bold 11px monospace";
  ctx.fillText("William Gabriel Yckson", 7, 79);
  ctx.fillStyle = "#95cda0";
  ctx.fillText(language === "pt" ? "Pesquisa / Projetos" : "Research / Projects", 7, 98);
  const texture = new CanvasTexture(canvas);
  texture.flipY = false; // Match the glTF display mesh UV orientation.
  texture.colorSpace = SRGBColorSpace;
  texture.magFilter = texture.minFilter = NearestFilter;
  texture.generateMipmaps = false;
  return texture;
}
