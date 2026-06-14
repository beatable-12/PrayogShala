import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import PrayogMentorPanel from './components/PrayogMentorPanel';
import LearnPage from './pages/LearnPage';
import ModuleDetailPage from './pages/ModuleDetailPage';
import TopicPage from './pages/TopicPage';
import ProjectPage from './pages/ProjectPage';
import VivaPage from './pages/VivaPage';
import ProfilePage from './pages/ProfilePage';

export default function App() {
  const [view, setView] = useState('learn');
  const [xp, setXp] = useState(0);
  const [selectedModule, setSelectedModule] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [projectUnlocked, setProjectUnlocked] = useState(false);
  const [vivaData, setVivaData] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mentorOpen, setMentorOpen] = useState(false);

  const [currentCode, setCurrentCode] = useState('');

  const handleSelectModule = (mod) => {
    setSelectedModule(mod);
    setView('module');
  };

  const handleSelectTopic = (topic) => {
    setSelectedTopic({ ...topic, moduleId: selectedModule?._id });
    setView('topic');
  };

  const handleQuestionsComplete = () => {
    setProjectUnlocked(true);
    setView('project');
  };

  const handleProjectComplete = () => {
    setVivaData({ topic: selectedTopic, module: selectedModule });
    setView('viva');
  };

  const handleVivaComplete = (score) => {
    setXp(prev => prev + 500 + (score || 0));
    setProjectUnlocked(false);
    setSelectedTopic(null);
    setSelectedModule(null);
    setVivaData(null);
    setView('profile');
  };

  const mentorContext = {
    module: selectedModule,
    topic: selectedTopic,
    question: selectedTopic ? { title: selectedTopic.title, description: '' } : null,
    project: view === 'project' ? { title: selectedTopic?.title ? `${selectedTopic.title} — Project` : 'Project', milestones: [] } : null,
    code: currentCode,
  };

  const totalXp = xp;

  return (
    <div className="min-h-screen bg-background text-on-background font-sans flex overflow-hidden">
      <Sidebar
        currentView={view}
        onNavigate={setView}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(prev => !prev)}
      />

      <div className={`flex-1 flex flex-col h-screen overflow-hidden transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        {(view !== 'topic' && view !== 'project' && view !== 'viva') && (
          <Header xp={totalXp} onToggleAI={() => setMentorOpen(prev => !prev)} aiPanelOpen={mentorOpen} />
        )}

        {view === 'learn' && <LearnPage onSelectModule={handleSelectModule} />}
        {view === 'module' && (
          <ModuleDetailPage
            module={selectedModule}
            onSelectTopic={handleSelectTopic}
            onBack={() => setView('learn')}
          />
        )}
        {view === 'topic' && (
          <TopicPage
            topic={selectedTopic}
            onQuestionsComplete={handleQuestionsComplete}
            onBack={() => setView('module')}
            setXp={setXp}
            onCodeChange={setCurrentCode}
            onToggleMentor={() => setMentorOpen(prev => !prev)}
            mentorOpen={mentorOpen}
          />
        )}
        {view === 'project' && (
          <ProjectPage
            topic={selectedTopic}
            onComplete={handleProjectComplete}
            onBack={() => setView('topic')}
            setXp={setXp}
            onCodeChange={setCurrentCode}
            onToggleMentor={() => setMentorOpen(prev => !prev)}
            mentorOpen={mentorOpen}
          />
        )}
        {view === 'viva' && (
          <VivaPage
            project={selectedTopic}
            code={currentCode}
            onComplete={handleVivaComplete}
            onBack={() => setView('project')}
            setXp={setXp}
          />
        )}
        {view === 'profile' && <ProfilePage xp={totalXp} onNavigate={setView} />}
        {view === 'admin' && (
          <div className="flex-1 p-8 pt-24">
            <h2 className="text-2xl font-bold">Admin Panel</h2>
            <p className="text-on-surface-variant mt-2">Admin features coming soon.</p>
          </div>
        )}
      </div>

      {/* Prayog Mentor — Right Side Panel */}
      <div className={`fixed top-0 right-0 h-full z-40 bg-slate-900 border-l border-slate-700 shadow-2xl transition-all duration-300 flex flex-col ${mentorOpen ? 'w-96' : 'w-0 overflow-hidden'}`}>
        <PrayogMentorPanel
          module={mentorContext.module}
          topic={mentorContext.topic}
          question={mentorContext.question}
          project={mentorContext.project}
          code={mentorContext.code}
          language="python"
          onClose={() => setMentorOpen(false)}
        />
      </div>
    </div>
  );
}