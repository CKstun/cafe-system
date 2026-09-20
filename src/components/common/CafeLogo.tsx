import React from 'react';

interface CafeLogoProps {
  className?: string;
  size?: number;
  showBorder?: boolean;
}

export const CafeLogo: React.FC<CafeLogoProps> = ({
  className = 'w-24 h-24',
  size = 140,
  showBorder = true,
}) => {
  return (
    <div className={`relative inline-flex items-center justify-center select-none ${className}`}>
      <svg
        viewBox="0 0 300 300"
        width={size}
        height={size}
        className="w-full h-full drop-shadow-sm"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer and Inner Concentric Ring Borders */}
        {showBorder && (
          <>
            <circle cx="150" cy="150" r="142" stroke="#1C1816" strokeWidth="3" fill="#FFFFFF" />
            <circle cx="150" cy="150" r="136" stroke="#1C1816" strokeWidth="1.5" fill="none" />
          </>
        )}

        {/* Vertical Center Divider */}
        <line
          x1="130"
          y1="58"
          x2="130"
          y2="232"
          stroke="#1C1816"
          strokeWidth="3.5"
          strokeLinecap="round"
        />

        {/* --- LEFT SIDE: COFFEE CUP & STEAM --- */}
        {/* Steam Waves */}
        <path
          d="M 120 125 C 117 115 115 105 120 95 C 124 86 123 78 120 70"
          stroke="#1C1816"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
        />

        {/* Cup Outline (half-cup flush against vertical line) */}
        {/* Cup Rim Top */}
        <line
          x1="88"
          y1="130"
          x2="130"
          y2="130"
          stroke="#1C1816"
          strokeWidth="4"
          strokeLinecap="round"
        />

        {/* Cup Coffee Fill (Rich warm brown liquid fill) */}
        <path
          d="M 100 148 L 130 148 L 130 176 C 116 176 102 165 100 148 Z"
          fill="#6F3F24"
        />

        {/* Cup Body Outline */}
        <path
          d="M 88 130 L 98 176 C 104 182 116 182 130 182"
          stroke="#1C1816"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />

        {/* Cup Handle (Ear) */}
        <path
          d="M 88 140 C 70 140 70 162 89 162"
          stroke="#1C1816"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
        />

        {/* Saucer Base */}
        <path
          d="M 88 186 C 98 194 116 194 130 194"
          stroke="#1C1816"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
        />

        {/* --- RIGHT SIDE: TYPOGRAPHY --- */}
        {/* "CAFÉ" - Bold Sans Serif */}
        <text
          x="140"
          y="126"
          fill="#1C1816"
          fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          fontWeight="900"
          fontSize="36"
          letterSpacing="0.05em"
        >
          CAFÉ
        </text>

        {/* "PEPITA" - Bold Sans Serif */}
        <text
          x="140"
          y="172"
          fill="#1C1816"
          fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          fontWeight="900"
          fontSize="36"
          letterSpacing="0.05em"
        >
          PEPITA
        </text>

        {/* "Sip the moment." - Cursive Script */}
        <text
          x="136"
          y="196"
          fill="#1C1816"
          fontFamily="'Playfair Display', Georgia, 'Brush Script MT', 'Dancing Script', cursive"
          fontStyle="italic"
          fontWeight="600"
          fontSize="21"
          letterSpacing="0.02em"
        >
          Sip the moment.
        </text>
      </svg>
    </div>
  );
};
