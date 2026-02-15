import { useNavigate } from "react-router-dom";
import { personaList, PersonaId } from "@/lib/personas";
import PersonaCard from "@/components/PersonaCard";
import duckMascot from "@/assets/duck-mascot.png";

const Index = () => {
  const navigate = useNavigate();

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

      <div className="relative z-10 flex flex-col items-center">
        {/* Duck mascot */}
        <img
          src={duckMascot}
          alt="Captain Quack"
          className="w-20 h-20 object-contain mb-2 animate-float drop-shadow-lg"
        />

        {/* Title block styled like a retro catalog header */}
        <div className="pixel-border bg-card px-8 py-5 mb-3 text-center">
          <h1 className="font-pixel text-lg md:text-2xl text-primary mb-2 leading-relaxed">
            Mind Mirror
          </h1>
          <p className="font-retro text-xl text-muted-foreground">
            ✦ Choose your guide to deeper thinking ✦
          </p>
        </div>

        {/* Persona cards in a catalog-style grid */}
        <div className="flex flex-wrap justify-center gap-5 my-6">
          {personaList.map((persona) => (
            <PersonaCard
              key={persona.id}
              persona={persona}
              onClick={() => handleSelectPersona(persona.id)}
            />
          ))}
        </div>

        {/* Footer tagline */}
        <div className="pixel-border bg-card/80 px-6 py-3 mt-2">
          <p className="font-retro text-base text-muted-foreground text-center max-w-md">
            Each persona asks probing questions — never gives answers.
            <br />
            ★ Uncover the roots of your own thinking ★
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
