import React from 'react';

export default function Sidebar({ currentView, setCurrentView }) {
  return (
    <aside className="fixed left-0 top-0 h-full w-64 flex flex-col z-40 bg-surface border-r border-outline-variant">
      <div className="p-6 pb-4">
        <h1 className="font-headline text-headline-md font-bold text-primary">Prayogshala</h1>
        <p className="text-label-md font-mono text-on-surface-variant uppercase tracking-widest mt-1 opacity-70">
          Engineering Academy
        </p>
      </div>

      <nav className="flex-grow px-3 mt-6 space-y-1">
        {/* Modules / Dashboard (Curriculum Dashboard) */}
        <button
          onClick={() => setCurrentView('dashboard')}
          className={`w-full flex items-center gap-2 p-3 rounded transition-all active:scale-95 text-left ${
            currentView === 'dashboard'
              ? 'border-l-4 border-primary bg-surface-container-high text-on-surface font-bold'
              : 'text-on-surface-variant hover:bg-surface-container-low'
          }`}
        >
          <span 
            className="material-symbols-outlined" 
            style={{ fontVariationSettings: currentView === 'dashboard' ? "'FILL' 1" : "'FILL' 0" }}
          >
            dashboard
          </span>
          <span className="font-mono text-label-md">Dashboard</span>
        </button>

        {/* Modules (Shortcut to Concept Lab) */}
        <button
          onClick={() => setCurrentView('lab')}
          className={`w-full flex items-center gap-2 p-3 rounded transition-all active:scale-95 text-left ${
            currentView === 'lab'
              ? 'border-l-4 border-primary bg-surface-container-high text-on-surface font-bold'
              : 'text-on-surface-variant hover:bg-surface-container-low'
          }`}
        >
          <span 
            className="material-symbols-outlined" 
            style={{ fontVariationSettings: currentView === 'lab' ? "'FILL' 1" : "'FILL' 0" }}
          >
            extension
          </span>
          <span className="font-mono text-label-md">Concept Lab</span>
        </button>

        {/* Projects (Project Forge) */}
        <button
          onClick={() => setCurrentView('forge')}
          className={`w-full flex items-center gap-2 p-3 rounded transition-all active:scale-95 text-left ${
            currentView === 'forge'
              ? 'border-l-4 border-primary bg-surface-container-high text-on-surface font-bold'
              : 'text-on-surface-variant hover:bg-surface-container-low'
          }`}
        >
          <span 
            className="material-symbols-outlined" 
            style={{ fontVariationSettings: currentView === 'forge' ? "'FILL' 1" : "'FILL' 0" }}
          >
            account_tree
          </span>
          <span className="font-mono text-label-md">Project Forge</span>
        </button>

        {/* Workspace (Code Editor) */}
        <button
          onClick={() => setCurrentView('workspace')}
          className={`w-full flex items-center gap-2 p-3 rounded transition-all active:scale-95 text-left ${
            currentView === 'workspace'
              ? 'border-l-4 border-primary bg-surface-container-high text-on-surface font-bold'
              : 'text-on-surface-variant hover:bg-surface-container-low'
          }`}
        >
          <span 
            className="material-symbols-outlined" 
            style={{ fontVariationSettings: currentView === 'workspace' ? "'FILL' 1" : "'FILL' 0" }}
          >
            code
          </span>
          <span className="font-mono text-label-md">Workspace</span>
        </button>

        {/* AI Assistant indicator / helper link */}
        <button
          onClick={() => {
            // Toggle active editor/chat or jump to a chat panel
            if (currentView === 'forge' || currentView === 'lab') {
              alert('AI Assistant is available in the right panel of the workspaces!');
            } else {
              setCurrentView('lab'); // Jump to Concept Lab with Sarvam AI
            }
          }}
          className="w-full flex items-center gap-2 p-3 rounded text-on-surface-variant hover:bg-surface-container-low text-left"
        >
          <span className="material-symbols-outlined">smart_toy</span>
          <span className="font-mono text-label-md">AI Assistant</span>
        </button>
      </nav>

      <div className="mt-auto p-4 border-t border-outline-variant flex flex-col gap-3">
        <button
          onClick={() => setCurrentView(currentView === 'dashboard' ? 'lab' : 'forge')}
          className="w-full bg-on-secondary-fixed-variant text-on-secondary py-3 rounded font-mono text-label-md hover:opacity-90 active:scale-95 transition-opacity"
        >
          Resume Learning
        </button>
        <div className="flex flex-col gap-1">
          <button 
            onClick={() => alert('Settings panel')}
            className="flex items-center gap-2 text-on-surface-variant hover:bg-surface-container-low p-2 rounded transition-colors text-left"
          >
            <span className="material-symbols-outlined">settings</span>
            <span className="font-mono text-label-md">Settings</span>
          </button>
          <button 
            onClick={() => alert('PrayogShala Help Center')}
            className="flex items-center gap-2 text-on-surface-variant hover:bg-surface-container-low p-2 rounded transition-colors text-left"
          >
            <span className="material-symbols-outlined">help</span>
            <span className="font-mono text-label-md">Help</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
