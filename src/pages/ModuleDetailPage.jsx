import React, { useEffect, useState } from 'react';
import { topicService } from '../services/topicService';

const FALLBACK_TOPICS = {
  m1: [
    { _id: 't1', title: 'Two Sum', slug: 'two-sum', difficulty: 'EASY', xpReward: 250, estimatedMinutes: 15, isPublished: true },
    { _id: 't2', title: 'Group Anagrams', slug: 'group-anagrams', difficulty: 'MEDIUM', xpReward: 350, estimatedMinutes: 20, isPublished: true },
  ],
  m2: [
    { _id: 't3', title: 'Valid Palindrome', slug: 'valid-palindrome', difficulty: 'EASY', xpReward: 250, estimatedMinutes: 15, isPublished: true },
    { _id: 't4', title: 'Three Sum', slug: 'three-sum', difficulty: 'MEDIUM', xpReward: 350, estimatedMinutes: 25, isPublished: true },
  ],
  m3: [
    { _id: 't5', title: 'Maximum Subarray', slug: 'max-subarray', difficulty: 'MEDIUM', xpReward: 350, estimatedMinutes: 20, isPublished: true },
    { _id: 't6', title: 'Longest Substring', slug: 'longest-substring', difficulty: 'MEDIUM', xpReward: 400, estimatedMinutes: 25, isPublished: true },
  ],
  m4: [
    { _id: 't7', title: 'Valid Parentheses', slug: 'valid-parentheses', difficulty: 'EASY', xpReward: 250, estimatedMinutes: 15, isPublished: true },
    { _id: 't8', title: 'Min Stack', slug: 'min-stack', difficulty: 'MEDIUM', xpReward: 350, estimatedMinutes: 20, isPublished: true },
  ],
  m5: [
    { _id: 't9', title: 'Binary Tree Inorder', slug: 'binary-tree-inorder', difficulty: 'EASY', xpReward: 250, estimatedMinutes: 15, isPublished: true },
    { _id: 't10', title: 'Course Schedule', slug: 'course-schedule', difficulty: 'MEDIUM', xpReward: 400, estimatedMinutes: 30, isPublished: true },
  ],
  m6: [
    { _id: 't11', title: 'Climbing Stairs', slug: 'climbing-stairs', difficulty: 'EASY', xpReward: 250, estimatedMinutes: 15, isPublished: true },
    { _id: 't12', title: 'Coin Change', slug: 'coin-change', difficulty: 'MEDIUM', xpReward: 400, estimatedMinutes: 30, isPublished: true },
  ],
};

const STATUS_MAP = { locked: '🔒 Locked', in_progress: '🔄 In Progress', completed: '✅ Completed' };
const STATUS_COLORS = { locked: 'bg-surface-dim text-on-surface-variant', in_progress: 'bg-amber-500/10 text-amber-600 border border-amber-200', completed: 'bg-emerald-500/10 text-emerald-600 border border-emerald-200' };

export default function ModuleDetailPage({ module, onSelectTopic, onBack }) {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completedTopics, setCompletedTopics] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await topicService.getTopicsByModule(module._id);
        setTopics(Array.isArray(res) ? res : []);
      } catch {
        setTopics(FALLBACK_TOPICS[module._id] || []);
      } finally { setLoading(false); }
    };
    load();
  }, [module._id]);

  const getTopicStatus = (index) => {
    if (completedTopics.includes(index)) return 'completed';
    if (index === 0 || completedTopics.includes(index - 1)) return topics[index]?.isPublished ? 'in_progress' : 'locked';
    return 'locked';
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center pt-16">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-8 pt-24 bg-gradient-to-br from-background via-surface to-surface-bright">
      <div className="max-w-4xl mx-auto">
        <button onClick={onBack} className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors mb-6 font-mono text-label-md">
          <span className="material-symbols-outlined text-label-md">arrow_back</span>
          Back to Modules
        </button>

        <div className="mb-8 animate-fade-in">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-primary to-secondary-container rounded-xl shadow-lg">
              <span className="material-symbols-outlined text-on-primary text-headline-md">{module.icon || 'extension'}</span>
            </div>
            <div>
              <h1 className="font-headline text-headline-xl font-bold text-on-background">{module.title}</h1>
              <p className="text-on-surface-variant text-body-md">{module.description}</p>
            </div>
          </div>
        </div>

        <div className="space-y-3 animate-fade-in">
          {topics.length === 0 ? (
            <div className="p-12 text-center bg-surface/80 backdrop-blur-sm border border-outline-variant rounded-xl">
              <span className="material-symbols-outlined text-headline-lg text-on-surface-variant">info</span>
              <p className="text-on-surface-variant mt-2">No topics available in this module.</p>
            </div>
          ) : (
            topics.map((topic, index) => {
              const status = getTopicStatus(index);
              return (
                <div
                  key={topic._id}
                  onClick={() => status !== 'locked' && onSelectTopic(topic)}
                  className={`group p-5 rounded-xl border transition-all duration-200 ${
                    status === 'locked'
                      ? 'bg-surface-dim/50 border-outline opacity-60 cursor-not-allowed'
                      : 'bg-surface/80 backdrop-blur-sm border-outline-variant hover:border-primary hover:shadow-md cursor-pointer'
                  }`}
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`p-2 rounded-lg ${
                        status === 'completed' ? 'bg-emerald-500/10' : status === 'in_progress' ? 'bg-amber-500/10' : 'bg-surface-dim'
                      }`}>
                        <span className={`material-symbols-outlined text-title-md ${
                          status === 'completed' ? 'text-emerald-600' : status === 'in_progress' ? 'text-amber-600' : 'text-on-surface-variant'
                        }`}>
                          {status === 'completed' ? 'check_circle' : status === 'in_progress' ? 'radio_button_partial' : 'lock'}
                        </span>
                      </div>
                      <div>
                        <h3 className={`font-headline text-title-md font-bold ${status === 'locked' ? 'text-on-surface-variant' : 'text-on-background'}`}>
                          {topic.title}
                        </h3>
                        <p className="text-label-sm text-on-surface-variant font-mono">{topic.estimatedMinutes} min · {topic.xpReward} XP</p>
                      </div>
                    </div>

                    <span className={`font-mono text-label-sm px-3 py-1 rounded-full ${STATUS_COLORS[status]}`}>
                      {STATUS_MAP[status]}
                    </span>
                  </div>

                  {status === 'in_progress' && (
                    <div className="mt-3 flex items-center gap-2 text-primary font-mono text-label-sm opacity-0 group-hover:opacity-100 transition-all">
                      <span>Start topic</span>
                      <span className="material-symbols-outlined text-label-md">arrow_forward</span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}