import React from 'react';

interface SiftLogoProps {
  className?: string;
  showWordmark?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const SiftLogo: React.FC<SiftLogoProps> = ({
  className = '',
  showWordmark = true,
  size = 'md',
}) => {
  const heightMap = {
    sm: 'h-6',
    md: 'h-8',
    lg: 'h-10',
  };

  const textMap = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Precision Vector Emblem (Sift Diamond & Focal Point) */}
      <svg
        className={`${heightMap[size]} w-auto text-primary shrink-0 transition-transform group-hover:scale-105 duration-200`}
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M14 3C12 9 8 15 3 19C8 23 12 29 14 35C16 29 20 23 25 19C20 15 16 9 14 3Z"
          fill="currentColor"
        />
        <circle cx="30" cy="19" r="3.5" fill="currentColor" opacity="0.85" />
      </svg>

      {showWordmark && (
        <span
          className={`font-headline ${textMap[size]} font-normal tracking-tight text-on-surface group-hover:text-primary transition-colors`}
        >
          Sift
        </span>
      )}
    </div>
  );
};
