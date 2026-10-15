import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Eraser, Pencil, RotateCcw, Save } from "lucide-react";

export function BasketballWhiteboard({ onSave }: { onSave: (dataUrl: string) => void }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<"pen" | "eraser">("pen");
  const [color, setColor] = useState("#fbbf24"); // Amber for player tactical lines

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Draw half-court background lines
    ctx.fillStyle = "#1e293b"; // Slate background
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 2;

    // 3-point arc & key simulation
    ctx.beginPath();
    ctx.arc(canvas.width / 2, 50, 120, 0, Math.PI);
    ctx.stroke();
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx?.beginPath();
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineWidth = tool === "eraser" ? 20 : 3;
    ctx.lineCap = "round";
    ctx.strokeStyle = tool === "eraser" ? "#1e293b" : color;

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    onSave(canvas.toDataURL("image/png"));
  };

  return (
    <div className="flex flex-col items-center space-y-3 rounded-xl border border-slate-800 bg-slate-900 p-4 shadow-lg">
      <div className="flex w-full items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-200">Pizarra Táctica C.B.R.V</h3>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={tool === "pen" ? "default" : "outline"}
            onClick={() => setTool("pen")}
            className="h-8 gap-1"
          >
            <Pencil className="h-3.5 w-3.5" /> Lápiz
          </Button>
          <Button
            size="sm"
            variant={tool === "eraser" ? "default" : "outline"}
            onClick={() => setTool("eraser")}
            className="h-8 gap-1"
          >
            <Eraser className="h-3.5 w-3.5" /> Borrador
          </Button>
          <Button size="sm" variant="outline" onClick={clearCanvas} className="h-8 text-red-400 hover:text-red-300">
            <RotateCcw className="h-3.5 w-3.5" /> Limpiar
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-700 bg-slate-950">
        <canvas
          ref={canvasRef}
          width={600}
          height={350}
          onMouseDown={startDrawing}
          onMouseUp={stopDrawing}
          onMouseMove={draw}
          onTouchStart={startDrawing}
          onTouchEnd={stopDrawing}
          onTouchMove={draw}
          className="cursor-crosshair touch-none max-w-full h-auto"
        />
      </div>

      <Button onClick={handleSave} className="w-full bg-amber-400 font-semibold text-slate-950 hover:bg-amber-500">
        <Save className="mr-2 h-4 w-4" /> Guardar Diagrama en el Ejercicio
      </Button>
    </div>
  );
}
