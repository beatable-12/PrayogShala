import React from 'react';

export default function Sidebar({ currentView, onNavigate, collapsed, onToggleCollapse }) {
  const items = [
    { id: 'learn', icon: 'school', label: 'Learn' },
    { id: 'profile', icon: 'person', label: 'Profile' },
    { id: 'admin', icon: 'admin_panel_settings', label: 'Admin' },
  ];

  return (
    <aside className={`fixed left-0 top-0 h-full flex flex-col z-40 bg-surface border-r border-outline-variant transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}>
      {/* Logo area */}
      <div className={`flex items-center ${collapsed ? 'justify-center p-3' : 'p-6 pb-4'} gap-3`}>
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary-container flex items-center justify-center shadow-md flex-shrink-0">
          <span className="material-symbols-outlined text-on-primary text-title-md">auto_stories</span>
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <h1 className="font-headline text-headline-md font-bold text-primary truncate">Prayogshala</h1>
            <p className="text-label-xs font-mono text-on-surface-variant uppercase tracking-widest opacity-70 truncate">
              Engineering Academy
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-grow px-2 mt-2 space-y-1">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            title={collapsed ? item.label : undefined}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all active:scale-95 ${
              collapsed ? 'justify-center' : 'text-left'
            } ${
              currentView === item.id
                ? 'bg-primary/10 text-primary border-l-4 border-primary font-semibold'
                : 'text-on-surface-variant hover:bg-surface-container-low hover:border-l-4 hover:border-primary/30'
            }`}
          >
            <span className="material-symbols-outlined text-title-md flex-shrink-0">{item.icon}</span>
            {!collapsed && <span className="font-mono text-label-md truncate">{item.label}</span>}
          </button>
        ))}
      </nav>

      {/* Bottom area with collapse toggle */}
      <div className="mt-auto p-3 border-t border-outline-variant">
        <button
          onClick={onToggleCollapse}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={`w-full flex items-center gap-3 p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-all active:scale-95 ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          <span className="material-symbols-outlined text-title-md flex-shrink-0">
            {collapsed ? 'chevron_right' : 'chevron_left'}
          </span>
          {!collapsed && <span className="font-mono text-label-md">Collapse</span>}
        </button>
      </div>
    </aside>
  );
}