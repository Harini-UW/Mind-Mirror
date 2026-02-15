import { Ban, Shuffle, Pause, Play } from "lucide-react";

interface UserChecksProps {
  dontRepeat: boolean;
  isPaused: boolean;
  onDontRepeat: () => void;
  onRedirect: () => void;
  onPauseToggle: () => void;
}

const UserChecks = ({
  dontRepeat,
  isPaused,
  onDontRepeat,
  onRedirect,
  onPauseToggle,
}: UserChecksProps) => {
  return (
    <div className="flex items-center justify-center gap-3 px-3 py-2 border-t border-border/50 bg-card/70 backdrop-blur-sm">
      <button
        onClick={onDontRepeat}
        className={`flex items-center gap-1.5 px-3 py-1.5 font-retro text-sm border-2 border-border transition-all active:translate-y-0.5 ${
          dontRepeat
            ? "bg-primary/20 text-primary border-primary"
            : "bg-card text-muted-foreground hover:text-foreground"
        }`}
      >
        <Ban className="w-3.5 h-3.5" />
        Don't Repeat
      </button>

      <button
        onClick={onRedirect}
        className="flex items-center gap-1.5 px-3 py-1.5 font-retro text-sm border-2 border-border bg-card text-muted-foreground hover:text-foreground transition-all active:translate-y-0.5 active:bg-accent/20"
      >
        <Shuffle className="w-3.5 h-3.5" />
        Redirect
      </button>

      <button
        onClick={onPauseToggle}
        className={`flex items-center gap-1.5 px-3 py-1.5 font-retro text-sm border-2 border-border transition-all active:translate-y-0.5 ${
          isPaused
            ? "bg-destructive/20 text-destructive border-destructive"
            : "bg-card text-muted-foreground hover:text-foreground"
        }`}
      >
        {isPaused ? (
          <>
            <Play className="w-3.5 h-3.5" />
            Resume
          </>
        ) : (
          <>
            <Pause className="w-3.5 h-3.5" />
            Pause
          </>
        )}
      </button>
    </div>
  );
};

export default UserChecks;
