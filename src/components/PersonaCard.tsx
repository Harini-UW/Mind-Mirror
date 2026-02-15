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
      className="group relative w-48 pixel-border pixel-shadow overflow-hidden transition-transform hover:scale-105 hover:-translate-y-1 active:translate-y-0 active:shadow-none"
    >
      <div className="relative h-64">
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
        <div className="absolute bottom-0 left-0 right-0 p-3 text-center">
          <h3 className="font-pixel font-bold text-xs leading-tight text-[hsl(40,50%,95%)] mb-1" style={{ textShadow: '0 0 8px rgba(0,0,0,0.9), 0 2px 4px rgba(0,0,0,0.8), 0 0 2px rgba(0,0,0,1)' }}>
            {persona.name}
          </h3>
          <p className="font-retro font-bold text-base text-white/90 leading-tight" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
            {persona.title}
          </p>
        </div>
      </div>
    </button>
  );
};

export default PersonaCard;
