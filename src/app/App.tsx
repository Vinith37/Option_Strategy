import { useState } from "react";
import { TopNav } from "./components/TopNav";
import { StrategySidebar } from "./components/StrategySidebar";
import { StrategyDetailPanel } from "./components/StrategyDetailPanel";
import { ContextMenu } from "./components/ContextMenu";
import { Highlighter } from "./components/Highlighter";
import { Strategy } from "./types/strategy";

// Options Strategy Builder - Main Application Component
const mockStrategies: Strategy[] = [
  { id: "1", name: "Covered Call", type: "covered-call" },
  {
    id: "2",
    name: "Bull Call Spread",
    type: "bull-call-spread",
  },
  { id: "3", name: "Iron Condor", type: "iron-condor" },
  { id: "4", name: "Long Straddle", type: "long-straddle" },
  { id: "5", name: "Protective Put", type: "protective-put" },
  {
    id: "6",
    name: "Butterfly Spread",
    type: "butterfly-spread",
  },
  { id: "7", name: "Custom Strategy", type: "custom-strategy" },
];

interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  strategyId: string | null;
}

function App() {
  const [selectedStrategyId, setSelectedStrategyId] = useState<
    string | null
  >(null);
  const [showMobileDetail, setShowMobileDetail] =
    useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] =
    useState(false);
  const [contextMenu, setContextMenu] =
    useState<ContextMenuState>({
      visible: false,
      x: 0,
      y: 0,
      strategyId: null,
    });

  const handleStrategySelect = (id: string) => {
    setSelectedStrategyId(id);
    setShowMobileDetail(true);
    setContextMenu({ ...contextMenu, visible: false });
  };

  const handleMobileBack = () => {
    setShowMobileDetail(false);
  };

  const handleStrategyContextMenu = (
    e: React.MouseEvent,
    id: string,
  ) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      strategyId: id,
    });
  };

  const handleContextMenuClose = () => {
    setContextMenu({ ...contextMenu, visible: false });
  };

  const handleEdit = () => {
    if (contextMenu.strategyId) {
      console.log("Edit strategy:", contextMenu.strategyId);
      // Add edit logic here
    }
  };

  const handleExtendedTrade = () => {
    if (contextMenu.strategyId) {
      console.log(
        "Extended trade for strategy:",
        contextMenu.strategyId,
      );
      // Add extended trade logic here
    }
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const selectedStrategy = mockStrategies.find(
    (s) => s.id === selectedStrategyId,
  );

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* Fixed Top Navigation */}
      <TopNav />

      {/* Main Content Area - Uses CSS Grid for flexible layouts */}
      <div className="flex flex-1 overflow-hidden">
        {/* 
          Sidebar - Responsive width behavior:
          - Mobile: Full width OR hidden (controlled by showMobileDetail)
          - Tablet: 256px (w-64) when expanded, 64px (w-16) when collapsed
          - Desktop: 320px (w-80) when expanded, 64px (w-16) when collapsed
        */}
        <StrategySidebar
          strategies={mockStrategies}
          selectedStrategyId={selectedStrategyId}
          onStrategySelect={handleStrategySelect}
          onStrategyContextMenu={handleStrategyContextMenu}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={toggleSidebar}
          className={`
            ${showMobileDetail ? "hidden" : "flex-1"} 
            md:flex ${isSidebarCollapsed ? "md:w-16" : "md:w-64 lg:w-80"}
            flex-shrink-0
          `}
        />

        {/* 
          Detail Panel - Responsive behavior:
          - Mobile: Full screen overlay, hidden until strategy selected
          - Tablet/Desktop: Flex-grows to fill remaining space
          Uses flexbox for content-aware sizing
        */}
        <main
          className={`
          ${!showMobileDetail && "hidden"} 
          md:flex md:flex-1
          flex-1 min-w-0
        `}
          role="main"
          aria-label="Strategy detail panel"
        >
          {selectedStrategy ? (
            <StrategyDetailPanel
              strategyName={selectedStrategy.name}
              strategyType={selectedStrategy.type}
              onBack={handleMobileBack}
              showBackButton={true}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center bg-white p-6 sm:p-8 md:p-12">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <p className="text-gray-500 text-base sm:text-lg md:text-xl font-medium text-center mb-2 max-w-md">
                <Highlighter color="blue">
                  Select a strategy to get started
                </Highlighter>
              </p>
              <p className="text-gray-400 text-xs sm:text-sm md:text-base text-center mt-2 max-w-sm">
                Choose from the list to configure and visualize
              </p>
            </div>
          )}
        </main>
      </div>

      {/* Context Menu - Portal-style overlay */}
      {contextMenu.visible && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={handleContextMenuClose}
          onEdit={handleEdit}
          onExtendedTrade={handleExtendedTrade}
        />
      )}
    </div>
  );
}

export default App;