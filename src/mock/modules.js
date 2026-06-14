export const DASHBOARD_MODULES = [
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
    ],
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
    ],
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
    ],
  },
  {
    id: '04',
    title: 'System Design',
    status: 'LOCKED',
    lessons: '6 LESSONS • 15 HRS',
    isActive: false,
    items: [{ name: 'Load Balancing', locked: true }],
  },
  {
    id: '05',
    title: 'Advanced Algos',
    status: 'LOCKED',
    lessons: '12 LESSONS • 20 HRS',
    isActive: false,
    items: [{ name: 'Segment Trees', locked: true }],
  },
  {
    id: '06',
    title: 'Capstone Project',
    status: 'LOCKED',
    lessons: '1 PROJECT • 40 HRS',
    isActive: false,
    items: [{ name: 'The Engineering Prove', locked: true }],
  },
];

export const DASHBOARD_PROGRESS_PERCENT = '42% COMPLETE';

export const DASHBOARD_COURSE_TITLE = 'Data Structures & Algorithms';

export const DASHBOARD_COURSE_SUBTITLE =
  'Master the core building blocks of high-performance engineering.';
