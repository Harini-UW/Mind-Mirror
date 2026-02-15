// bring in duck picture
import duckMascot from "@/assets/duck-mascot.png";

// what this popup needs to work
interface DuckPopupProps {
  quote: string;       // message to show
  visible: boolean;    // if should show
  onDismiss: () => void; // what to do when clicked
}

// duck motivation popup that appears sometimes
const DuckPopup = ({ quote, visible, onDismiss }: DuckPopupProps) => {
  // dont show anything if not visible
  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onDismiss}
    >
      {/* dark background behind popup */}
      <div className="absolute inset-0 bg-black/30" />

      {/* duck with speech bubble */}
      <div className="relative flex flex-col items-center animate-in fade-in zoom-in duration-300">
        {/* white bubble with message */}
        <div className="relative bg-card pixel-border px-6 py-4 mb-3 max-w-xs text-center">
          <p className="font-retro text-xl text-foreground leading-snug">
            {quote}
          </p>
          {/* triangle pointing down to duck */}
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

        {/* big duck picture */}
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
