interface StrategyNodeProps {
  id: string;
  name: string;
  isSelected: boolean;
  onClick: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
}

/**
 * StrategyNode Component - Individual strategy card in the sidebar
 * Responsive behavior:
 * - Mobile: Larger touch target (min-height: 56px), larger text
 * - Tablet/Desktop: Standard size with hover states
 * 
 * Accessibility: 
 * - Keyboard navigable with focus states
 * - ARIA role and labels for screen readers
 * - Minimum 44px touch target for mobile (WCAG 2.1 AAA)
 */
export function StrategyNode({ 
  id,
  name, 
  isSelected, 
  onClick, 
  onContextMenu 
}: StrategyNodeProps) {
  return (
    <button
      onClick={onClick}
      onContextMenu={onContextMenu}
      className={`
        w-full text-left rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-5
        cursor-pointer transition-all duration-200
        min-h-[56px] flex items-center
        focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2
        ${isSelected 
          ? 'bg-blue-50 border-2 border-blue-400 shadow-md' 
          : 'bg-white border-2 border-gray-200 hover:border-blue-300 hover:shadow-md active:scale-[0.98]'
        }
      `}
      aria-pressed={isSelected}
      aria-label={`${name} strategy ${isSelected ? '(selected)' : ''}`}
      role="button"
      tabIndex={0}
    >
      <div className="font-semibold text-gray-900 text-sm sm:text-base md:text-lg leading-tight">
        {name}
      </div>
    </button>
  );
}