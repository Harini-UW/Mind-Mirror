import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { personaList, PersonaId } from "@/lib/personas";
import PersonaCard from "@/components/PersonaCard";
import duckMascot from "@/assets/duck-mascot.png";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const Index = () => {
  const navigate = useNavigate();
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowHowItWorks(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleSelectPersona = (id: PersonaId) => {
    navigate(`/chat/${id}`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 relative overflow-hidden">
      {/* Decorative pixel grid pattern */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `repeating-linear-gradient(0deg, hsl(var(--border)) 0px, transparent 1px, transparent 16px),
                          repeating-linear-gradient(90deg, hsl(var(--border)) 0px, transparent 1px, transparent 16px)`,
      }} />

      <div className="relative z-10 flex flex-col items-center py-4">
        {/* Duck mascot */}
        <img
          src={duckMascot}
          alt="Captain Quack"
          className="w-24 h-24 object-contain mb-3 animate-float drop-shadow-lg"
        />

        {/* Title block styled like a retro catalog header */}
        <div className="pixel-border bg-card px-10 py-4 mb-4 text-center">
          <h1 className="font-pixel font-bold text-2xl md:text-4xl text-primary mb-2 leading-relaxed">
            Mind Mirror
          </h1>
          <p className="font-retro font-bold text-4xl text-muted-foreground">
            ✦ Choose your guide to deeper thinking ✦
          </p>
        </div>

        {/* Persona cards in a catalog-style grid */}
        <div className="flex flex-wrap justify-center gap-6 my-4">
          {personaList.map((persona) => (
            <PersonaCard
              key={persona.id}
              persona={persona}
              onClick={() => handleSelectPersona(persona.id)}
            />
          ))}
        </div>

        {/* Footer tagline */}
        <div className="pixel-border bg-card/80 px-8 py-3 mt-3">
          <p className="font-retro font-bold text-3xl text-muted-foreground text-center max-w-xl">
            Each persona asks probing questions — never gives answers.
            <br />
            ★ Uncover the roots of your own thinking ★
          </p>
        </div>
      </div>

      {/* How It Works Dialog */}
      <Dialog open={showHowItWorks} onOpenChange={setShowHowItWorks}>
        <DialogContent className="max-w-3xl bg-card/95 backdrop-blur-md pixel-border p-0">
          <div className="px-8 py-8">
            <h2 className="font-pixel text-4xl text-primary mb-8 text-center">
              How It Works
            </h2>

            <ol className="space-y-5 font-retro text-2xl text-gray-800 leading-relaxed list-decimal list-inside pl-2">
              <li>
                The agent has been intentionally restricted to only ask questions, it will not provide answers, opinions, or conclusions.
              </li>

              <li>
                Personas are designed for different styles and tones of probing: <span className="font-semibold">Creative</span>, <span className="font-semibold">Critical</span>, and <span className="font-semibold">Curious</span>.
              </li>

              <li>
                If the agent goes off track, press <span className="font-semibold">"Redirect"</span>; if it repeats, press <span className="font-semibold">"Don't Repeat."</span>
              </li>

              <li>
                At the end, your knowledge will be summarized and a mind map can be generated to visualize.
              </li>

              <li>
                Click the duck icon to close the duck pop-up.
              </li>

              <li>
                Click <span className="font-semibold">"Pause"</span> to Pause and Resume your chat.
              </li>

              <li className="text-destructive font-semibold">
                ⚠ If the website is closed or refreshed, all data will be lost.
              </li>
            </ol>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
