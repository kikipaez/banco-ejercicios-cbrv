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
    const L = m;
    const R = width - m;
    const T = m;
    const B = height - m;
    const courtW = R - L;
    const courtH = B - T;
    const cx = width / 2;
    const cy = height / 2;

    if (courtType === "half") {
      ctx.strokeRect(L, T, courtW, courtH);

      const keyW = 104;
      const keyH = 148;
      const ftRadius = keyW / 2;
      ctx.strokeRect(cx - keyW / 2, T, keyW, keyH);

      ctx.beginPath();
      ctx.arc(cx, T + keyH, ftRadius, 0, Math.PI, false);
      ctx.stroke();

      ctx.beginPath();
      ctx.setLineDash([5, 5]);
      ctx.arc(cx, T + keyH, ftRadius, Math.PI, Math.PI * 2, false);
      ctx.stroke();
      ctx.setLineDash([]);

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

      const r3 = 188;
      const theta = 0.36;
      const dx = r3 * Math.cos(theta);
      const dy = r3 * Math.sin(theta);

      ctx.beginPath();
      ctx.moveTo(cx + dx, T);
      ctx.lineTo(cx + dx, hoopY + dy);
      ctx.arc(cx, hoopY, r3, theta, Math.PI - theta, false);
      ctx.lineTo(cx - dx, T);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cx, B, 46, Math.PI, Math.PI * 2, false);
      ctx.stroke();
    } else if (courtType === "full") {
      ctx.strokeRect(L, T, courtW, courtH);

      ctx.beginPath();
      ctx.moveTo(cx, T);
      ctx.lineTo(cx, B);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cx, cy, 36, 0, Math.PI * 2);
      ctx.stroke();

      const keyLen = 112;
      const keySpan = 76;
      const ftRadius = keySpan / 2;
      const r3 = 140;
      const theta = 1.22;
      const dx = r3 * Math.cos(theta);
      const dy = r3 * Math.sin(theta);

      // Left side
      const hoopLX = L + 30;
      ctx.strokeRect(L, cy - keySpan / 2, keyLen, keySpan);
      ctx.beginPath();
      ctx.arc(L + keyLen, cy, ftRadius, -Math.PI / 2, Math.PI / 2, false);
      ctx.stroke();
      ctx.beginPath();
      ctx.setLineDash([4, 4]);
      ctx.arc(L + keyLen, cy, ftRadius, Math.PI / 2, (3 * Math.PI) / 2, false);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.beginPath();
      ctx.moveTo(L + 20, cy - 18);
      ctx.lineTo(L + 20, cy + 18);
      ctx.moveTo(L + 20, cy);
      ctx.lineTo(hoopLX - 7, cy);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(hoopLX, cy, 7, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(L, cy - dy);
      ctx.lineTo(hoopLX + dx, cy - dy);
      ctx.arc(hoopLX, cy, r3, -theta, theta, false);
      ctx.lineTo(L, cy + dy);
      ctx.stroke();

      // Right side
      const hoopRX = R - 30;
      ctx.strokeRect(R - keyLen, cy - keySpan / 2, keyLen, keySpan);
      ctx.beginPath();
      ctx.arc(R - keyLen, cy, ftRadius, Math.PI / 2, (3 * Math.PI) / 2, false);
      ctx.stroke();
      ctx.beginPath();
      ctx.setLineDash([4, 4]);
      ctx.arc(R - keyLen, cy, ftRadius, -Math.PI / 2, Math.PI / 2, false);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.beginPath();
      ctx.moveTo(R - 20, cy - 18);
      ctx.lineTo(R - 20, cy + 18);
      ctx.moveTo(R - 20, cy);
      ctx.lineTo(hoopRX + 7, cy);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(hoopRX, cy, 7, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(R, cy + dy);
      ctx.lineTo(hoopRX - dx, cy + dy);
      ctx.arc(hoopRX, cy, r3, Math.PI - theta, Math.PI + theta, false);
      ctx.lineTo(R, cy - dy);
      ctx.stroke();
    }
  };

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#1e293b";
    ctx.fillRect(0, 0, width, height);

    if (courtType !== "blank") {
      drawCourtLines(ctx);
    }

    ctx.strokeStyle = "#fbbf24";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    strokes.forEach((stroke) => {
      if (stroke.length < 2) return;
      ctx.beginPath();
      ctx.moveTo(stroke[0].x, stroke[0].y);
      for (let i = 1; i < stroke.length; i++) {
        ctx.lineTo(stroke[i].x, stroke[i].y);
      }
      ctx.stroke();
    });

    tokens.forEach((token) => {
      ctx.beginPath();
      ctx.arc(token.x, token.y, 15, 0, Math.PI * 2);
      ctx.fillStyle = token.type === "O" ? "#3b82f6" : "#ef4444";
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#ffffff";
      ctx.stroke();

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 13px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(token.type, token.x, token.y);
    });
  };

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const eraseAt = (x: number, y: number) => {
    setTokens((prev) => prev.filter((t) => Math.hypot(t.x - x, t.y - y) > 20));
    setStrokes((prev) => prev.filter((s) => !s.some((pt) => Math.hypot(pt.x - x, pt.y - y) < 18)));
  };

  const startAction = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const { x, y } = getCoordinates(e);
    if (tool === "token") {
      const clicked = tokens.find((t) => Math.hypot(t.x - x, t.y - y) < 20);
      if (clicked) {
        setDraggingTokenId(clicked.id);
      } else {
        setTokens((prev) => [...prev, { id: crypto.randomUUID(), type: selectedTokenType, x, y }]);
      }
      return;
    }
    if (tool === "eraser") {
      setIsDrawing(true);
      eraseAt(x, y);
      return;
    }
    setIsDrawing(true);
    setStrokes((prev) => [...prev, [{ x, y }]]);
  };

  const moveAction = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const { x, y } = getCoordinates(e);
    if (draggingTokenId) {
      setTokens((prev) => prev.map((t) => (t.id === draggingTokenId ? { ...t, x, y } : t)));
      return;
    }
    if (!isDrawing) return;
    if (tool === "eraser") {
      eraseAt(x, y);
      return;
    }
    if (tool === "pen") {
      setStrokes((prev) => {
        if (prev.length === 0) return prev;
        const updated = [...prev];
        updated[updated.length - 1] = [...updated[updated.length - 1], { x, y }];
        return updated;
      });
    }
  };

  const stopAction = () => {
    setIsDrawing(false);
    setDraggingTokenId(null);
  };

  const clearCanvas = () => {
    setTokens([]);
    setStrokes([]);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    onSave(canvas.toDataURL("image/png"));
  };

  return (
    <div className="flex flex-col items-center space-y-3 rounded-xl border border-slate-800 bg-slate-900 p-4 shadow-lg">
      <div className="flex w-full flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <Button type="button" size="sm" variant={courtType === "half" ? "default" : "outline"} onClick={() => setCourtType("half")} className="h-8 text-xs">
            Media Pista (Vertical)
          </Button>
          <Button type="button" size="sm" variant={courtType === "full" ? "default" : "outline"} onClick={() => setCourtType("full")} className="h-8 text-xs">
            Pista Completa (Horizontal)
          </Button>
          <Button type="button" size="sm" variant={courtType === "blank" ? "default" : "outline"} onClick={() => setCourtType("blank")} className="h-8 text-xs">
            Sin Líneas
          </Button>
        </div>

        <div className="flex items-center gap-1">
          <Button type="button" size="sm" variant={tool === "pen" ? "default" : "outline"} onClick={() => setTool("pen")} className="h-8 gap-1 text-xs">
            <Pencil className="h-3.5 w-3.5" /> Lápiz
          </Button>
          <Button
            type="button"
            size="sm"
            variant={tool === "token" && selectedTokenType === "O" ? "default" : "outline"}
            onClick={() => {
              setTool("token");
              setSelectedTokenType("O");
            }}
            className="h-8 gap-1 text-xs"
          >
            <User className="h-3.5 w-3.5 text-blue-400" /> +O
          </Button>
          <Button
            type="button"
            size="sm"
            variant={tool === "token" && selectedTokenType === "X" ? "default" : "outline"}
            onClick={() => {
              setTool("token");
              setSelectedTokenType("X");
            }}
            className="h-8 gap-1 text-xs"
          >
            <Shield className="h-3.5 w-3.5 text-red-400" /> +X
          </Button>
          <Button type="button" size="sm" variant={tool === "eraser" ? "default" : "outline"} onClick={() => setTool("eraser")} className="h-8 gap-1 text-xs">
            <Eraser className="h-3.5 w-3.5" /> Borrador
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={clearCanvas} className="h-8 text-xs text-red-400 hover:text-red-300">
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-center overflow-hidden rounded-lg border border-slate-700 bg-slate-950">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          onMouseDown={startAction}
          onMouseUp={stopAction}
          onMouseLeave={stopAction}
          onMouseMove={moveAction}
          onTouchStart={startAction}
          onTouchEnd={stopAction}
          onTouchMove={moveAction}
          className="h-auto max-w-full cursor-crosshair touch-none"
        />
      </div>
      <p className="text-xs text-slate-400">
        {tool === "token"
          ? "💡 Haz clic en la pista para colocar X/O o arrástralos para moverlos."
          : tool === "eraser"
            ? "💡 Pasa el borrador sobre líneas o jugadores para eliminarlos sin borrar la pista."
            : "💡 Dibuja trayectorias con el lápiz."}
      </p>

      <Button type="button" onClick={handleSave} className="w-full bg-amber-400 font-semibold text-slate-950 hover:bg-amber-500">
        <Save className="mr-2 h-4 w-4" /> Guardar Diagrama en el Ejercicio
      </Button>
    </div>
  );
}
