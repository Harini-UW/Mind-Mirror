// bring in tab icons
import { MessageSquare, Map, FileText } from "lucide-react";

// three types of tabs available
export type ActiveTab = "chat" | "mindmap" | "summary";

// what this navigation bar needs
interface TabNavigationProps {
  activeTab: ActiveTab;           // which tab is showing
  onTabChange: (tab: ActiveTab) => void; // change tab function
  personaColorClass: string;      // color for active tab
}

// list of all three tabs
const tabs: { id: ActiveTab; label: string; icon: typeof MessageSquare }[] = [
  { id: "chat", label: "Chat", icon: MessageSquare },
  { id: "mindmap", label: "Mind Map", icon: Map },
  { id: "summary", label: "Summary", icon: FileText },
];

// bottom bar with three tabs
const TabNavigation = ({ activeTab, onTabChange, personaColorClass }: TabNavigationProps) => {
  return (
    <div className="flex border-t border-border/50 bg-card/70 backdrop-blur-sm">
      {/* show all three tabs */}
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
