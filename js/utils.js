/* ============================================================
   MANA COFFEE HOUSE — Shared Utilities
   ============================================================ */

const Utils = {
  /**
   * Format a number as Indian Rupees
   */
  formatCurrency(amount) {
    return '₹' + Number(amount).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  },

  /**
   * Format a number without decimals
   */
  formatNumber(num) {
    return Number(num).toLocaleString('en-IN');
  },

  /**
   * Format a Date object to readable date string
   */
  formatDate(date) {
    const d = new Date(date);
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  },

  /**
   * Format a Date object to time string (HH:MM:SS AM/PM)
   */
  formatTime(date) {
    const d = new Date(date);
    return d.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  },

  /**
   * Format a Date to short time (HH:MM AM/PM)
   */
  formatTimeShort(date) {
    const d = new Date(date);
    return d.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  },

  /**
   * Get today's date as YYYYMMDD string
   */
  getTodayStr() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}${m}${day}`;
  },

  /**
   * Get today's date as YYYY-MM-DD string
   */
  getTodayISO() {
    return new Date().toISOString().split('T')[0];
  },

  /**
   * Generate a unique bill number: MCH-YYYYMMDD-NNN
   */
  generateBillNumber(orderCount) {
    const dateStr = this.getTodayStr();
    const seq = String(orderCount + 1).padStart(3, '0');
    return `MCH-${dateStr}-${seq}`;
  },

  /**
   * Generate a unique ID
   */
  generateId(prefix = 'ORD') {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 6);
    return `${prefix}-${timestamp}-${random}`;
  },

  /**
   * Calculate GST (5%)
   */
  calculateTax(subtotal) {
    return Math.round(subtotal * 0.05 * 100) / 100;
  },

  /**
   * Show a toast notification
   */
  showToast(message, type = 'info') {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const icons = { success: '✅', error: '❌', info: 'ℹ️' };
    toast.innerHTML = `<span>${icons[type] || 'ℹ️'}</span> <span>${message}</span>`;

    container.prepend(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(30px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  },

  /**
   * Get a random item from an array
   */
  randomFrom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  },

  /**
   * Get a random integer between min and max (inclusive)
   */
  randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  /**
   * Truncate text with ellipsis
   */
  truncate(str, maxLen = 20) {
    if (str.length <= maxLen) return str;
    return str.substring(0, maxLen) + '…';
  },

  /**
   * Debounce function
   */
  debounce(fn, delay = 300) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  },

  /**
   * Check if a date is today
   */
  isToday(date) {
    const d = new Date(date);
    const today = new Date();
    return d.getDate() === today.getDate() &&
           d.getMonth() === today.getMonth() &&
           d.getFullYear() === today.getFullYear();
  },

  /**
   * Get the hour of day (0-23) from a date
   */
  getHour(date) {
    return new Date(date).getHours();
  },

  /**
   * Calculate percentage change between two values
   */
  percentChange(current, previous) {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  },

  /**
   * Export data as CSV download
   */
  exportCSV(data, filename = 'export.csv') {
    if (!data || data.length === 0) return;

    const headers = Object.keys(data[0]);
    const rows = data.map(row =>
      headers.map(h => {
        let val = row[h];
        if (typeof val === 'string' && val.includes(',')) {
          val = `"${val}"`;
        }
        return val;
      }).join(',')
    );

    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }
};
