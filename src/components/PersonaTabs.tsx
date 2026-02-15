import { personaList, PersonaId } from "@/lib/personas";

interface PersonaTabsProps {
  activeId: PersonaId;
  onSwitch: (id: PersonaId) => void;
}

const PersonaTabs = ({ activeId, onSwitch }: PersonaTabsProps) => {
  return (
    <div className="flex border-b border-border/50 bg-card/50 backdrop-blur-sm">
      {personaList.map((persona) => (
        <button
          key={persona.id}
          onClick={() => onSwitch(persona.id)}
          className={`flex-1 py-2 font-retro text-sm text-center transition-all border-b-2 ${
            activeId === persona.id
              ? `${persona.colorClass} border-current font-bold`
              : "text-muted-foreground border-transparent hover:text-foreground"
          }`}
        >
          {persona.name}
        </button>
      ))}
    </div>
  );
};

export default PersonaTabs;
