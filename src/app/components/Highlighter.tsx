interface HighlighterProps {
  children: React.ReactNode;
  color?: 'yellow' | 'peach' | 'blue' | 'purple' | 'green';
  className?: string;
}

export function Highlighter({ children, color = 'yellow', className = '' }: HighlighterProps) {
  const colorMap = {
    yellow: '#fde68a',
    peach: '#fed7aa',
    blue: '#bfdbfe',
    purple: '#e9d5ff',
    green: '#bbf7d0',
  };

  // Multiple organic SVG path variations for variety
  const shapes = [
    // Shape 1 - wavy irregular blob with more character
    "M3,18 Q5,8 20,10 T50,14 T80,16 T97,18 Q99,24 95,28 T75,32 T50,30 T20,28 Q3,30 3,18 Z",
    // Shape 2 - slightly tilted organic shape
    "M8,18 Q12,8 30,10 T70,14 T92,18 Q95,23 90,27 T65,30 T30,28 Q8,30 8,18 Z",
    // Shape 3 - asymmetric hand-drawn feel with more width
    "M4,17 Q7,9 25,11 T60,15 T95,19 Q98,25 93,29 T60,32 T25,29 Q4,31 4,17 Z",
  ];

  // Pick a shape based on the color (deterministic but varied)
  const shapeIndex = color === 'yellow' ? 0 : color === 'peach' ? 1 : color === 'blue' ? 2 : color === 'purple' ? 1 : 0;
  const selectedShape = shapes[shapeIndex];

  return (
    <span className={`relative inline-block ${className}`}>
      {/* SVG Highlighter Background */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 100 40"
        preserveAspectRatio="none"
        style={{ 
          left: '-4%', 
          top: '-12%', 
          width: '108%', 
          height: '124%',
          zIndex: -1 
        }}
      >
        <path
          d={selectedShape}
          fill={colorMap[color]}
          fillOpacity="0.95"
          stroke="none"
        />
      </svg>
      {/* Text Content */}
      <span className="relative z-10 px-2">{children}</span>
    </span>
  );
}