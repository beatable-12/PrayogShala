import React, { useState } from 'react';

export default function Header({ xp, activeTab, setActiveTab }) {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <header className="flex justify-between items-center w-full px-6 h-16 bg-surface-bright border-b border-outline-variant fixed top-0 right-0 left-0 z-30 pl-70 ml-64">
      <div className="flex items-center gap-10">
        <nav className="flex gap-6">
          <button
            onClick={() => setActiveTab('curriculum')}
            className={`pb-1 font-headline text-body-lg transition-colors ${
              activeTab === 'curriculum'
                ? 'text-primary border-b-2 border-primary font-semibold'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Curriculum
          </button>
          <button
            onClick={() => setActiveTab('resources')}
            className={`pb-1 font-headline text-body-lg transition-colors ${
              activeTab === 'resources'
                ? 'text-primary border-b-2 border-primary font-semibold'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Resources
          </button>
          <button
            onClick={() => setActiveTab('community')}
            className={`pb-1 font-headline text-body-lg transition-colors ${
              activeTab === 'community'
                ? 'text-primary border-b-2 border-primary font-semibold'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Community
          </button>
        </nav>
      </div>

      <div className="flex items-center gap-6">
        {/* Search Bar */}
        <div className="relative hidden lg:block">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">
            search
          </span>
          <input
            type="text"
            placeholder="Search modules..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-surface-container-low border border-outline-variant rounded-full py-1.5 pl-10 pr-4 text-sm w-64 focus:ring-2 focus:ring-primary focus:outline-none transition-all"
          />
        </div>

        {/* Global XP display */}
        <div className="flex items-center bg-surface-container px-3 py-1.5 rounded-lg border border-outline-variant gap-1.5 shadow-sm">
          <span className="material-symbols-outlined text-primary text-xl">military_tech</span>
          <span className="font-mono text-xs font-semibold text-on-surface">{xp} XP</span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => alert('No new notifications')}
            className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary transition-colors p-1.5 hover:bg-surface-container rounded-full"
          >
            notifications
          </button>
          <button 
            onClick={() => alert('Change language')}
            className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary transition-colors p-1.5 hover:bg-surface-container rounded-full"
          >
            language
          </button>
          
          {/* Avatar */}
          <div className="h-8 w-8 rounded-full bg-secondary-container border border-outline flex items-center justify-center overflow-hidden">
            <img
              alt="Student avatar"
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCORC75NEe7NBU1z87AuQNtXyTdif3ZPyQXc1Z0goA0Cye65uq3n8uzU9zCtA90aikovzMPz4hhskY48uTJwJgLwhIatKKsHpnHiFfe41Cc0xa6NyzgjeznlATd_QtvyMQjuCyOmmLxQFCJ39tTWPmQCsQiU-nQeTT7hEt-19Hh1IyT-S0UevoSnYKZ8nbGzDybTu8gkZv86FFLnYMvQoJwv3CRRLetMJKIofMQGCrW4ED2tdQcEtHA"
            />
          </div>
        </div>

        {/* CTA Upgrade */}
        <button 
          onClick={() => alert('Upgrade to Premium account!')}
          className="bg-primary text-on-primary px-4 py-2 rounded-lg font-mono text-label-md hover:bg-primary-container transition-colors shadow-sm active:scale-95 transform"
        >
          Upgrade
        </button>
      </div>
    </header>
  );
}
