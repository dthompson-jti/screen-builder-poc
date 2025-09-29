// src/FullScreenPlaceholder.tsx
import React from 'react';
import './FullScreenPlaceholder.css';

interface FullScreenPlaceholderProps {
  icon: string;
  title: string;
  message: string;
}

export const FullScreenPlaceholder: React.FC<FullScreenPlaceholderProps> = ({ icon, title, message }) => {
  return (
    <div className="fullscreen-placeholder-wrapper">
      <div className="fullscreen-placeholder-card">
        <span className="material-symbols-outlined">{icon}</span>
        <h3>{title}</h3>
        <p>{message}</p>
      </div>
    </div>
  );
};