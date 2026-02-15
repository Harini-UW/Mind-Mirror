import duckMascot from "@/assets/duck-mascot.png";

interface DuckPopupProps {
  quote: string;
  visible: boolean;
  onDismiss: () => void;
}

const DuckPopup = ({ quote, visible, onDismiss }: DuckPopupProps) => {
  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onDismiss}
    >
      {/* Dimmed backdrop */}
      <div className="absolute inset-0 bg-black/30" />

      {/* Duck + speech bubble */}
      <div className="relative flex flex-col items-center animate-in fade-in zoom-in duration-300">
        {/* Speech bubble */}
        <div className="relative bg-card pixel-border px-6 py-4 mb-3 max-w-xs text-center">
          <p className="font-retro text-xl text-foreground leading-snug">
            {quote}
          </p>
          {/* Speech bubble tail */}
          <div
            className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-0 h-0"
            style={{
              borderLeft: "10px solid transparent",
              borderRight: "10px solid transparent",
              borderTop: "12px solid hsl(var(--border))",
            }}
          />
          <div
            className="absolute -bottom-[9px] left-1/2 -translate-x-1/2 w-0 h-0"
            style={{
              borderLeft: "8px solid transparent",
              borderRight: "8px solid transparent",
              borderTop: "10px solid hsl(var(--card))",
            }}
          />
        </div>

        {/* Large duck */}
        <div className="relative">
          <img
            src={duckMascot}
            alt="Captain Quack"
            className="w-32 h-32 object-contain drop-shadow-lg animate-float"
          />
        </div>
      </div>
    </div>
  );
};

export default DuckPopup;
