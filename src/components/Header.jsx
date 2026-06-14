import React from 'react';

export default function Header({ xp, onToggleAI, aiPanelOpen }) {
  return (
    <header className="flex items-center justify-between w-full h-14 px-6 bg-surface-bright border-b border-outline-variant flex-shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        <span className="font-headline text-title-md font-bold text-primary whitespace-nowrap">Prayogshala</span>
        <span className="h-4 w-px bg-outline-variant" />
        <span className="text-label-sm text-on-surface-variant font-mono truncate">Learn → Build → Defend</span>
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        <button
          onClick={onToggleAI}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-label-sm font-mono font-semibold border transition-all ${
            aiPanelOpen
              ? 'bg-primary/10 text-primary border-primary/30'
              : 'bg-surface-container-low text-on-surface-variant border-outline-variant hover:border-primary/30 hover:text-primary'
          }`}
        >
          <span className="material-symbols-outlined text-label-md">auto_awesome</span>
          Mentor
        </button>

        <div className="flex items-center bg-surface-container px-2.5 py-1 rounded-lg border border-outline-variant gap-1">
          <span className="material-symbols-outlined text-primary text-label-md">military_tech</span>
          <span className="font-mono text-label-sm font-semibold text-on-surface">{xp} XP</span>
        </div>

        <button className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors p-1 rounded-full hover:bg-surface-container text-title-md">
          notifications
        </button>

        <div className="h-7 w-7 rounded-full bg-gradient-to-br from-primary to-secondary-container border-2 border-primary flex items-center justify-center overflow-hidden">
          <span className="material-symbols-outlined text-on-primary text-label-md">person</span>
        </div>
      </div>
    </header>
  );
}