// bring in state tracking tool
import { useState } from "react";
// bring in button component
import { Button } from "@/components/ui/button";
// bring in button icons
import { Map, Download, RotateCcw } from "lucide-react";
// bring in ai summary tool
import { Msg, generateSummary } from "@/lib/streamChat";
// bring in popup message tool
import { toast } from "sonner";
import type { ActiveTab } from "@/components/TabNavigation";

// what this view needs to work
interface SummaryViewProps {
  messages: Msg[];         // all chat messages
  onViewMindMap: () => void; // go to mind map
  onNewSession: () => void;  // start fresh chat
}

// what summary data looks like
interface SummaryData {
  startingPoint: string;   // how user started
  assumptions: string[];   // insights found
  endResult: string;       // where user ended
}

// page showing chat summary
const SummaryView = ({ messages, onViewMindMap, onNewSession }: SummaryViewProps) => {
  // remember summary data
  const [summary, setSummary] = useState<SummaryData | null>(null);
  // remember if ai is thinking
  const [isLoading, setIsLoading] = useState(false);

  // create summary from chat messages
  const handleGenerate = async () => {
    // stop if not enough messages
    if (messages.length < 2) {
      toast.error("Have a conversation first before generating a summary.");
      return;
    }
    // show thinking state
    setIsLoading(true);
    try {
      // ask ai to make summary
      const data = await generateSummary(messages);
      // save summary
      setSummary(data);
    } catch (err) {
      // show error if failed
      toast.error("Failed to generate summary. Please try again.");
    } finally {
      // hide thinking state
      setIsLoading(false);
    }
  };

  // copy summary to clipboard
  const handleExport = () => {
    // stop if no summary yet
    if (!summary) return;
    // make text version of summary
    const text = `SESSION SUMMARY\n\nWhat You Started With:\n${summary.startingPoint}\n\nAssumptions Uncovered:\n${summary.assumptions.map((a) => `- ${a}`).join("\n")}\n\nWhere You Arrived:\n${summary.endResult}`;
    // copy to clipboard
    navigator.clipboard.writeText(text);
    // show success message
    toast.success("Summary copied to clipboard!");
  };

  // show button if no summary yet
  if (!summary) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="pixel-border bg-card/80 backdrop-blur-sm px-8 py-6 text-center">
          <h2 className="font-pixel text-xs text-primary mb-3">Session Summary</h2>
          <p className="font-retro text-lg text-muted-foreground mb-4">
            Generate a summary of your conversation to see your progress.
          </p>
          <Button
            onClick={handleGenerate}
            disabled={isLoading || messages.length < 2}
            className="font-retro text-lg px-6"
          >
            {isLoading ? "Generating..." : "Generate Summary"}
          </Button>
        </div>
      </div>
    );
  }

  // show summary in three boxes
  return (
    <div className="flex-1 overflow-y-auto px-4 py-4">
      <div className="max-w-lg mx-auto space-y-4">
        <h2 className="font-pixel text-xs text-primary text-center mb-4">Session Summary</h2>

        {/* first box shows starting point */}
        <div className="pixel-border bg-card/80 backdrop-blur-sm px-5 py-4">
          <h3 className="font-pixel text-[8px] text-foreground mb-2">What You Started With</h3>
          <p className="font-retro text-lg text-muted-foreground">{summary.startingPoint}</p>
        </div>

        {/* second box shows insights found */}
        <div className="pixel-border bg-card/80 backdrop-blur-sm px-5 py-4">
          <h3 className="font-pixel text-[8px] text-foreground mb-2">Assumptions Uncovered</h3>
          <ul className="space-y-1">
            {summary.assumptions.map((item, i) => (
              <li key={i} className="font-retro text-lg text-muted-foreground flex gap-2">
                <span className="text-primary">*</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* third box shows ending point */}
        <div className="pixel-border bg-card/80 backdrop-blur-sm px-5 py-4">
          <h3 className="font-pixel text-[8px] text-foreground mb-2">Where You Arrived</h3>
          <p className="font-retro text-lg text-muted-foreground">{summary.endResult}</p>
        </div>

        {/* three action buttons */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <Button variant="ghost" onClick={onViewMindMap} className="font-retro text-sm gap-1">
            <Map className="w-4 h-4" /> Mind Map
          </Button>
          <Button variant="ghost" onClick={handleExport} className="font-retro text-sm gap-1">
            <Download className="w-4 h-4" /> Export
          </Button>
          <Button variant="ghost" onClick={onNewSession} className="font-retro text-sm gap-1">
            <RotateCcw className="w-4 h-4" /> New Session
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SummaryView;
