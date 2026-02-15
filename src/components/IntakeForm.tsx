import { useState } from "react";
import { Button } from "@/components/ui/button";

interface IntakeFormProps {
  onSubmit: (intakeData: string) => void;
  personaColor: string;
}

const IntakeForm = ({ onSubmit, personaColor }: IntakeFormProps) => {
  const [textType, setTextType] = useState("");
  const [topicGenre, setTopicGenre] = useState("");
  const [progress, setProgress] = useState("");
  const [lastWritten, setLastWritten] = useState("");

  const handleSubmit = () => {
    if (!textType.trim() || !topicGenre.trim() || !progress.trim() || !lastWritten.trim()) {
      return; // All fields required
    }

    const intakeMessage = `Type: ${textType.trim()}
Topic/Genre: ${topicGenre.trim()}
Progress: ${progress.trim()}
Last Written: ${lastWritten.trim()}`;

    onSubmit(intakeMessage);
  };

  const allFieldsFilled = textType.trim() && topicGenre.trim() && progress.trim() && lastWritten.trim();

  return (
    <div className="flex flex-col items-center mb-8 mt-4">
      <div className="bg-white/40 backdrop-blur-sm px-8 py-6 pixel-border max-w-lg w-full">
        <h2 className="font-pixel text-sm mb-4 text-center" style={{ color: personaColor }}>
          Let's get started
        </h2>
        <p className="font-retro text-base text-foreground/70 mb-6 text-center">
          Tell me about your writing project
        </p>

        <div className="space-y-4">
          <div>
            <label className="font-retro text-sm text-foreground/80 block mb-1">
              What type of text are you working on?
            </label>
            <input
              type="text"
              value={textType}
              onChange={(e) => setTextType(e.target.value)}
              placeholder="[novel, essay, screenplay, blog post]"
              className="w-full bg-secondary/60 border border-border px-3 py-2 font-retro text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="font-retro text-sm text-foreground/80 block mb-1">
              What topic/genre are you working on?
            </label>
            <input
              type="text"
              value={topicGenre}
              onChange={(e) => setTopicGenre(e.target.value)}
              placeholder="[sci-fi, romance, technical documentation]"
              className="w-full bg-secondary/60 border border-border px-3 py-2 font-retro text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="font-retro text-sm text-foreground/80 block mb-1">
              How much have you written so far?
            </label>
            <input
              type="text"
              value={progress}
              onChange={(e) => setProgress(e.target.value)}
              placeholder="[5 pages, 3 chapters, outline only]"
              className="w-full bg-secondary/60 border border-border px-3 py-2 font-retro text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="font-retro text-sm text-foreground/80 block mb-1">
              How long has it been since you last wrote something?
            </label>
            <input
              type="text"
              value={lastWritten}
              onChange={(e) => setLastWritten(e.target.value)}
              placeholder="[2 weeks, 3 months, yesterday]"
              className="w-full bg-secondary/60 border border-border px-3 py-2 font-retro text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!allFieldsFilled}
          className="w-full mt-6 font-retro text-lg"
        >
          Start Conversation
        </Button>
      </div>
    </div>
  );
};

export default IntakeForm;
