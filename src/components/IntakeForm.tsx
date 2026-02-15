// bring in state tracking tools
import { useState } from "react";
// bring in button component
import { Button } from "@/components/ui/button";

// what this form needs to work
interface IntakeFormProps {
  onSubmit: (intakeData: string) => void; // what to do when submitted
  personaColor: string;                    // what color to use
}

// form that asks about writing project
const IntakeForm = ({ onSubmit, personaColor }: IntakeFormProps) => {
  // track what user types in fields
  const [textType, setTextType] = useState("");
  const [topicGenre, setTopicGenre] = useState("");
  const [progress, setProgress] = useState("");
  const [lastWritten, setLastWritten] = useState("");

  // when user clicks start conversation
  const handleSubmit = () => {
    // check all fields have something
    if (!textType.trim() || !topicGenre.trim() || !progress.trim() || !lastWritten.trim()) {
      return; // stop if any empty
    }

    // combine all answers into one message
    const intakeMessage = `Type: ${textType.trim()}
Topic/Genre: ${topicGenre.trim()}
Progress: ${progress.trim()}
Last Written: ${lastWritten.trim()}`;

    // send combined message to chat
    onSubmit(intakeMessage);
  };

  // check if all four fields filled
  const allFieldsFilled = textType.trim() && topicGenre.trim() && progress.trim() && lastWritten.trim();

  return (
    <div className="flex flex-col items-center mb-4 mt-2">
      <div className="bg-white/40 backdrop-blur-sm px-8 py-5 pixel-border max-w-xl w-full">
        <h2 className="font-pixel text-xl mb-3 text-center" style={{ color: personaColor }}>
          Let's get started
        </h2>
        <p className="font-retro text-xl text-gray-700 mb-5 text-center">
          Tell me about your writing project
        </p>

        <div className="space-y-3">
          <div>
            <label className="font-retro text-lg text-gray-700 block mb-1">
              What type of text are you working on?
            </label>
            <input
              type="text"
              value={textType}
              onChange={(e) => setTextType(e.target.value)}
              placeholder="[novel, essay, screenplay, blog post]"
              className="w-full bg-secondary/60 border border-border px-3 py-2 font-retro text-xl text-gray-800 placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="font-retro text-lg text-gray-700 block mb-1">
              What topic/genre are you working on?
            </label>
            <input
              type="text"
              value={topicGenre}
              onChange={(e) => setTopicGenre(e.target.value)}
              placeholder="[sci-fi, romance, technical documentation]"
              className="w-full bg-secondary/60 border border-border px-3 py-2 font-retro text-xl text-gray-800 placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="font-retro text-lg text-gray-700 block mb-1">
              How much have you written so far?
            </label>
            <input
              type="text"
              value={progress}
              onChange={(e) => setProgress(e.target.value)}
              placeholder="[5 pages, 3 chapters, outline only]"
              className="w-full bg-secondary/60 border border-border px-3 py-2 font-retro text-xl text-gray-800 placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="font-retro text-lg text-gray-700 block mb-1">
              How long has it been since you last wrote something?
            </label>
            <input
              type="text"
              value={lastWritten}
              onChange={(e) => setLastWritten(e.target.value)}
              placeholder="[2 weeks, 3 months, yesterday]"
              className="w-full bg-secondary/60 border border-border px-3 py-2 font-retro text-xl text-gray-800 placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!allFieldsFilled}
          className="w-full mt-5 font-retro text-2xl py-3"
        >
          Start Conversation
        </Button>
      </div>
    </div>
  );
};

export default IntakeForm;
