import React, { useState } from 'react';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const generateHeatmap = () => {
  const weeks = 27;
  const map = [];
  const now = new Date();
  for (let w = weeks - 1; w >= 0; w--) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(now);
      date.setDate(date.getDate() - (w * 7 + (6 - d)));
      week.push({
        date,
        count: date < now ? Math.floor(Math.random() * 5) : 0,
        level: Math.floor(Math.random() * 5),
      });
    }
    map.push(week);
  }
  return map;
};

const STATS = [
  { label: 'XP', icon: 'military_tech', color: 'from-amber-400 to-orange-500', key: 'xp' },
  { label: 'Modules', icon: 'menu_book', color: 'from-blue-400 to-indigo-500', key: 'modules' },
  { label: 'Topics', icon: 'checklist', color: 'from-emerald-400 to-teal-500', key: 'topics' },
  { label: 'Projects', icon: 'construction', color: 'from-violet-400 to-purple-500', key: 'projects' },
  { label: 'Viva Score', icon: 'rate_review', color: 'from-rose-400 to-pink-500', key: 'viva' },
  { label: 'Streak', icon: 'local_fire_department', color: 'from-red-400 to-orange-500', key: 'streak' },
];

const ACHIEVEMENTS = [
  { title: 'First Code', desc: 'Submitted your first solution', icon: 'code', unlocked: true },
  { title: 'Streak Master', desc: '7-day learning streak', icon: 'local_fire_department', unlocked: false },
  { title: 'Debugger', desc: 'Fixed 10 bugs', icon: 'bug_report', unlocked: true },
  { title: 'Speed Runner', desc: 'Solved in under 5 min', icon: 'bolt', unlocked: true },
  { title: 'Full Stack', desc: 'Completed a full project', icon: 'stacked_bar_chart', unlocked: false },
  { title: 'Polyglot', desc: 'Used 3+ languages', icon: 'translate', unlocked: true },
];

