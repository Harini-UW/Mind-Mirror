import { X } from "lucide-react";
import duckMascot from "@/assets/duck-mascot.png";

interface DuckBannerProps {
  quote: string;
  visible: boolean;
  onDismiss: () => void;
}

const DuckBanner = ({ quote, visible, onDismiss }: DuckBannerProps) => {
  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ${
        visible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="bg-card border-b-3 border-border px-4 py-2 flex items-center gap-3">
        <img
          src={duckMascot}
          alt="Duck"
          className="w-6 h-6 object-contain animate-bounce"
        />
        <span className="font-retro text-lg text-foreground flex-1 text-center">
          {quote}
        </span>
        <button
          onClick={onDismiss}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default DuckBanner;
