/**
 * src/components/ProjectPanel.jsx
 * Left sidebar showing project details, learning objectives, milestones, requirements
 * 
 * Displays:
 * - Project title and description
 * - Learning objectives
 * - Milestones with completion tracking
 * - Requirements checklist
 * - Difficulty level
 * - XP rewards
 */

import React, { useState } from 'react';
import { ChevronDown, ChevronRight, CheckCircle2, Circle, BookOpen, Flag, Award, ClipboardList } from 'lucide-react';

export default function ProjectPanel({ isDarkTheme }) {
  const [expandedSection, setExpandedSection] = useState('objectives');

  // Mock data - replace with real data from props
  const project = {
    title: 'Two Pointers Technique',
    description: 'Master the two pointers technique to solve array problems efficiently.',
    difficulty: 'MEDIUM',
    xpReward: 250,
    objectives: [
      'Understand the two pointers concept',
      'Apply two pointers to solve array problems',
      'Optimize time complexity from O(n²) to O(n)',
      'Handle edge cases and boundary conditions',
    ],
    milestones: [
      { id: 1, title: 'Learn Concept', completed: true },
      { id: 2, title: 'Validation Quiz', completed: true },
      { id: 3, title: 'Implement Solution', completed: false },
      { id: 4, title: 'Pass All Tests', completed: false },
    ],
    requirements: [
      'Write a solution using two pointers',
      'Pass all 5 test cases',
      'Time complexity: O(n)',
      'Space complexity: O(1)',
    ],
  };

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const SectionHeader = ({ icon: Icon, title, section }) => (
    <button
      onClick={() => toggleSection(section)}
      className={`w-full flex items-center gap-3 px-4 py-3 font-semibold transition-colors ${
        isDarkTheme
          ? expandedSection === section
            ? 'bg-blue-900 text-blue-100'
            : 'hover:bg-slate-800 text-slate-100'
          : expandedSection === section
          ? 'bg-blue-100 text-blue-900'
          : 'hover:bg-slate-100 text-slate-900'
      }`}
    >
      <Icon size={18} />
      <span className="flex-1 text-left">{title}</span>
      {expandedSection === section ? (
        <ChevronDown size={16} />
      ) : (
        <ChevronRight size={16} />
      )}
    </button>
  );

  return (
    <div className={`h-full flex flex-col ${isDarkTheme ? 'bg-slate-900 text-slate-50' : 'bg-white text-slate-950'}`}>
      {/* Project Header */}
      <div className={`p-4 border-b ${isDarkTheme ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-slate-50'}`}>
        <div className="flex items-start justify-between gap-2 mb-2">
          <h2 className="text-lg font-bold flex-1">{project.title}</h2>
          <span className={`px-2 py-1 rounded text-xs font-semibold whitespace-nowrap ${
            project.difficulty === 'EASY' ? 'bg-green-900 text-green-100' :
            project.difficulty === 'MEDIUM' ? 'bg-yellow-900 text-yellow-100' :
            'bg-red-900 text-red-100'
          }`}>
            {project.difficulty}
          </span>
        </div>
        <p className={`text-sm ${isDarkTheme ? 'text-slate-400' : 'text-slate-600'}`}>
          {project.description}
        </p>
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-700">
          <div className="flex items-center gap-1">
            <Award size={16} className="text-yellow-500" />
            <span className="text-sm font-medium">{project.xpReward} XP</span>
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="flex-1 overflow-y-auto">
        {/* Learning Objectives */}
        <div className={`border-b ${isDarkTheme ? 'border-slate-700' : 'border-slate-200'}`}>
          <SectionHeader icon={BookOpen} title="Learning Objectives" section="objectives" />
          {expandedSection === 'objectives' && (
            <div className={`px-4 py-3 space-y-2 ${isDarkTheme ? 'bg-slate-800' : 'bg-slate-50'}`}>
              {project.objectives.map((obj, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <Circle size={16} className={`mt-0.5 flex-shrink-0 ${isDarkTheme ? 'text-blue-400' : 'text-blue-600'}`} />
                  <span className="text-sm">{obj}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Milestones */}
        <div className={`border-b ${isDarkTheme ? 'border-slate-700' : 'border-slate-200'}`}>
          <SectionHeader icon={Flag} title="Milestones" section="milestones" />
          {expandedSection === 'milestones' && (
            <div className={`px-4 py-3 space-y-3 ${isDarkTheme ? 'bg-slate-800' : 'bg-slate-50'}`}>
              {project.milestones.map((milestone) => (
                <div key={milestone.id} className="flex items-center gap-3">
                  {milestone.completed ? (
                    <CheckCircle2 size={20} className="text-green-500 flex-shrink-0" />
                  ) : (
                    <Circle size={20} className={`${isDarkTheme ? 'text-slate-600' : 'text-slate-300'} flex-shrink-0`} />
                  )}
                  <span className={`text-sm ${milestone.completed ? 'text-slate-400 line-through' : ''}`}>
                    {milestone.title}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Requirements */}
        <div>
          <SectionHeader icon={ClipboardList} title="Requirements" section="requirements" />
          {expandedSection === 'requirements' && (
            <div className={`px-4 py-3 space-y-2 ${isDarkTheme ? 'bg-slate-800' : 'bg-slate-50'}`}>
              {project.requirements.map((req, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className={`w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 ${isDarkTheme ? 'bg-emerald-400' : 'bg-emerald-600'}`} />
                  <span className="text-sm">{req}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className={`border-t p-4 space-y-2 ${isDarkTheme ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-slate-50'}`}>
        <div className="flex justify-between text-xs">
          <span className={isDarkTheme ? 'text-slate-400' : 'text-slate-600'}>Estimated Time</span>
          <span className="font-medium">15 minutes</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2">
          <div className="bg-blue-500 h-2 rounded-full" style={{ width: '50%' }} />
        </div>
      </div>
    </div>
  );
}
