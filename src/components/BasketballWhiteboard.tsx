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

export function BasketballWhiteboard({ onSave }: BasketballWhiteboardProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [courtType, setCourtType] = useState<"half" | "full" | "blank">("half");
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<"pen" | "eraser" | "token">("pen");
  const [selectedTokenType, setSelectedTokenType] = useState<"X" | "O">("O");
  const [tokens, setTokens] = useState<Token[]>([]);
  const [draggingTokenId, setDraggingTokenId] = useState<string | null>(null);

  const width = 600;
  const height = 350;

  useEffect(() => {
    redrawCanvas();
  }, [courtType, tokens]);

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Background
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(0, 0, width, height);

    if (courtType !== "blank") {
      ctx.strokeStyle = "#94a3b8";
      ctx.lineWidth = 2;

      if (courtType === "half") {
        const marginX = 80;
        const topY = 20;
        const bottomY = height - 20;
        const courtWidth = width - marginX * 2;

        // Half court outer box (Baseline at top, Sidelines, Half-court line at bottom)
        ctx.strokeRect(marginX, topY, courtWidth, bottomY - topY);

        const centerX = width / 2;
        const keyWidth = 120;
        const keyHeight = 110;

        // Key / Paint (from top baseline downwards)
        ctx.strokeRect(centerX - keyWidth / 2, topY, keyWidth, keyHeight);

        // Free throw semicircle (facing down into the court)
        ctx.beginPath();
        ctx.arc(centerX, topY + keyHeight, 45, 0, Math.PI, false);
        ctx.stroke();

        // Free throw dashed-style line simulation inside key
        ctx.beginPath();
        ctx.setLineDash([4, 4]);
        ctx.arc(centerX, topY + keyHeight, 45, Math.PI, 0, false);
        ctx.stroke();
        ctx.setLineDash([]);

        // 3-point arc
        ctx.beginPath();
        // Corner straight lines of 3pt line
        ctx.moveTo(marginX + 20, topY);
        ctx.lineTo(marginX + 20, topY + 50);
        ctx.moveTo(width - marginX - 20, topY);
        ctx.lineTo(width - marginX - 20, topY + 50);
        // Arc
        ctx.arc(centerX, topY + 15, 130, 0.15 * Math.PI, 0.85 * Math.PI, false);
        ctx.stroke();

        // Basket & Backboard
        ctx.beginPath();
        ctx.moveTo(centerX - 25, topY + 10);
        ctx.lineTo(centerX + 25, topY + 10);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(centerX, topY + 25, 10, 0, Math.PI * 2);
        ctx.stroke();

        // Half court line at the bottom with center circle arc snippet
        ctx.beginPath();
        ctx.arc(centerX, bottomY, 40, Math.PI, 0, false);
        ctx.stroke();

      } else if (courtType === "full") {
        const margin = 30;
        ctx.strokeRect(margin, margin, width - margin * 2, height - margin * 2);

        // Center line
        ctx.beginPath();
        ctx.moveTo(width / 2, margin);
        ctx.lineTo(width / 2, height - margin);
        ctx.stroke();

        // Center circle
        ctx.beginPath();
        ctx.arc(width / 2, height / 2, 35, 0, Math.PI * 2);
        ctx.stroke();

        // Left Key / Paint
        const keyWidth = 90;
        const keyHeight = 70;
        ctx.strokeRect(margin, height / 2 - keyHeight / 2, keyWidth, keyHeight);

        // Left Free throw arc
        ctx.beginPath();
        ctx.arc(margin + keyWidth, height / 2, 35, Math.PI * 1.5, Math.PI * 0.5, false);
        ctx.stroke();

        // Left Basket
        ctx.beginPath();
        ctx.arc(margin + 15, height / 2, 10, 0, Math.PI * 2);
        ctx.stroke();

        // Right Key / Paint
        ctx.strokeRect(width - margin - keyWidth, height / 2 - keyHeight / 2, keyWidth, keyHeight);

        // Right Free throw arc
        ctx.beginPath();
        ctx.arc(width - margin - keyWidth, height / 2, 35, Math.PI * 0.5, Math.PI * 1.5, false);
        ctx.stroke();

        // Right Basket
        ctx.beginPath();
        ctx.arc(width - margin - 15, height / 2, 10, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // Render tokens (X and O)
    tokens.forEach((token) => {
      ctx.beginPath();
      ctx.arc(token.x, token.y, 16, 0, Math.PI * 2);
      ctx.fillStyle = token.type === "O" ? "#3b82f6" : "#ef4444";
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#ffffff";
      ctx.stroke();

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 14px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(token.type, token.x, token.y);
    });
  };

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const startAction = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const { x, y } = getCoordinates(e);

    if (tool === "token") {
      const clickedToken = tokens.find((t) => Math.hypot(t.x - x, t.y - y) < 20);
      if (clickedToken) {
        setDraggingTokenId(clickedToken.id);
      } else {
        const newToken: Token = {
          id: crypto.randomUUID(),
          type: selectedTokenType,
          x,
          y,
        };
        setTokens([...tokens, newToken]);
      }
      return;
    }

    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const moveAction = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const { x, y } = getCoordinates(e);

    if (draggingTokenId) {
      setTokens(tokens.map((t) => (t.id === draggingTokenId ? { ...t, x, y } : t)));
      return;
    }

    if (!isDrawing || tool === "token") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.lineWidth = tool === "eraser" ? 20 : 3;
    ctx.lineCap = "round";
    ctx.strokeStyle = tool === "eraser" ? "#1e293b" : "#fbbf24";

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopAction = () => {
    setIsDrawing(false);
    setDraggingTokenId(null);
  };

  const clearCanvas = () => {
    setTokens([]);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(0, 0, width, height);
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
          <Button
            type="button"
            size="sm"
            variant={courtType === "half" ? "default" : "outline"}
            onClick={() => setCourtType("half")}
            className="h-8 text-xs"
          >
            Media Pista
          </Button>
          <Button
            type="button"
            size="sm"
            variant={courtType === "full" ? "default" : "outline"}
            onClick={() => setCourtType("full")}
            className="h-8 text-xs"
          >
            Pista Completa
          </Button>
          <Button
            type="button"
            size="sm"
            variant={courtType === "blank" ? "default" : "outline"}
            onClick={() => setCourtType("blank")}
            className="h-8 text-xs"
          >
            Sin Líneas
          </Button>
        </div>

        <div className="flex items-center gap-1">
          <Button
            type="button"
            size="sm"
            variant={tool === "pen" ? "default" : "outline"}
            onClick={() => setTool("pen")}
            className="h-8 gap-1 text-xs"
          >
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
          <Button
            type="button"
            size="sm"
            variant={tool === "eraser" ? "default" : "outline"}
            onClick={() => setTool("eraser")}
            className="h-8 gap-1 text-xs"
          >
            <Eraser className="h-3.5 w-3.5" /> Borrador
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={clearCanvas} className="h-8 text-red-400 hover:text-red-300 text-xs">
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-700 bg-slate-950">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          onMouseDown={startAction}
          onMouseUp={stopAction}
          onMouseMove={moveAction}
          onTouchStart={startAction}
          onTouchEnd={stopAction}
          onTouchMove={moveAction}
          className="cursor-crosshair touch-none max-w-full h-auto"
        />
      </div>
      <p className="text-xs text-slate-400">
        {tool === "token" ? "💡 Haz clic en la pista para colocar X/O o arrástralos para moverlos." : "💡 Dibuja trayectorias con el lápiz."}
      </p>

      <Button type="button" onClick={handleSave} className="w-full bg-amber-400 font-semibold text-slate-950 hover:bg-amber-500">
        <Save className="mr-2 h-4 w-4" /> Guardar Diagrama en el Ejercicio
      </Button>
    </div>
  );
}
