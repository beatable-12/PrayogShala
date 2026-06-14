export const PORTFOLIO_STARTER_CODE = `import { useEffect, useState } from 'react';
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
};`;

export const INITIAL_CONSOLE_LOGS = [
  { type: 'system', text: '[system] Engine ready. Waiting for run command...' },
  { type: 'info', text: '[info] Module: Project - Real-time Portfolio Tracker' },
];

export const INITIAL_PROJECT_TASKS = [
  {
    id: '01',
    title: 'Initialize React state for tracking multiple asset symbols',
    status: 'STUB',
    percent: 100,
    active: false,
    completed: true,
  },
  {
    id: '02',
    title: 'Connect to WebSocket for real-time price updates',
    status: 'ACTIVE',
    percent: 15,
    active: true,
    completed: false,
  },
  {
    id: '03',
    title: 'Calculate aggregate portfolio value in real-time',
    status: 'LOCKED',
    percent: 0,
    active: false,
    completed: false,
    locked: true,
  },
  {
    id: '04',
    title: 'Implement trend visualization with Recharts',
    status: 'LOCKED',
    percent: 0,
    active: false,
    completed: false,
    locked: true,
  },
];

export const INITIAL_GEMINI_CHAT = [
  {
    sender: 'gemini',
    text: 'Hi! I am Gemini. Let me know if you need help with state configuration, WebSocket connections, or charting configurations!',
  },
];

export const NEXT_PROJECT_RECOMMENDATION = 'High-Frequency Trading Simulator';

export const PROJECT_VISUALIZATION_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAMB8q_TLc-mVdhiBxWFFyH20BRXCmlC6JEpNb880oOBHxANooHQmuGjZbNh4YwXbe7fT9Y9GSnLH9HA0Hp1DsBAdtB1_a1bI092HelCGsJcd_3E_x33uL9n37Og6gPlOccK2Zoqgak_RKHde-lZ-CMf6nfZt8SyzmYfvw65YrixiPoeD_t21VEtUdXWfFxNCvpvl5Nhms_O5F142Oi2GfD0_ht0YS9vONtNCxH3MdDGSQcxcwJMFj4';
