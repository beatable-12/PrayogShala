/**
 * src/components/Tabs.jsx
 * Simple Tabs component for content switching
 */

import React, { createContext, useContext } from 'react';

const TabsContext = createContext();

export function Tabs({ value, onValueChange, children, className = '' }) {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ children, className = '' }) {
  return <div className={`flex gap-1 ${className}`}>{children}</div>;
}

export function TabsTrigger({ value, children, className = '' }) {
  const { value: activeValue, onValueChange } = useContext(TabsContext);
  return (
    <button
      onClick={() => onValueChange(value)}
      className={`focus:outline-none transition-colors ${className}`}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, children, className = '' }) {
  const { value: activeValue } = useContext(TabsContext);
  if (activeValue !== value) return null;
  return <div className={className}>{children}</div>;
}
