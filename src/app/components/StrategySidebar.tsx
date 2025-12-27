import { StrategyNode } from "./StrategyNode";
import { Strategy } from "../types/strategy";
import { Highlighter } from "./Highlighter";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface StrategySidebarProps {
  strategies: Strategy[];
  selectedStrategyId: string | null;
  onStrategySelect: (id: string) => void;
  onStrategyContextMenu: (e: React.MouseEvent, id: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  className?: string;
}

/**
 * StrategySidebar Component - Collapsible sidebar with strategy list
 * Responsive behavior:
 * - Mobile (<768px): Full width when visible, hidden when detail panel is shown
 * - Tablet (768-1024px): Fixed width 256px (w-64), can collapse to 64px (w-16)
 * - Desktop (>1024px): Fixed width 320px (w-80), can collapse to 64px (w-16)
 * 
 * Uses CSS Grid for flexible layout and smooth transitions
 */
export function StrategySidebar({ 
  strategies, 
  selectedStrategyId, 
  onStrategySelect,
  onStrategyContextMenu,
  isCollapsed,
  onToggleCollapse,
  className = ""
}: StrategySidebarProps) {
  return (
    <aside 
      className={`bg-gray-50 border-r border-gray-200 overflow-y-auto transition-all duration-300 ${className}`}
      role="complementary"
      aria-label="Strategy list sidebar"
    >
      {isCollapsed ? (
        // Collapsed state - narrow rail with only toggle button
        <div className="h-full flex flex-col items-center py-4 md:py-6">
          <button
            onClick={onToggleCollapse}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-label="Expand sidebar"
            title="Expand sidebar"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" strokeWidth={2.5} />
          </button>
        </div>
      ) : (
        // Expanded state - full sidebar with content
        <div className="p-3 sm:p-4 md:p-6 h-full flex flex-col">
          {/* Header with title and collapse button */}
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <h2 className="text-gray-700 text-xs sm:text-sm font-semibold uppercase tracking-wider">
              <Highlighter color="yellow">
                Available Strategies
              </Highlighter>
            </h2>
            <button
              onClick={onToggleCollapse}
              className="hidden md:flex w-8 h-8 items-center justify-center rounded-lg bg-white border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
              aria-label="Collapse sidebar"
              title="Collapse sidebar"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600" strokeWidth={2.5} />
            </button>
          </div>
          
          {/* Strategy list - scrollable */}
          <nav 
            className="space-y-2 sm:space-y-3 md:space-y-4 overflow-y-auto flex-1"
            role="navigation"
            aria-label="Strategy options"
          >
            {strategies.map((strategy) => (
              <StrategyNode
                key={strategy.id}
                id={strategy.id}
                name={strategy.name}
                isSelected={selectedStrategyId === strategy.id}
                onClick={() => onStrategySelect(strategy.id)}
                onContextMenu={(e) => onStrategyContextMenu(e, strategy.id)}
              />
            ))}
          </nav>
        </div>
      )}
    </aside>
  );
}