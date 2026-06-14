import React, { useEffect, useState } from 'react';
import { moduleService } from '../services/moduleService';

const FALLBACK_MODULES = [
  { _id: 'm1', title: 'Arrays & Hashing', icon: 'view_array', description: 'Master arrays, hash maps, sets, and fundamental data structures.', totalLessons: 8, estimatedHours: 12, isPublished: true },
  { _id: 'm2', title: 'Two Pointers', icon: 'swap_horiz', description: 'Learn the two-pointer technique for array and string problems.', totalLessons: 6, estimatedHours: 9, isPublished: true },
  { _id: 'm3', title: 'Sliding Window', icon: 'view_carousel', description: 'Understand sliding window patterns for substring problems.', totalLessons: 5, estimatedHours: 8, isPublished: true },
  { _id: 'm4', title: 'Stack & Queue', icon: 'layers', description: 'Explore stack and queue for LIFO/FIFO operations.', totalLessons: 7, estimatedHours: 10, isPublished: true },
  { _id: 'm5', title: 'Trees & Graphs', icon: 'account_tree', description: 'Tree and graph traversals, BST, and advanced algorithms.', totalLessons: 10, estimatedHours: 15, isPublished: true },
  { _id: 'm6', title: 'Dynamic Programming', icon: 'neurology', description: 'Master DP patterns — memoization, tabulation, and more.', totalLessons: 12, estimatedHours: 18, isPublished: true },
];

export default function LearnPage({ onSelectModule }) {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await moduleService.getAllModules(1, 20);
        const data = res.data || [];
        setModules(data.length > 0 ? data : FALLBACK_MODULES);
      } catch { setModules(FALLBACK_MODULES); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center pt-16">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-8 pt-24 bg-gradient-to-br from-background via-surface to-surface-bright">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 animate-fade-in">
          <h1 className="font-headline text-headline-2xl font-bold bg-gradient-to-r from-primary to-secondary-container bg-clip-text text-transparent">
            Learning Modules
          </h1>
          <p className="text-on-surface-variant text-body-md mt-1">
            Select a module to begin your learning journey
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-16">
          {modules.map((m, i) => (
            <div
              key={m._id}
              onClick={() => m.isPublished && onSelectModule(m)}
              className={`group relative p-6 rounded-xl border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer animate-fade-in ${
                m.isPublished
                  ? 'bg-surface/80 backdrop-blur-sm border-outline-variant hover:border-primary'
                  : 'bg-surface-dim/50 border-outline opacity-50 cursor-not-allowed'
              }`}
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="p-3 rounded-xl bg-gradient-to-br from-primary-container to-secondary-container shadow-md w-fit mb-4">
                <span className="material-symbols-outlined text-headline-lg text-on-primary-container">
                  {m.icon || 'extension'}
                </span>
              </div>

              <h3 className="font-headline text-title-lg font-bold text-on-background mb-2 group-hover:text-primary transition-colors">
                {m.title}
              </h3>
              <p className="text-on-surface-variant text-body-sm mb-4 line-clamp-2 leading-relaxed">
                {m.description}
              </p>

              <div className="flex items-center gap-4 text-body-sm text-on-surface-variant">
                <span className="flex items-center gap-1.5 bg-surface-container-low px-2 py-1 rounded-full">
                  <span className="material-symbols-outlined text-label-sm text-primary">menu_book</span>
                  {m.totalLessons || 0} topics
                </span>
                <span className="flex items-center gap-1.5 bg-surface-container-low px-2 py-1 rounded-full">
                  <span className="material-symbols-outlined text-label-sm text-primary">schedule</span>
                  {m.estimatedHours || 0}h
                </span>
              </div>

              <div className="mt-4 h-1.5 w-full bg-surface-container rounded-full overflow-hidden flex gap-0.5 p-0.5">
                {Array.from({ length: 6 }).map((_, j) => (
                  <div key={j} className={`flex-1 rounded-full ${j < 1 ? 'bg-gradient-to-r from-primary to-secondary-container' : 'bg-surface-dim'}`} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}