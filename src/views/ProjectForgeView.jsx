import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';

export default function ProjectForgeView({ xp, setXp }) {
  const [code, setCode] = useState(
`import { useEffect, useState } from 'react';
import { createSocket } from '@prayogshala/engine';

const PortfolioTracker = () => {
  const [prices, setPrices] = useState({});

  // Task 02: Implement WebSocket logic here
  useEffect(() => {
    const socket = createSocket('wss://api.tracker.com/v1');

    socket.on('update', (data) => {
      // YOUR CODE BELOW
      setPrices((prev) => ({ ...prev, ...data }));
    });

    return () => socket.close();
  }, []);
};`
  );

  const [consoleLogs, setConsoleLogs] = useState([
    { type: 'system', text: '[system] Engine ready. Waiting for run command...' },
    { type: 'info', text: '[info] Module: Project - Real-time Portfolio Tracker' }
  ]);

  const [isRunning, setIsRunning] = useState(false);
  const [runSuccess, setRunSuccess] = useState(false);
  
  // Tasks list state
  const [tasks, setTasks] = useState([
    { id: '01', title: 'Initialize React state for tracking multiple asset symbols', status: 'STUB', percent: 100, active: false, completed: true },
    { id: '02', title: 'Connect to WebSocket for real-time price updates', status: 'ACTIVE', percent: 15, active: true, completed: false },
    { id: '03', title: 'Calculate aggregate portfolio value in real-time', status: 'LOCKED', percent: 0, active: false, completed: false, locked: true },
    { id: '04', title: 'Implement trend visualization with Recharts', status: 'LOCKED', percent: 0, active: false, completed: false, locked: true },
  ]);

  // Gemini AI chat state
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { sender: 'gemini', text: 'Hi! I am Gemini. Let me know if you need help with state configuration, WebSocket connections, or charting configurations!' }
  ]);

  const [showOverlay, setShowOverlay] = useState(false);
  const terminalEndRef = useRef(null);

  // Trigger page load overlay
  useEffect(() => {
    setShowOverlay(true);
    // Trigger initial load confetti
    triggerConfetti();
    const timer = setTimeout(() => {
      setShowOverlay(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.7 }
    });
  };

  const handleRunCode = () => {
    if (isRunning) return;
    setIsRunning(true);
    
    // Add compiling logs
    setConsoleLogs((prev) => [
      ...prev,
      { type: 'info', text: '> Running code compile on Judge0...' },
      { type: 'info', text: '[info] Compiling PortfolioSocket.js...' }
    ]);

    setTimeout(() => {
      setConsoleLogs((prev) => [
        ...prev,
        { type: 'success', text: '[success] Compilation succeeded.' },
        { type: 'info', text: '[test] Running project test cases...' }
      ]);

      setTimeout(() => {
        // Complete task 02
        setConsoleLogs((prev) => [
          ...prev,
          { type: 'success', text: '[test] Test Case 1: Symbol initialization (Passed)' },
          { type: 'success', text: '[test] Test Case 2: WebSocket connection established (Passed)' },
          { type: 'system', text: '[system] WebSocket event received: { AAPL: 182.5, GOOG: 175.2 }' },
          { type: 'success', text: '[success] Task 2 completed! WebSocket is streaming.' }
        ]);
        
        setIsRunning(false);
        setRunSuccess(true);
        triggerConfetti();

        // Increment XP
        setXp(xp + 250);

        // Update task list states
        setTasks((prevTasks) => 
          prevTasks.map((t) => {
            if (t.id === '02') {
              return { ...t, status: 'STUB', percent: 100, active: false, completed: true };
            }
            if (t.id === '03') {
              return { ...t, status: 'ACTIVE', percent: 20, active: true, completed: false, locked: false };
            }
            if (t.id === '04') {
              return { ...t, locked: false }; // Unlock remaining tasks
            }
            return t;
          })
        );
      }, 1000);
    }, 1200);
  };

  const handleSendPrompt = () => {
    if (!chatInput.trim()) return;
    const userText = chatInput;
    setChatHistory((prev) => [...prev, { sender: 'user', text: userText }]);
    setChatInput('');

    // Generate responsive feedback
    setTimeout(() => {
      let replyText = "Interesting query! To complete the WebSocket section, make sure you hook up the message event listener inside the useEffect hook and return a cleanup function to close the socket.";
      if (userText.toLowerCase().includes('websocket') || userText.toLowerCase().includes('socket')) {
        replyText = "In your WebSocket code, `socket.on('update', ...)` receives the updated tickers. Store them in state and don't forget to return `() => socket.close()` in useEffect to clean up listeners.";
      } else if (userText.toLowerCase().includes('charts') || userText.toLowerCase().includes('recharts')) {
        replyText = "For Recharts visualization (Task 04), pass the state array to a `<LineChart>` component containing `<XAxis dataKey=\"time\" />` and `<Line type=\"monotone\" dataKey=\"value\" stroke=\"#bb0016\" />`.";
      } else if (userText.toLowerCase().includes('xp')) {
        replyText = "You gain 250 XP for every task validated by the compiler! Run the compiler using the 'Run with Judge0' button to test it.";
      }

      setChatHistory((prev) => [...prev, { sender: 'gemini', text: replyText }]);
    }, 800);
  };

  return (
    <main className="ml-64 mt-16 flex-grow flex flex-col overflow-hidden relative h-[calc(100vh-64px)]">
      {/* Success Notification Banner */}
      <div className="w-full bg-surface-bright border-b border-outline-variant px-6 py-4 flex items-center justify-between z-10 animate-fade-in">
        <div className="flex items-center gap-4">
          <div className="bg-primary-container p-2 rounded-lg flex items-center justify-center text-on-primary-container">
            <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              verified
            </span>
          </div>
          <div>
            <h2 className="font-headline text-headline-md text-primary tracking-tight font-bold">
              {runSuccess ? "Task Completed!" : "Concept Cleared!"}
            </h2>
            <p className="text-body-lg text-sm text-on-surface-variant">
              {runSuccess 
                ? "Active WebSocket price stream verified. Move on to Task 3!" 
                : "Project Unlocked: Build a Real-time Portfolio Tracker"}
            </p>
          </div>
        </div>
        <div className="flex gap-3 items-center">
          <div className="flex items-center bg-surface-container-high px-4 py-2 rounded-lg gap-2 text-sm border border-outline-variant">
            <span className="material-symbols-outlined text-primary">military_tech</span>
            <span className="font-mono font-bold">250 XP Gained</span>
          </div>
          <button 
            onClick={() => {
              if (runSuccess) {
                alert("Calculating aggregates (Task 3)...");
              } else {
                alert("Let's start implementing Task 02 in the editor!");
              }
            }}
            className="bg-on-background text-on-primary px-5 py-2 rounded-lg font-mono text-xs font-bold hover:opacity-90 active:scale-95 transition-all shadow-sm"
          >
            {runSuccess ? "Next Task" : "Start Project"}
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Sub-tasks */}
        <aside className="w-72 bg-surface-container-low border-r border-outline-variant flex flex-col overflow-y-auto">
          <div className="p-3 bg-surface-container-high border-b border-outline-variant flex justify-between items-center text-xs">
            <span className="font-mono text-on-surface-variant font-bold">SUB-TASKS</span>
            <span className="material-symbols-outlined text-sm text-on-surface-variant">auto_awesome</span>
          </div>
          <div className="p-3 space-y-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={`p-3 rounded border transition-all cursor-pointer ${
                  task.completed
                    ? 'bg-surface border-outline-variant opacity-90 hover:border-primary'
                    : task.active
                    ? 'bg-surface-container-lowest border-outline border-l-4 border-l-primary shadow-sm'
                    : 'bg-surface-container-low border-outline-variant/30 opacity-60'
                }`}
                onClick={() => {
                  if (task.locked) {
                    alert('This task is locked! Complete Task 02 first.');
                  } else {
                    alert(`Now active: Task ${task.id}`);
                  }
                }}
              >
                <div className="flex items-start gap-2">
                  <span className={`font-mono text-sm font-bold ${task.completed || task.active ? 'text-primary' : 'text-on-surface-variant'}`}>
                    {task.id}
                  </span>
                  <p className={`text-xs ${task.completed ? 'line-through text-on-surface-variant' : 'text-on-surface'}`}>
                    {task.title}
                  </p>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
                    task.completed 
                      ? 'bg-surface-container-highest text-on-surface-variant' 
                      : task.active 
                      ? 'bg-primary-container text-on-primary-container' 
                      : 'bg-surface-dim text-on-surface-variant'
                  }`}>
                    {task.status}
                  </span>
                  {task.locked ? (
                    <span className="material-symbols-outlined text-sm text-on-surface-variant ml-auto">lock</span>
                  ) : (
                    <div className="h-1 flex-grow bg-surface-container-highest rounded-full overflow-hidden">
                      <div className="bg-primary h-full transition-all duration-300" style={{ width: `${task.percent}%` }}></div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Center: Code Editor & Console */}
        <section className="flex-grow flex flex-col bg-[#33425b] overflow-hidden relative">
          <div className="flex items-center justify-between px-4 py-2 bg-[#1e293b]/50 border-b border-white/5">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1 bg-[#33425b] border-t-2 border-primary">
                <span className="material-symbols-outlined text-primary text-sm">javascript</span>
                <span className="font-mono text-xs text-on-primary-container">PortfolioSocket.js</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 text-on-surface-variant/70 opacity-60 cursor-pointer">
                <span className="material-symbols-outlined text-xs">css</span>
                <span className="font-mono text-xs">styles.css</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => alert('Code formatted.')}
                className="bg-[#2c3e50] text-white px-3 py-1 rounded text-xs font-mono hover:bg-[#34495e] transition-colors"
              >
                Format
              </button>
              <button
                onClick={handleRunCode}
                className={`text-white px-4 py-1 rounded text-xs font-bold flex items-center gap-2 transition-all active:scale-95 ${
                  isRunning 
                    ? 'bg-orange-600 cursor-wait' 
                    : runSuccess 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-primary hover:brightness-110'
                }`}
              >
                <span className="material-symbols-outlined text-sm">
                  {isRunning ? 'sync' : runSuccess ? 'check' : 'play_arrow'}
                </span>
                {isRunning ? 'Running...' : runSuccess ? 'Success' : 'Run with Judge0'}
              </button>
            </div>
          </div>

          {/* Textarea Code Editor */}
          <div className="flex-1 p-4 font-mono text-sm leading-relaxed overflow-y-auto flex">
            <div className="text-gray-400 text-right select-none pr-4 border-r border-white/5 mr-4 leading-relaxed font-mono">
              {code.split('\n').map((_, index) => (
                <div key={index}>{index + 1}</div>
              ))}
            </div>
            <textarea
              className="flex-1 bg-transparent text-white focus:outline-none resize-none overflow-hidden h-full font-mono text-sm leading-relaxed"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck="false"
            />
          </div>

          {/* Console Output Terminal */}
          <div className="h-44 bg-[#1e293b] border-t border-outline-variant/20 terminal-glow p-4 font-mono text-xs text-green-400/80 overflow-y-auto">
            <div className="flex items-center gap-2 mb-2 pb-1 border-b border-white/5">
              <span className="material-symbols-outlined text-sm text-green-400">terminal</span>
              <span className="font-mono text-[10px] text-on-surface-variant font-bold uppercase">Console Output</span>
            </div>
            <div className="space-y-1">
              {consoleLogs.map((log, index) => (
                <div
                  key={index}
                  className={
                    log.type === 'success' 
                      ? 'text-emerald-400' 
                      : log.type === 'system' 
                      ? 'text-orange-400' 
                      : 'text-gray-300'
                  }
                >
                  {log.text}
                </div>
              ))}
              <div className="animate-pulse inline-block text-green-400">&gt; _</div>
            </div>
            <div ref={terminalEndRef}></div>
          </div>
        </section>

        {/* Right Sidebar: Gemini Suggestion Box */}
        <aside className="w-80 bg-surface border-l border-outline-variant flex flex-col">
          <div className="p-4 flex flex-col h-full overflow-y-auto custom-scrollbar">
            {/* Panel Header */}
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-blue-600 flex items-center justify-center shadow">
                <span className="material-symbols-outlined text-white text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                  smart_toy
                </span>
              </div>
              <span className="font-headline text-headline-md text-sm text-on-surface font-bold">Gemini AI</span>
            </div>

            {/* AI Suggested Breakdown */}
            <div className="bg-surface-container-low rounded-xl p-4 border border-outline-variant relative overflow-hidden group mb-4">
              <div className="absolute top-2 right-2 opacity-10 group-hover:opacity-100 transition-opacity">
                <span className="material-symbols-outlined text-primary text-lg">tips_and_updates</span>
              </div>
              <h3 className="font-bold text-on-surface mb-3 text-sm font-headline">Detailed Breakdown</h3>
              <div className="space-y-4 text-xs">
                <div className="border-l-2 border-primary pl-3">
                  <p className="font-mono text-[10px] text-primary mb-0.5 font-bold uppercase tracking-wider">DATA FLOW</p>
                  <p className="text-on-surface-variant leading-relaxed">
                    The app uses a <strong>Pub/Sub</strong> pattern. Use <code>useEffect</code> to subscribe to the WebSocket on mount and ensure clean-up on unmount to prevent memory leaks.
                  </p>
                </div>
                <div className="border-l-2 border-outline pl-3">
                  <p className="font-mono text-[10px] text-on-surface mb-0.5 font-bold uppercase tracking-wider">OPTIMIZATION</p>
                  <p className="text-on-surface-variant leading-relaxed">
                    Throttling updates is key. Don't re-render for every single price tick; batch them every 500ms to maintain 60FPS UI performance.
                  </p>
                </div>
                <div className="border-l-2 border-outline pl-3">
                  <p className="font-mono text-[10px] text-on-surface mb-0.5 font-bold uppercase tracking-wider">SECURITY</p>
                  <p className="text-on-surface-variant leading-relaxed">
                    Remember to store your WebSocket API key in an environment variable, not hardcoded in the script.
                  </p>
                </div>
              </div>
            </div>

            {/* Next Recommendation / Thread bubble */}
            <div className="border border-dashed border-outline-variant rounded-xl p-4 flex flex-col justify-center items-center text-center bg-surface-container-lowest">
              <img
                alt="Project visualization"
                className="w-24 h-24 mb-3 rounded-lg object-cover shadow-sm border border-outline-variant"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAMB8q_TLc-mVdhiBxWFFyH20BRXCmlC6JEpNb880oOBHxANooHQmuGjZbNh4YwXbe7fT9Y9GSnLH9HA0Hp1DsBAdtB1_a1bI092HelCGsJcd_3E_x33uL9n37Og6gPlOccK2Zoqgak_RKHde-lZ-CMf6nfZt8SyzmYfvw65YrixiPoeD_t21VEtUdXWfFxNCvpvl5Nhms_O5F142Oi2GfD0_ht0YS9vONtNCxH3MdDGSQcxcwJMFj4"
              />
              <h4 className="font-bold text-on-surface text-sm font-headline">Next Project Recommendation</h4>
              <p className="text-xs text-on-surface-variant mt-1.5 px-3">
                Based on your progress: <br /><strong>"High-Frequency Trading Simulator"</strong>
              </p>
            </div>

            {/* Chat Thread Input */}
            <div className="mt-4 pt-3 border-t border-outline-variant">
              <div className="max-h-32 overflow-y-auto mb-2 text-xs space-y-2">
                {chatHistory.slice(-2).map((c, i) => (
                  <div key={i} className={`p-2 rounded ${c.sender === 'user' ? 'bg-surface-container-high text-right' : 'bg-primary-container text-on-primary-container'}`}>
                    <strong>{c.sender === 'user' ? 'You: ' : 'Gemini: '}</strong> {c.text}
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ask Gemini..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendPrompt()}
                  className="flex-1 bg-surface-container-high border border-outline-variant rounded-lg text-xs px-3 focus:ring-1 focus:ring-primary focus:outline-none"
                />
                <button
                  onClick={handleSendPrompt}
                  className="bg-on-background p-2 rounded-lg text-white hover:bg-primary transition-colors flex items-center justify-center"
                >
                  <span className="material-symbols-outlined text-sm">send</span>
                </button>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Confetti Animation Page Overlay */}
      {showOverlay && (
        <div className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center bg-background/20 backdrop-blur-[2px] opacity-100 transition-opacity duration-1000">
          <div className="text-center bg-white/90 p-8 rounded-xl shadow-2xl border border-outline-variant">
            <div className="text-8xl mb-3">🎉</div>
            <h1 className="font-headline text-display-lg text-primary uppercase font-bold">Project Ready</h1>
            <p className="font-headline text-headline-md text-on-surface mt-2">Time to build something great.</p>
          </div>
        </div>
      )}
    </main>
  );
}
