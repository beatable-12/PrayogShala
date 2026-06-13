import React from 'react';

export default function DashboardView({ setCurrentView }) {
  const modules = [
    {
      id: '01',
      title: 'Arrays & Hashing',
      status: 'IN PROGRESS',
      lessons: '3 LESSONS • 4.5 HRS',
      isActive: true,
      items: [
        { name: 'Two Pointers', completed: true, active: true },
        { name: 'Sliding Window', completed: false, active: false },
        { name: 'Hashing', completed: false, active: false },
      ]
    },
    {
      id: '02',
      title: 'Trees & Graphs',
      status: 'LOCKED',
      lessons: '8 LESSONS • 12 HRS',
      isActive: false,
      items: [
        { name: 'Binary Search Trees', locked: true },
        { name: 'DFS & BFS', locked: true },
      ]
    },
    {
      id: '03',
      title: 'Dynamic Programming',
      status: 'LOCKED',
      lessons: '10 LESSONS • 18 HRS',
      isActive: false,
      items: [
        { name: 'Memoization Basics', locked: true },
        { name: 'Grid DP Patterns', locked: true },
      ]
    },
    {
      id: '04',
      title: 'System Design',
      status: 'LOCKED',
      lessons: '6 LESSONS • 15 HRS',
      isActive: false,
      items: [
        { name: 'Load Balancing', locked: true },
      ]
    },
    {
      id: '05',
      title: 'Advanced Algos',
      status: 'LOCKED',
      lessons: '12 LESSONS • 20 HRS',
      isActive: false,
      items: [
        { name: 'Segment Trees', locked: true },
      ]
    },
    {
      id: '06',
      title: 'Capstone Project',
      status: 'LOCKED',
      lessons: '1 PROJECT • 40 HRS',
      isActive: false,
      items: [
        { name: 'The Engineering Prove', locked: true },
      ]
    }
  ];

  return (
    <div className="flex-grow overflow-y-auto p-6 bg-background custom-scrollbar bg-grain min-h-screen pt-20">
      {/* Progress Section */}
      <div className="mb-10 max-w-6xl mx-auto">
        <div className="flex justify-between items-end mb-3">
          <div>
            <h2 className="font-headline text-headline-lg font-bold text-on-background">
              Data Structures &amp; Algorithms
            </h2>
            <p className="text-on-surface-variant text-body-md">
              Master the core building blocks of high-performance engineering.
            </p>
          </div>
          <div className="text-right">
            <span className="font-mono text-label-md text-primary font-bold">42% COMPLETE</span>
          </div>
        </div>

        {/* Segmented Progress Bar */}
        <div className="h-2 w-full bg-surface-container flex gap-1 overflow-hidden rounded-full">
          <div className="flex-1 bg-primary"></div>
          <div className="flex-1 bg-primary"></div>
          <div className="flex-1 bg-primary-container opacity-50"></div>
          <div className="flex-1 bg-surface-dim"></div>
          <div className="flex-1 bg-surface-dim"></div>
          <div className="flex-1 bg-surface-dim"></div>
        </div>
      </div>

      {/* Module Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto pb-16">
        {modules.map((m) => (
          <div
            key={m.id}
            onClick={() => {
              if (!m.isActive) {
                alert(`Module ${m.id} is locked. Complete Arrays & Hashing to unlock Trees & Graphs!`);
              }
            }}
            className={`bg-surface-container-lowest border p-6 flex flex-col relative group transition-all duration-300 ${
              m.isActive
                ? 'border-outline hover:border-primary cursor-pointer shadow-sm hover:shadow-md'
                : 'border-outline-variant opacity-90 cursor-not-allowed'
            }`}
          >
            {/* Tag Status */}
            <div
              className={`absolute top-6 right-6 font-mono text-xs font-bold ${
                m.isActive ? 'text-primary' : 'text-on-surface-variant/60'
              }`}
            >
              {m.status}
            </div>
            
            <span className="font-mono text-on-surface-variant opacity-50 text-xs mb-1">
              MODULE {m.id}
            </span>
            <h3 className="font-headline text-headline-md text-on-surface mb-4">
              {m.title}
            </h3>

            {/* Sub-Items */}
            <div className={`space-y-3 flex-grow ${!m.isActive ? 'opacity-50 grayscale' : ''}`}>
              {m.items.map((item, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-3 p-2 rounded transition-transform duration-200 ${
                    item.active
                      ? 'bg-surface-container-high border-l-4 border-primary font-semibold text-primary'
                      : m.isActive
                      ? 'hover:bg-surface-container hover:translate-x-1'
                      : ''
                  }`}
                >
                  {item.completed ? (
                    <span className="material-symbols-outlined text-primary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                      check_circle
                    </span>
                  ) : item.locked ? (
                    <span className="material-symbols-outlined text-on-surface-variant text-lg">
                      lock
                    </span>
                  ) : (
                    <span className="material-symbols-outlined text-on-surface-variant text-lg">
                      radio_button_unchecked
                    </span>
                  )}
                  <span className="text-body-md text-sm">{item.name}</span>
                </div>
              ))}
            </div>

            {/* Bottom Panel bar */}
            <div className={`mt-8 pt-4 border-t border-outline-variant flex justify-between items-center ${!m.isActive ? 'opacity-50' : ''}`}>
              <span className="text-xs font-mono text-on-surface-variant">
                {m.lessons}
              </span>
              
              {m.isActive ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentView('lab'); // Navigate to Concept Lab challenge
                  }}
                  className="bg-on-background text-on-primary text-xs font-mono px-4 py-2 rounded hover:bg-primary transition-all active:scale-95 shadow-sm"
                >
                  RESUME
                </button>
              ) : (
                <span className="material-symbols-outlined text-on-surface-variant text-lg">
                  lock
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