export default function ProfilePage({ xp = 0, unlockedProjects = 2, completedProjects = 1 }) {
  const [heatmap] = useState(generateHeatmap);

  const statValues = { xp, modules: 3, topics: 8, projects: completedProjects, viva: '—', streak: 5 };
  const totalContributions = heatmap.flat().filter(d => d.count > 0).length;
  const currentStreak = 5;

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-br from-background via-surface to-surface-bright">
      <div className="max-w-5xl mx-auto p-8 pt-24">

        {/* Profile Header */}
        <div className="bg-surface/80 backdrop-blur-sm border border-outline-variant rounded-2xl p-6 mb-6 animate-fade-in">
          <div className="flex items-center gap-5">
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary to-secondary-container border-4 border-primary flex items-center justify-center shadow-lg flex-shrink-0">
              <span className="material-symbols-outlined text-on-primary text-headline-xl">person</span>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="font-headline text-headline-xl font-bold">Learner</h1>
              <p className="text-on-surface-variant text-body-md font-mono">@prayogshala_learner</p>
              <div className="flex items-center gap-3 mt-1.5">
                <span className="text-body-sm text-on-surface-variant">Joined Jun 2026</span>
                <span className="text-body-sm text-on-surface-variant">·</span>
                <span className="material-symbols-outlined text-label-md text-on-surface-variant">location_on</span>
                <span className="text-body-sm text-on-surface-variant">Prayogshala</span>
              </div>
            </div>
            <button className="px-4 py-2 bg-primary/10 border border-primary/30 text-primary rounded-lg font-mono text-label-sm hover:bg-primary/20 transition-colors flex items-center gap-1.5">
              <span className="material-symbols-outlined text-label-sm">edit</span>
              Edit
            </button>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          {STATS.map((stat, i) => (
            <div key={i} className="bg-surface/80 backdrop-blur-sm border border-outline-variant rounded-xl p-4 text-center animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
              <div className={`w-9 h-9 mx-auto mb-2 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-sm`}>
                <span className="material-symbols-outlined text-white text-label-lg">{stat.icon}</span>
              </div>
              <p className="text-headline-md font-bold text-on-background">{statValues[stat.key]}</p>
              <p className="text-label-xs text-on-surface-variant font-mono">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Activity Heatmap (GitHub-style) */}
        <div className="bg-surface/80 backdrop-blur-sm border border-outline-variant rounded-2xl p-6 mb-6 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-headline text-title-lg font-bold">Activity</h2>
            <div className="text-body-sm text-on-surface-variant font-mono">
              {totalContributions} contributions in the last 27 weeks
            </div>
          </div>
          <div className="flex gap-0.5 overflow-x-auto pb-2">
            {heatmap.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-0.5">
                {week.map((day, di) => (
                  <div
                    key={di}
                    className={`w-3 h-3 rounded-sm ${day.count === 0 ? 'bg-surface-container-low' : day.count <= 1 ? 'bg-emerald-300/40' : day.count <= 2 ? 'bg-emerald-400/60' : day.count <= 3 ? 'bg-emerald-500/80' : 'bg-emerald-600'}`}
                    title={`${day.date.toLocaleDateString()}: ${day.count} contributions`}
                  />
                ))}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-1 mt-3 justify-end">
            <span className="text-label-xs text-on-surface-variant">Less</span>
            {[0, 1, 2, 3, 4].map(l => (
              <div key={l} className={`w-3 h-3 rounded-sm ${l === 0 ? 'bg-surface-container-low' : l <= 1 ? 'bg-emerald-300/40' : l <= 2 ? 'bg-emerald-400/60' : l <= 3 ? 'bg-emerald-500/80' : 'bg-emerald-600'}`} />
            ))}
            <span className="text-label-xs text-on-surface-variant">More</span>
          </div>
        </div>

        {/* Streak + Achievements */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-1 bg-surface/80 backdrop-blur-sm border border-outline-variant rounded-2xl p-6 animate-fade-in">
            <h2 className="font-headline text-title-lg font-bold mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-orange-500 text-title-md">local_fire_department</span>
              Streak
            </h2>
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-headline-lg font-bold text-orange-500">{currentStreak} days</p>
                <p className="text-label-sm text-on-surface-variant font-mono">Current streak</p>
              </div>
              <div className="text-center">
                <p className="text-headline-sm font-bold text-on-background">0</p>
                <p className="text-label-xs text-on-surface-variant font-mono">Best</p>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                <div key={i} className={`flex-1 text-center py-2 rounded-lg ${i < 5 ? 'bg-gradient-to-b from-orange-400 to-amber-500 text-white' : 'bg-surface-container-low text-on-surface-variant'}`}>
                  <span className="text-label-xs font-bold">{d}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 bg-surface/80 backdrop-blur-sm border border-outline-variant rounded-2xl p-6 animate-fade-in">
            <h2 className="font-headline text-title-lg font-bold mb-3">Achievements</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {ACHIEVEMENTS.map((ach, i) => (
                <div key={i} className={`p-3 rounded-xl border text-center transition-all ${
                  ach.unlocked ? 'bg-surface-container-low border-primary/30' : 'bg-surface-dim border-outline-variant opacity-50'
                }`}>
                  <span className={`material-symbols-outlined text-title-md ${ach.unlocked ? 'text-primary' : 'text-on-surface-variant'}`}>
                    {ach.icon}
                  </span>
                  <p className={`text-label-xs font-bold mt-1 ${ach.unlocked ? 'text-on-background' : 'text-on-surface-variant'}`}>{ach.title}</p>
                  <p className="text-label-xs text-on-surface-variant mt-0.5">{ach.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Skill Progress */}
        <div className="bg-surface/80 backdrop-blur-sm border border-outline-variant rounded-2xl p-6 animate-fade-in mb-24">
          <h2 className="font-headline text-title-lg font-bold mb-4">Skill Progress</h2>
          <div className="space-y-4">
            {[
              { name: 'Data Structures', pct: 65, color: 'from-blue-500 to-indigo-500' },
              { name: 'Algorithms', pct: 50, color: 'from-emerald-500 to-teal-500' },
              { name: 'Problem Solving', pct: 75, color: 'from-violet-500 to-purple-500' },
              { name: 'Code Quality', pct: 60, color: 'from-amber-500 to-orange-500' },
            ].map((skill, i) => (
              <div key={i}>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="font-mono text-label-sm font-semibold text-on-background">{skill.name}</span>
                  <span className="font-mono text-label-sm text-primary">{skill.pct}%</span>
                </div>
                <div className="h-2.5 w-full bg-surface-container rounded-full overflow-hidden">
                  <div className={`h-full rounded-full bg-gradient-to-r ${skill.color} transition-all duration-1000`} style={{ width: `${skill.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}