import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardView from './views/DashboardView';
import ConceptLabView from './views/ConceptLabView';
import ProjectForgeView from './views/ProjectForgeView';
import CodeWorkspaceView from './views/CodeWorkspaceView';

export default function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [activeTab, setActiveTab] = useState('curriculum');
  const [xp, setXp] = useState(1000);

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView setCurrentView={setCurrentView} />;
      case 'lab':
        return <ConceptLabView xp={xp} setXp={setXp} setCurrentView={setCurrentView} />;
      case 'forge':
        return <ProjectForgeView xp={xp} setXp={setXp} />;
      case 'workspace':
        return <CodeWorkspaceView />;
      default:
        return <DashboardView setCurrentView={setCurrentView} />;
    }
  };

  // CodeWorkspaceView takes full screen
  if (currentView === 'workspace') {
    return <CodeWorkspaceView />;
  }

  return (
    <div className="min-h-screen bg-background text-on-background font-sans flex overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} />

      {/* Main Container */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <Header xp={xp} activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* View Layout wrapper */}
        {renderView()}
      </div>

      {/* Background Subtle Grain / Pattern */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-[-1] bg-grain"></div>
    </div>
  );
}
