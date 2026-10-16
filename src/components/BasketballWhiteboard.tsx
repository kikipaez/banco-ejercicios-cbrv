import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Eraser, Pencil, RotateCcw, Save, Shield, User } from "lucide-react";

interface BasketballWhiteboardProps {
  onSave: (dataUrl: string) => void;
}

interface Token {
  id: string;
  type: "X" | "O";
  x: number;
  y: number;
}

interface Point {
  x: number;
  y: number;
}

export function BasketballWhiteboard({ onSave }: BasketballWhiteboardProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [courtType, setCourtType] = useState<"half" | "full" | "blank">("half");
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<"pen" | "eraser" | "token">("pen");
  const [selectedTokenType, setSelectedTokenType] = useState<"X" | "O">("O");
  const [tokens, setTokens] = useState<Token[]>([]);
  const [strokes, setStrokes] = useState<Point[][]>([]);
  const [draggingTokenId, setDraggingTokenId] = useState<string | null>(null);

  // Proportional dimensions: Vertical Half Court (15m x 14m) vs Horizontal Full Court (28m x 15m)
  const width = courtType === "half" ? 468 : 640;
  const height = courtType === "half" ? 438 : 360;

  useEffect(() => {
    redrawCanvas();
  }, [courtType, tokens, strokes, width, height]);

  const drawCourtLines = (ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 2;
    ctx.setLineDash([]);

    const m = 24;

    if (courtType === "half") {
      // --- VERTICAL HALF COURT (Basket at top, half-court line at bottom) ---
      const L = m;
      const R = width - m;
      const T = m;
      const B = height - m;
      const courtW = R - L;
      const courtH = B - T;
      const cx = width / 2;

      // Outer boundary
      ctx.strokeRect(L, T, courtW, courtH);

      // Key / Paint (centered at top baseline)
      const keyW = 104;
      const keyH = 148;
      const ftRadius = keyW / 2; // 52px - flush with key edges
      ctx.strokeRect(cx - keyW / 2, T, keyW, keyH);

      // Free-throw semicircle (solid bottom half outside key)
      ctx.beginPath();
      ctx.arc(cx, T + keyH, ftRadius, 0, Math.PI, false);
      ctx.stroke();

      // Free-throw semicircle (dashed top half inside key)
      ctx.beginPath();
      ctx.setLineDash([5, 5]);
      ctx.arc(cx, T + keyH, ftRadius, Math.PI, Math.PI * 2, false);
      ctx.stroke();
      ctx.setLineDash([]);

      // Backboard & Rim
      const backboardY = T + 26;
      const hoopY = T + 37;
      ctx.beginPath();
      ctx.moveTo(cx - 22, backboardY);
      ctx.lineTo(cx + 22, backboardY);
      ctx.moveTo(cx, backboardY);
      ctx.lineTo(cx, hoopY - 8);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cx, hoopY, 8, 0, Math.PI * 2);
      ctx.stroke();

      // 3-Point Line (centered at hoop, wraps cleanly outside the free-throw circle)
      const r3 = 188;
      const theta = 0.36; // Join angle in radians
      const dx = r3 * Math.cos(theta);
      const dy = r3 * Math.sin(theta);

      ctx.beginPath();
      ctx.moveTo(cx + dx, T); // Top-right corner on baseline
      ctx.lineTo(cx + dx, hoopY + dy); // Straight down right corner
      ctx.arc(cx, hoopY, r3, theta, Math.PI - theta, false); // Smooth arc around key
      ctx.lineTo(cx - dx, T); // Straight up left corner to baseline
      ctx.stroke();

      // Center circle semicircle at bottom half-court line
      ctx.beginPath();
      ctx.arc(cx, B, 46, Math.PI, Math.PI * 2, false);
      ctx.stroke();
    } else if (courtType === "full") {
      // --- HORIZONTAL FULL COURT ---
      const L = m;
      const R = width - m;
      const T = m;
      const B = height - m;
      const courtW = R - L;
      const courtH = B - T;
      const cx = width / 2;
      const cy = height / 2;

      // Outer boundary
      ctx.strokeRect(L, T, courtW, courtH);

      // Center line & center circle
      ctx.beginPath();
      ctx.moveTo(cx, T);
      ctx.lineTo(cx, B);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cx, cy, 36, 0, Math.PI * 2);
      ctx.stroke();

      const keyLen = 112;
      const keySpan = 76;
      const ftRadius = keySpan / 2; // 38px - flush with key top/bottom
      const r3 = 140;
      const theta = 1.22; // Join angle in radians
      const dx = r3 * Math.cos(theta);
      const dy = r3 * Math.sin(theta);

      // --- LEFT HALF ---
      const hoopLX = L + 30;
      ctx.strokeRect(L, cy - keySpan / 2, keyLen, keySpan);

      // Left Free-throw circle (solid right half, dashed left half)
      ctx.beginPath();
      ctx.arc(L + keyLen, cy, ftRadius, -Math.PI / 2, Math.PI / 2, false);
      ctx.stroke();

      ctx.beginPath();
      ctx.setLineDash([4, 4]);
      ctx.arc(L + keyLen, cy, ftRadius, Math.PI / 2, (3 * Math.PI) / 2, false);
      ctx.stroke();
      ctx.setLineDash([]);

      // Left Backboard & Rim
      ctx.beginPath();
      ctx.moveTo(L + 20, cy - 18);
      ctx.lineTo(
