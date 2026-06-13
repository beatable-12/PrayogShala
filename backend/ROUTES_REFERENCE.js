// This file demonstrates the complete route structure
// These routes are currently inlined in server.js for simplicity
// They can be refactored into separate files later

/**
 * ROUTE STRUCTURE REFERENCE
 * 
 * ╔═══════════════════════════════════════════════════════════════╗
 * ║                    AUTH ROUTES (/api/auth)                   ║
 * ╠═══════════════════════════════════════════════════════════════╣
 * ║ POST   /register     → Register new user                      ║
 * ║ POST   /login        → Login and get JWT                      ║
 * ║ GET    /me           → Get current user profile               ║
 * ║ PATCH  /me           → Update user profile                    ║
 * ╚═══════════════════════════════════════════════════════════════╝
 * 
 * ╔═══════════════════════════════════════════════════════════════╗
 * ║                  MODULE ROUTES (/api/modules)                ║
 * ╠═══════════════════════════════════════════════════════════════╣
 * ║ GET    /             → Get all published modules              ║
 * ║ GET    /:id          → Get single module with topics          ║
 * ║ POST   /             → Admin: Create module                   ║
 * ║ PUT    /:id          → Admin: Update module                   ║
 * ║ DELETE /:id          → Admin: Delete module                   ║
 * ╚═══════════════════════════════════════════════════════════════╝
 * 
 * ╔═══════════════════════════════════════════════════════════════╗
 * ║                   TOPIC ROUTES (/api/topics)                 ║
 * ╠═══════════════════════════════════════════════════════════════╣
 * ║ GET    /             → Get all published topics               ║
 * ║ GET    /:slug        → Get topic by slug                      ║
 * ║ POST   /:slug/explain → Translate concept to user's language  ║
 * ║ POST   /:slug/speak  → Generate TTS audio                     ║
 * ║ POST   /:slug/validate → Validate quiz answer                 ║
 * ║ POST   /             → Admin: Create topic                    ║
 * ║ PUT    /:id          → Admin: Update topic                    ║
 * ║ DELETE /:id          → Admin: Delete topic                    ║
 * ╚═══════════════════════════════════════════════════════════════╝
 * 
 * ╔═══════════════════════════════════════════════════════════════╗
 * ║              SUBMISSION ROUTES (/api/submissions)             ║
 * ╠═══════════════════════════════════════════════════════════════╣
 * ║ POST   /             → Submit code to Judge0                  ║
 * ║ GET    /             → Get user's submissions                 ║
 * ║ GET    /:id          → Get single submission                  ║
 * ║ GET    /:id/poll     → Poll Judge0 for status                 ║
 * ╚═══════════════════════════════════════════════════════════════╝
 * 
 * ╔═══════════════════════════════════════════════════════════════╗
 * ║                  VIVA ROUTES (/api/viva)                     ║
 * ╠═══════════════════════════════════════════════════════════════╣
 * ║ POST   /start        → Start new viva session                 ║
 * ║ POST   /:id/answer   → Submit answer to question              ║
 * ║ PATCH  /:id/complete → Complete/finalize viva                 ║
 * ║ GET    /             → Get user's viva sessions               ║
 * ║ GET    /:id          → Get specific viva session              ║
 * ╚═══════════════════════════════════════════════════════════════╝
 * 
 * ╔═══════════════════════════════════════════════════════════════╗
 * ║             SKILL REPORT ROUTES (/api/skill-reports)         ║
 * ╠═══════════════════════════════════════════════════════════════╣
 * ║ POST   /             → Generate skill report certificate      ║
 * ║ GET    /             → Get user's skill reports               ║
 * ║ GET    /:id          → Get specific skill report              ║
 * ║ GET    /verify/:certId → Public certificate verification     ║
 * ║ GET    /admin/all    → Admin: View all certificates           ║
 * ╚═══════════════════════════════════════════════════════════════╝
 */

export const ROUTES_REFERENCE = {
  auth: [
    { method: 'POST', path: '/api/auth/register', auth: false },
    { method: 'POST', path: '/api/auth/login', auth: false },
    { method: 'GET', path: '/api/auth/me', auth: true },
    { method: 'PATCH', path: '/api/auth/me', auth: true },
  ],
  modules: [
    { method: 'GET', path: '/api/modules', auth: false },
    { method: 'GET', path: '/api/modules/:id', auth: false },
    { method: 'POST', path: '/api/modules', auth: 'admin' },
    { method: 'PUT', path: '/api/modules/:id', auth: 'admin' },
    { method: 'DELETE', path: '/api/modules/:id', auth: 'admin' },
  ],
  topics: [
    { method: 'GET', path: '/api/topics', auth: false },
    { method: 'GET', path: '/api/topics/:slug', auth: false },
    { method: 'POST', path: '/api/topics/:slug/explain', auth: true },
    { method: 'POST', path: '/api/topics/:slug/speak', auth: true },
    { method: 'POST', path: '/api/topics/:slug/validate', auth: true },
    { method: 'POST', path: '/api/topics', auth: 'admin' },
    { method: 'PUT', path: '/api/topics/:id', auth: 'admin' },
    { method: 'DELETE', path: '/api/topics/:id', auth: 'admin' },
  ],
  submissions: [
    { method: 'POST', path: '/api/submissions', auth: true },
    { method: 'GET', path: '/api/submissions', auth: true },
    { method: 'GET', path: '/api/submissions/:id', auth: true },
    { method: 'GET', path: '/api/submissions/:id/poll', auth: true },
  ],
  viva: [
    { method: 'POST', path: '/api/viva/start', auth: true },
    { method: 'POST', path: '/api/viva/:id/answer', auth: true },
    { method: 'PATCH', path: '/api/viva/:id/complete', auth: true },
    { method: 'GET', path: '/api/viva', auth: true },
    { method: 'GET', path: '/api/viva/:id', auth: true },
  ],
  skillReports: [
    { method: 'POST', path: '/api/skill-reports', auth: true },
    { method: 'GET', path: '/api/skill-reports', auth: true },
    { method: 'GET', path: '/api/skill-reports/:id', auth: true },
    { method: 'GET', path: '/api/skill-reports/verify/:certificateId', auth: false },
    { method: 'GET', path: '/api/admin/skill-reports', auth: 'admin' },
  ],
};
