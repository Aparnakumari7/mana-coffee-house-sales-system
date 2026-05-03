/* ============================================================
   MANA COFFEE HOUSE — Authentication Service
   Demo auth with role-based access control
   ============================================================ */

const Auth = {
  SESSION_KEY: 'mana_session',
  SESSION_DURATION: 8 * 60 * 60 * 1000, // 8 hours

  /* Demo users */
  _users: [
    { email: 'owner@mana.com',  password: 'owner123', name: 'Vikram Patel',   role: 'owner',       shopId: null },
    { email: 'east@mana.com',   password: 'sales123', name: 'Priya Sharma',   role: 'salesperson', shopId: 'EAST001' },
    { email: 'west@mana.com',   password: 'sales123', name: 'Rajesh Kumar',   role: 'salesperson', shopId: 'WEST001' },
    { email: 'north@mana.com',  password: 'sales123', name: 'Ahmed Khan',     role: 'salesperson', shopId: 'NORTH001' },
    { email: 'south@mana.com',  password: 'sales123', name: 'Srinivas Reddy', role: 'salesperson', shopId: 'SOUTH001' },
  ],

  /**
   * Attempt login with email and password via backend API
   * @returns {Promise<Object|null>} User session or null
   */
  async login(email, password) {
    try {
      const response = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      if (response.ok) {
        const user = await response.json();
        const session = {
          email: user.email,
          name: user.name,
          role: user.role,
          shopId: user.shopId,
          loginAt: Date.now(),
          expiresAt: Date.now() + this.SESSION_DURATION,
        };
        localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
        return session;
      }
      return null;
    } catch (e) {
      console.error('Login API error:', e);
      return null;
    }
  },

  /**
   * Logout the current user
   */
  logout() {
    localStorage.removeItem(this.SESSION_KEY);
    window.location.href = 'index.html';
  },

  /**
   * Get the current session (or null if expired/missing)
   */
  getSession() {
    const raw = localStorage.getItem(this.SESSION_KEY);
    if (!raw) return null;

    const session = JSON.parse(raw);

    // Check expiry
    if (Date.now() > session.expiresAt) {
      this.logout();
      return null;
    }

    return session;
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return this.getSession() !== null;
  },

  /**
   * Get user role
   */
  getRole() {
    const session = this.getSession();
    return session ? session.role : null;
  },

  /**
   * Require authentication — redirect to login if not authed
   */
  requireAuth() {
    if (!this.isAuthenticated()) {
      window.location.href = 'index.html';
      return false;
    }
    return true;
  },

  /**
   * Require a specific role — redirect if wrong role
   */
  requireRole(role) {
    if (!this.requireAuth()) return false;
    const session = this.getSession();
    if (session.role !== role && role !== 'any') {
      // Owner can access everything
      if (session.role === 'owner') return true;
      window.location.href = 'index.html';
      return false;
    }
    return true;
  },

  /**
   * Get shop data for the logged-in salesperson
   */
  getShop() {
    const session = this.getSession();
    if (!session || !session.shopId) return null;
    return SHOPS.find(s => s.id === session.shopId) || null;
  },

  /**
   * Get display name
   */
  getName() {
    const session = this.getSession();
    return session ? session.name : 'Guest';
  }
};
