// ═══════════════════════════════════════════════════
// ARBRE BIO AFRICA — UI HELPERS
// ═══════════════════════════════════════════════════

const UI = {
  // ── Toast ─────────────────────────────────────────
  _toastContainer: null,

  _getToastContainer() {
    if (!this._toastContainer) {
      this._toastContainer = document.createElement('div');
      this._toastContainer.className = 'toast-container';
      document.body.appendChild(this._toastContainer);
    }
    return this._toastContainer;
  },

  toast(message, type = 'default', duration = 3500) {
    const c = this._getToastContainer();
    const t = document.createElement('div');
    const icons = { success: '✓', error: '✕', default: 'ℹ' };
    t.className = `toast ${type}`;
    t.innerHTML = `<span>${icons[type] || icons.default}</span><span>${message}</span>`;
    c.appendChild(t);
    setTimeout(() => { t.style.opacity = '0'; t.style.transform = 'translateX(20px)'; t.style.transition = 'all .3s'; setTimeout(() => t.remove(), 300); }, duration);
  },

  // ── Modal ─────────────────────────────────────────
  openModal(id) {
    const m = document.getElementById(id);
    if (m) { m.classList.add('open'); document.body.style.overflow = 'hidden'; }
  },

  closeModal(id) {
    const m = document.getElementById(id);
    if (m) { m.classList.remove('open'); document.body.style.overflow = ''; }
  },

  // ── Confirm ───────────────────────────────────────
  confirm(message) {
    return window.confirm(message);
  },

  // ── DOM helpers ───────────────────────────────────
  $(sel, ctx = document) { return ctx.querySelector(sel); },
  $$(sel, ctx = document) { return [...ctx.querySelectorAll(sel)]; },

  setHTML(sel, html, ctx = document) {
    const el = ctx.querySelector(sel);
    if (el) el.innerHTML = html;
  },

  setText(sel, text, ctx = document) {
    const el = ctx.querySelector(sel);
    if (el) el.textContent = text;
  },

  show(sel, ctx = document) {
    const el = typeof sel === 'string' ? ctx.querySelector(sel) : sel;
    if (el) el.style.display = '';
  },

  hide(sel, ctx = document) {
    const el = typeof sel === 'string' ? ctx.querySelector(sel) : sel;
    if (el) el.style.display = 'none';
  },

  // ── Render sidebar user info ───────────────────────
  renderSidebar(session) {
    if (!session) return;
    const user = DB.getUserById(session.userId);
    if (!user) return;
    const nameEl  = document.getElementById('sb-user-name');
    const roleEl  = document.getElementById('sb-user-role');
    const avEl    = document.getElementById('sb-user-av');
    const badgeEl = document.getElementById('sb-role-badge');
    if (nameEl)  nameEl.textContent  = user.name;
    if (roleEl)  roleEl.textContent  = DB.roleLabel(user.role);
    if (avEl) {
      if (user.avatarPhoto) {
        avEl.innerHTML = `<img src="${user.avatarPhoto}" alt="${DB.esc(user.name)}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;display:block;">`;
      } else {
        avEl.textContent = user.avatar || user.name.slice(0,2).toUpperCase();
      }
    }
    if (badgeEl) badgeEl.textContent = DB.roleLabel(user.role);

    // Make avatar + name clickable → profile page (same directory)
    if (avEl) { avEl.style.cursor = 'pointer'; avEl.title = 'Mon profil'; avEl.onclick = (e) => { e.stopPropagation(); window.location.href = 'profile.html'; }; }
    const infoEl = document.querySelector('.user-info');
    if (infoEl) { infoEl.style.cursor = 'pointer'; infoEl.title = 'Mon profil'; infoEl.onclick = (e) => { e.stopPropagation(); window.location.href = 'profile.html'; }; }
  },

  // ── Active nav item ───────────────────────────────
  setActiveNav(href) {
    document.querySelectorAll('.nav-item').forEach(el => {
      el.classList.toggle('active', el.getAttribute('href') === href);
    });
  },

  // ── Badge helpers ─────────────────────────────────
  roleBadge(role) {
    const map = {
      super_admin: ['badge-red', 'Super Admin'],
      engineer:    ['badge-green', 'Ingénieur'],
      technician:  ['badge-blue', 'Technicien'],
    };
    const [cls, label] = map[role] || ['badge-gray', role];
    return `<span class="badge ${cls}">${label}</span>`;
  },

  statusBadge(status) {
    const map = {
      submitted: ['badge-green', 'Soumis'],
      draft:     ['badge-amber', 'Brouillon'],
      active:    ['badge-green', 'Actif'],
      archived:  ['badge-gray', 'Archivé'],
    };
    const [cls, label] = map[status] || ['badge-gray', status];
    return `<span class="badge ${cls}">${label}</span>`;
  },

  projectTypeBadges(types = []) {
    if (!types.length) return '<span class="text-muted">—</span>';
    return types.map(t => `<span class="badge badge-green">${DB.projectTypeLabels[t] || t}</span>`).join(' ');
  },

  // ── Form validation ───────────────────────────────
  validateRequired(formEl) {
    let valid = true;
    formEl.querySelectorAll('[required]').forEach(el => {
      el.classList.remove('is-error');
      if (!el.value.trim()) {
        el.classList.add('is-error');
        valid = false;
      }
    });
    return valid;
  },

  // ── Photo data URL ────────────────────────────────
  fileToDataURL(file) {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = e => resolve(e.target.result);
      r.onerror = () => reject(new Error('Lecture fichier échouée'));
      r.readAsDataURL(file);
    });
  },

  // ── Checkbox group value helpers ──────────────────
  getCheckedValues(name) {
    return [...document.querySelectorAll(`input[name="${name}"]:checked`)].map(el => el.value);
  },

  // ── Scroll to top of section ──────────────────────
  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },
};
