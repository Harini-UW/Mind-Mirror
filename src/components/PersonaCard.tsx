import { Persona } from "@/lib/personas";

interface PersonaCardProps {
  persona: Persona;
  onClick: () => void;
}

const PersonaCard = ({ persona, onClick }: PersonaCardProps) => {
  const isDetective = persona.id === "detective";

  return (
    <button
      onClick={onClick}
      className="group relative w-36 pixel-border pixel-shadow overflow-hidden transition-transform hover:scale-105 hover:-translate-y-1 active:translate-y-0 active:shadow-none"
    >
      <div className="relative h-52">
        <img
          src={persona.avatar}
          alt={persona.name}
          className="w-full h-full object-cover object-center"
        />
        {/* Tint overlay for light avatar backgrounds */}
        {isDetective && (
          <div className="absolute inset-0 bg-purple-950/40" />
        )}
        {/* Gradient overlay at bottom for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        {/* Text overlaid on image */}
        <div className="absolute bottom-0 left-0 right-0 p-2 text-center">
          <h3 className={`font-pixel text-[8px] leading-tight ${persona.colorClass} mb-1 drop-shadow-md`}>
            {persona.name}
          </h3>
          <p className="font-retro text-xs text-white/80 leading-tight drop-shadow-sm">
            {persona.title}
          </p>
        </div>
      </div>
    </button>
  );
};

export default PersonaCard;
