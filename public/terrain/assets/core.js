// ═══════════════════════════════════════════════════
// ARBRE BIO AFRICA — CORE DATA LAYER
// ═══════════════════════════════════════════════════

const DB = {
  // ── Keys ──────────────────────────────────────────
  KEYS: {
    USERS: 'ab_users',
    PROJECTS: 'ab_projects',
    VISITS: 'ab_visits',
    SESSION: 'ab_session',
    TASKS: 'ab_tasks',
    REPORTS: 'ab_reports',
  },

  // ── Init seed data ────────────────────────────────
  init() {
    if (!localStorage.getItem(this.KEYS.USERS)) {
      const users = [
        {
          id: 'usr_001',
          name: 'Admin Arbre Bio',
          email: 'admin@arbrebio.com',
          password: this._hash('Admin2024!'),
          role: 'super_admin',
          createdAt: new Date().toISOString(),
          active: true,
          avatar: 'AA',
        }
      ];
      localStorage.setItem(this.KEYS.USERS, JSON.stringify(users));
    }
    if (!localStorage.getItem(this.KEYS.PROJECTS)) {
      localStorage.setItem(this.KEYS.PROJECTS, JSON.stringify([]));
    }
    if (!localStorage.getItem(this.KEYS.VISITS)) {
      localStorage.setItem(this.KEYS.VISITS, JSON.stringify([]));
    }
    if (!localStorage.getItem(this.KEYS.TASKS)) {
      localStorage.setItem(this.KEYS.TASKS, JSON.stringify([]));
    }
  },

  // ── Simple hash (demo only — use bcrypt server-side in prod) ──
  _hash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return 'h_' + Math.abs(hash).toString(36);
  },

  // ── XSS-safe text escaping ─────────────────────────
  esc(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  },

  // ── Auth ──────────────────────────────────────────
  login(email, password) {
    const users = this.getUsers();
    const user = users.find(u => u.email === email && u.password === this._hash(password) && u.active);
    if (user) {
      const session = { userId: user.id, role: user.role, name: user.name, loginAt: new Date().toISOString() };
      sessionStorage.setItem(this.KEYS.SESSION, JSON.stringify(session));
      return { ok: true, user, session };
    }
    return { ok: false, error: 'Identifiants incorrects ou compte désactivé.' };
  },

  logout() {
    sessionStorage.removeItem(this.KEYS.SESSION);
  },

  getSession() {
    const raw = sessionStorage.getItem(this.KEYS.SESSION);
    return raw ? JSON.parse(raw) : null;
  },

  requireAuth(allowedRoles = []) {
    const session = this.getSession();
    if (!session) { window.location.href = this._loginPath(); return null; }
    if (allowedRoles.length && !allowedRoles.includes(session.role)) {
      window.location.href = this._loginPath();
      return null;
    }
    return session;
  },

  _loginPath() {
    const depth = window.location.pathname.split('/').filter(Boolean).length;
    return depth > 2 ? '../login.html' : 'login.html';
  },

  // ── Users ──────────────────────────────────────────
  getUsers() {
    return JSON.parse(localStorage.getItem(this.KEYS.USERS) || '[]');
  },

  getUserById(id) {
    return this.getUsers().find(u => u.id === id) || null;
  },

  saveUser(user) {
    const users = this.getUsers();
    const idx = users.findIndex(u => u.id === user.id);
    if (idx >= 0) users[idx] = user;
    else users.push(user);
    localStorage.setItem(this.KEYS.USERS, JSON.stringify(users));
    return user;
  },

  createUser({ name, email, password, role }) {
    const users = this.getUsers();
    if (users.find(u => u.email === email)) return { ok: false, error: 'Email déjà utilisé.' };
    const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    const user = {
      id: 'usr_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
      name, email,
      password: this._hash(password),
      role,
      createdAt: new Date().toISOString(),
      active: true,
      avatar: initials,
    };
    users.push(user);
    localStorage.setItem(this.KEYS.USERS, JSON.stringify(users));
    return { ok: true, user };
  },

  deleteUser(id) {
    let users = this.getUsers();
    users = users.filter(u => u.id !== id);
    localStorage.setItem(this.KEYS.USERS, JSON.stringify(users));
  },

  toggleUserActive(id) {
    const users = this.getUsers();
    const u = users.find(u => u.id === id);
    if (u) { u.active = !u.active; localStorage.setItem(this.KEYS.USERS, JSON.stringify(users)); }
    return u;
  },

  // ── Projects ──────────────────────────────────────
  getProjects() {
    return JSON.parse(localStorage.getItem(this.KEYS.PROJECTS) || '[]');
  },

  getProjectById(id) {
    return this.getProjects().find(p => p.id === id) || null;
  },

  saveProject(project) {
    const projects = this.getProjects();
    const idx = projects.findIndex(p => p.id === project.id);
    if (idx >= 0) projects[idx] = project;
    else projects.push(project);
    localStorage.setItem(this.KEYS.PROJECTS, JSON.stringify(projects));
    return project;
  },

  createProject(data) {
    const project = {
      id: 'prj_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
      ...data,
      createdAt: new Date().toISOString(),
      status: 'active',
    };
    const projects = this.getProjects();
    projects.push(project);
    localStorage.setItem(this.KEYS.PROJECTS, JSON.stringify(projects));
    return project;
  },

  // ── Visits ────────────────────────────────────────
  getVisits() {
    return JSON.parse(localStorage.getItem(this.KEYS.VISITS) || '[]');
  },

  getVisitById(id) {
    return this.getVisits().find(v => v.id === id) || null;
  },

  getVisitsByProject(projectId) {
    return this.getVisits().filter(v => v.projectId === projectId);
  },

  getVisitsByUser(userId) {
    return this.getVisits().filter(v => v.visitedBy === userId);
  },

  saveVisit(visit) {
    const visits = this.getVisits();
    const idx = visits.findIndex(v => v.id === visit.id);
    if (idx >= 0) visits[idx] = visit;
    else visits.push(visit);
    localStorage.setItem(this.KEYS.VISITS, JSON.stringify(visits));
    return visit;
  },

  createVisit(data) {
    const visit = {
      id: 'vis_' + Date.now(),
      ...data,
      createdAt: new Date().toISOString(),
      status: 'submitted',
    };
    const visits = this.getVisits();
    visits.push(visit);
    localStorage.setItem(this.KEYS.VISITS, JSON.stringify(visits));

    // Auto-create project if new
    if (data.clientName && !data.projectId) {
      const project = this.createProject({
        title: `Projet ${data.clientName}`,
        clientName: data.clientName,
        clientPhone: data.clientPhone || '',
        location: data.siteAddress || '',
        zone: data.zone || '',
        assignedTo: data.visitedBy,
      });
      visit.projectId = project.id;
      this.saveVisit(visit);
    }
    return visit;
  },

  // ── Stats ─────────────────────────────────────────
  getStats() {
    const users = this.getUsers();
    const projects = this.getProjects();
    const visits = this.getVisits();
    return {
      totalUsers: users.filter(u => u.role !== 'super_admin').length,
      engineers: users.filter(u => u.role === 'engineer').length,
      technicians: users.filter(u => u.role === 'technician').length,
      totalProjects: projects.length,
      totalVisits: visits.length,
      thisMonth: visits.filter(v => {
        const d = new Date(v.createdAt);
        const now = new Date();
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }).length,
    };
  },

  // ── Helpers ───────────────────────────────────────
  formatDate(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  },

  formatDateTime(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  },

  roleLabel(role) {
    return { super_admin: 'Super Admin', engineer: 'Ingénieur Agronome', technician: 'Technicien' }[role] || role;
  },

  projectTypeLabels: {
    greenhouse: 'Serre tropicale',
    irrigation: 'Système d\'irrigation',
    substrate: 'Substrat (coco/fibres)',
    crops: 'Installation cultures',
    consulting: 'Consulting agronomique',
    equipment: 'Équipements agricoles',
  },

  // ── Visit Confirmation ────────────────────────────
  confirmVisit(visitId) {
    const visit = this.getVisitById(visitId);
    if (!visit) return { ok: false, error: 'Visite introuvable.' };
    visit.status = 'confirmed';
    visit.confirmedAt = new Date().toISOString();
    this.saveVisit(visit);
    // update project status too
    if (visit.projectId) {
      const project = this.getProjectById(visit.projectId);
      if (project) { project.status = 'confirmed'; this.saveProject(project); }
    }
    return { ok: true, visit };
  },

  startProject(visitId) {
    const visit = this.getVisitById(visitId);
    if (!visit) return { ok: false, error: 'Visite introuvable.' };
    visit.status = 'in_progress';
    visit.startedAt = new Date().toISOString();
    this.saveVisit(visit);
    if (visit.projectId) {
      const project = this.getProjectById(visit.projectId);
      if (project) { project.status = 'in_progress'; project.startedAt = new Date().toISOString(); this.saveProject(project); }
    }
    return { ok: true, visit };
  },

  // ── Tasks ─────────────────────────────────────────
  getTasks() {
    return JSON.parse(localStorage.getItem(this.KEYS.TASKS) || '[]');
  },

  getTaskById(id) {
    return this.getTasks().find(t => t.id === id) || null;
  },

  getTasksByProject(projectId) {
    return this.getTasks().filter(t => t.projectId === projectId);
  },

  createTask(data) {
    const task = {
      id: 'tsk_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
      ...data,
      status: data.status || 'todo',
      assignees: data.assignees || [],
      proofPhotos: [],
      comments: [],
      createdAt: new Date().toISOString(),
      completedBy: null,
      completedAt: null,
    };
    const tasks = this.getTasks();
    tasks.push(task);
    localStorage.setItem(this.KEYS.TASKS, JSON.stringify(tasks));
    return task;
  },

  saveTask(task) {
    const tasks = this.getTasks();
    const idx = tasks.findIndex(t => t.id === task.id);
    if (idx >= 0) tasks[idx] = task;
    else tasks.push(task);
    localStorage.setItem(this.KEYS.TASKS, JSON.stringify(tasks));
    return task;
  },

  deleteTask(id) {
    let tasks = this.getTasks();
    tasks = tasks.filter(t => t.id !== id);
    localStorage.setItem(this.KEYS.TASKS, JSON.stringify(tasks));
  },

  addTaskComment(taskId, { authorId, text }) {
    const task = this.getTaskById(taskId);
    if (!task) return null;
    const comment = { id: 'cmt_' + Date.now(), authorId, text, createdAt: new Date().toISOString() };
    task.comments = task.comments || [];
    task.comments.push(comment);
    this.saveTask(task);
    return comment;
  },

  addTaskProof(taskId, { dataURL, label, uploadedBy }) {
    const task = this.getTaskById(taskId);
    if (!task) return null;
    const photo = { id: 'prf_' + Date.now(), dataURL, label, uploadedBy, uploadedAt: new Date().toISOString() };
    task.proofPhotos = task.proofPhotos || [];
    task.proofPhotos.push(photo);
    if (task.status === 'todo' || task.status === 'in_progress') {
      task.status = 'review';
    }
    this.saveTask(task);
    return photo;
  },

  completeTask(taskId, userId) {
    const task = this.getTaskById(taskId);
    if (!task) return null;
    task.status = 'done';
    task.completedBy = userId;
    task.completedAt = new Date().toISOString();
    this.saveTask(task);
    return task;
  },

  taskStatusLabel(status) {
    return { todo: 'À faire', in_progress: 'En cours', review: 'En révision', done: 'Terminé' }[status] || status;
  },

  taskPriorityLabel(priority) {
    return { high: 'Haute', medium: 'Moyenne', low: 'Basse' }[priority] || priority;
  },
};

// Auto-init on load
DB.init();
