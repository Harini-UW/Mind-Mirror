import { MessageSquare, Map, FileText } from "lucide-react";

export type ActiveTab = "chat" | "mindmap" | "summary";

interface TabNavigationProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  personaColorClass: string;
}

const tabs: { id: ActiveTab; label: string; icon: typeof MessageSquare }[] = [
  { id: "chat", label: "Chat", icon: MessageSquare },
  { id: "mindmap", label: "Mind Map", icon: Map },
  { id: "summary", label: "Summary", icon: FileText },
];

const TabNavigation = ({ activeTab, onTabChange, personaColorClass }: TabNavigationProps) => {
  return (
    <div className="flex border-t border-border/50 bg-card/70 backdrop-blur-sm">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2 font-pixel text-[8px] transition-all border-t-2 ${
              isActive
                ? `${personaColorClass} border-current`
                : "text-muted-foreground border-transparent hover:text-foreground"
            }`}
          >
            <Icon className="w-4 h-4" />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};

export default TabNavigation;
