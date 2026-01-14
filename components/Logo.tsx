
import React from 'react';

export const Logo: React.FC = () => {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      className="rounded-full"
    >
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2dd4bf" />
          <stop offset="100%" stopColor="#38bdf8" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="48" fill="url(#logoGradient)" />
      <circle cx="50" cy="50" r="44" fill="#1f2937" />
      
      {/* DJ Letters */}
      <text
        x="24"
        y="68"
        fontFamily="Arial, sans-serif"
        fontSize="38"
        fontWeight="bold"
        fill="#e5e7eb"
      >
        D
      </text>
      <text
        x="48"
        y="68"
        fontFamily="Arial, sans-serif"
        fontSize="38"
        fontWeight="bold"
        fill="#e5e7eb"
      >
        J
      </text>

      {/* Om Symbol */}
      <text 
        x="65" 
        y="35" 
        fontFamily="sans-serif"
        fontSize="20"
        fill="#9ca3af"
        transform="rotate(-15, 65, 35)"
      >
        ॐ
      </text>

      {/* Trisul (Trident) */}
      <path
        d="M25 20 V40 M25 25 H15 M25 25 H35 M20 20 C 25 15, 30 20, 25 20"
        stroke="#9ca3af"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        transform="rotate(20, 25, 30)"
      />
    </svg>
  );
};
