interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onEdit: () => void;
  onExtendedTrade: () => void;
}

export function ContextMenu({ x, y, onClose, onEdit, onExtendedTrade }: ContextMenuProps) {
  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40" 
        onClick={onClose}
      />
      
      {/* Menu */}
      <div
        className="fixed z-50 bg-white border-2 border-gray-200 rounded-2xl shadow-lg overflow-hidden min-w-[180px]"
        style={{ left: x, top: y }}
      >
        <button
          onClick={() => {
            onEdit();
            onClose();
          }}
          className="w-full px-4 py-3 text-left text-gray-700 hover:bg-blue-50 transition-colors font-medium"
        >
          Edit Strategy
        </button>
        <div className="h-px bg-gray-200" />
        <button
          onClick={() => {
            onExtendedTrade();
            onClose();
          }}
          className="w-full px-4 py-3 text-left text-gray-700 hover:bg-blue-50 transition-colors font-medium"
        >
          Extended Trade
        </button>
      </div>
    </>
  );
}