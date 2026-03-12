import React from 'react';

export const FlaskIcon = ({ size = 24, className = '' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M9 3h6" />
    <path d="M9 3v7L5.5 15" />
    <path d="M15 3v7l3.5 5" />
    <path d="M4.5 19a1 1 0 0 0 .9 1.5h13.2a1 1 0 0 0 .9-1.5L15 10H9L4.5 19Z" />
    <path d="M8.5 14h7" />
  </svg>
);
