/* ============================================================
   MANA COFFEE HOUSE — POS Page Logic
   Cart management, menu browsing, order processing
   ============================================================ */

const POS = {
  cart: [],
  currentCategory: 'all',
  searchQuery: '',

  /* ── Initialization ── */
  init() {
    if (!Auth.requireAuth()) return;

    const session = Auth.getSession();
    DataService.init();

    // Set nav info
    const shop = Auth.getShop();
    document.getElementById('nav-user-name').textContent = session.name;

    if (shop) {
      document.getElementById('nav-shop-name').textContent = shop.name;
    } else {
      // Owner accessing POS — show shop selector
      document.getElementById('nav-shop-name').textContent = 'All Locations';
    }

    // Bind events
    this._bindEvents();

    // Render menu
    this._renderCategories();
    this._renderMenu();
    this._updateCartDisplay();
  },

  /* ── Event Bindings ── */
  _bindEvents() {
    // Category tabs
    document.getElementById('category-tabs').addEventListener('click', (e) => {
      const tab = e.target.closest('.category-tab');
      if (!tab) return;
      this.currentCategory = tab.dataset.category;
      document.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      this._renderMenu();
    });

    // Search
    const searchInput = document.getElementById('menu-search');
    searchInput.addEventListener('input', Utils.debounce((e) => {
      this.searchQuery = e.target.value.toLowerCase();
      this._renderMenu();
    }, 200));

    // Cart clear
    document.getElementById('btn-clear-cart').addEventListener('click', () => {
      this.cart = [];
      this._updateCartDisplay();
      Utils.showToast('Cart cleared', 'info');
    });

    // Generate bill
    document.getElementById('btn-generate-bill').addEventListener('click', () => {
      this._handleGenerateBill();
    });

    // Discount apply
    document.getElementById('btn-apply-discount').addEventListener('click', () => {
      this._applyDiscount();
    });

    // Logout
    document.getElementById('btn-logout').addEventListener('click', () => {
      Auth.logout();
    });

    // Modal close
    document.getElementById('modal-close').addEventListener('click', () => {
      this._closeModal();
    });

    document.getElementById('bill-modal-overlay').addEventListener('click', (e) => {
      if (e.target === e.currentTarget) this._closeModal();
    });

    // Download PDF
    document.getElementById('btn-download-pdf').addEventListener('click', () => {
      this._downloadPDF();
    });
  },

  /* ── Render Categories ── */
  _renderCategories() {
    const container = document.getElementById('category-tabs');
    container.innerHTML = MENU_CATEGORIES.map(cat => `
      <button class="category-tab ${cat.id === 'all' ? 'active' : ''}" data-category="${cat.id}">
        <span class="tab-emoji">${cat.emoji}</span>
        <span>${cat.name}</span>
      </button>
    `).join('');
  },

  /* ── Render Menu Grid ── */
  _renderMenu() {
    const container = document.getElementById('menu-grid');

    let items = MENU_ITEMS;

    // Category filter
    if (this.currentCategory !== 'all') {
      items = items.filter(item => item.category === this.currentCategory);
    }

    // Search filter
    if (this.searchQuery) {
      items = items.filter(item =>
        item.name.toLowerCase().includes(this.searchQuery) ||
        item.emoji.includes(this.searchQuery) ||
        item.category.toLowerCase().includes(this.searchQuery)
      );
    }

    if (items.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-muted);">
          <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">🔍</div>
          <p>No items found</p>
        </div>
      `;
      return;
    }

    container.innerHTML = items.map(item => `
      <div class="menu-item ${item.isAvailable ? '' : 'out-of-stock'}"
           data-item-id="${item.id}"
           onclick="POS.addToCart('${item.id}')">
        ${item.isPopular ? '<span class="popular-badge">🔥</span>' : ''}
        <div class="item-emoji">${item.emoji}</div>
        <div class="item-name">${item.name}</div>
        <div class="item-price">${Utils.formatCurrency(item.price)}</div>
        ${!item.isAvailable ? '<div style="font-size:0.65rem;color:var(--color-danger);margin-top:4px;">Out of stock</div>' : ''}
        <div class="add-indicator">✓</div>
      </div>
    `).join('');
  },

  /* ── Add Item to Cart ── */
  addToCart(itemId) {
    const menuItem = MENU_ITEMS.find(m => m.id === itemId);
    if (!menuItem || !menuItem.isAvailable) return;

    const existing = this.cart.find(c => c.menuId === itemId);

    if (existing) {
      if (existing.quantity >= 20) {
        Utils.showToast('Maximum 20 per item!', 'error');
        return;
      }
      existing.quantity++;
      existing.totalPrice = existing.unitPrice * existing.quantity;
    } else {
      this.cart.push({
        menuId: menuItem.id,
        name: menuItem.name,
        emoji: menuItem.emoji,
        unitPrice: menuItem.price,
        quantity: 1,
        totalPrice: menuItem.price,
      });
    }

    // Flash the add indicator
    const el = document.querySelector(`.menu-item[data-item-id="${itemId}"]`);
    if (el) {
      el.classList.add('just-added');
      setTimeout(() => el.classList.remove('just-added'), 400);
    }

    this._updateCartDisplay();
  },

  /* ── Update Cart Quantity ── */
  updateQuantity(menuId, delta) {
    const item = this.cart.find(c => c.menuId === menuId);
    if (!item) return;

    item.quantity += delta;

    if (item.quantity <= 0) {
      this.cart = this.cart.filter(c => c.menuId !== menuId);
    } else if (item.quantity > 20) {
      item.quantity = 20;
      Utils.showToast('Maximum 20 per item!', 'error');
    }

    if (item.quantity > 0) {
      item.totalPrice = item.unitPrice * item.quantity;
    }

    this._updateCartDisplay();
  },

  /* ── Remove Item from Cart ── */
  removeFromCart(menuId) {
    this.cart = this.cart.filter(c => c.menuId !== menuId);
    this._updateCartDisplay();
  },

  /* ── Update Cart Display ── */
  _updateCartDisplay() {
    const cartContainer = document.getElementById('cart-items');
    const cartCount = document.getElementById('cart-count');
    const totalItems = this.cart.reduce((sum, i) => sum + i.quantity, 0);
    cartCount.textContent = totalItems;

    if (this.cart.length === 0) {
      cartContainer.innerHTML = `
        <div class="cart-empty">
          <div class="empty-icon">🛒</div>
          <p>Your cart is empty</p>
          <p style="font-size: 0.75rem; margin-top: 0.5rem;">Click items to add them</p>
        </div>
      `;
    } else {
      cartContainer.innerHTML = this.cart.map(item => `
        <div class="cart-item">
          <span class="ci-emoji">${item.emoji}</span>
          <div class="ci-details">
            <div class="ci-name">${item.name}</div>
            <div class="ci-price">${Utils.formatCurrency(item.unitPrice)} each</div>
          </div>
          <div class="ci-qty">
            <button onclick="POS.updateQuantity('${item.menuId}', -1)">−</button>
            <span class="qty-val">${item.quantity}</span>
            <button onclick="POS.updateQuantity('${item.menuId}', 1)">+</button>
          </div>
          <div class="ci-total">${Utils.formatCurrency(item.totalPrice)}</div>
          <button class="ci-remove" onclick="POS.removeFromCart('${item.menuId}')" title="Remove">✕</button>
        </div>
      `).join('');
    }

    // Update totals
    this._updateTotals();
  },

  /* ── Calculate & Display Totals ── */
  _updateTotals() {
    const subtotal = this.cart.reduce((sum, i) => sum + i.totalPrice, 0);
    const tax = Utils.calculateTax(subtotal);
    const discountVal = this._currentDiscount || 0;
    const total = subtotal + tax - discountVal;

    document.getElementById('subtotal-value').textContent = Utils.formatCurrency(subtotal);
    document.getElementById('tax-value').textContent = Utils.formatCurrency(tax);
    document.getElementById('discount-value').textContent = Utils.formatCurrency(discountVal);
    document.getElementById('total-value').textContent = Utils.formatCurrency(Math.max(0, total));

    // Enable/disable generate button
    const genBtn = document.getElementById('btn-generate-bill');
    genBtn.disabled = this.cart.length === 0;
    genBtn.style.opacity = this.cart.length === 0 ? '0.5' : '1';
  },

  _currentDiscount: 0,

  /* ── Apply Discount ── */
  _applyDiscount() {
    const input = document.getElementById('discount-input');
    const code = input.value.trim().toUpperCase();

    if (!code) {
      Utils.showToast('Enter a discount code', 'error');
      return;
    }

    // Demo discount codes
    const codes = {
      'MANA10': 10,   // 10% off
      'COFFEE20': 20, // 20% off
      'WELCOME': 15,  // 15% off
    };

    if (codes[code] !== undefined) {
      const subtotal = this.cart.reduce((sum, i) => sum + i.totalPrice, 0);
      const discountPercent = codes[code];
      this._currentDiscount = Math.round(subtotal * (discountPercent / 100) * 100) / 100;

      // Enforce max 50% discount
      const maxDiscount = subtotal * 0.5;
      if (this._currentDiscount > maxDiscount) {
        this._currentDiscount = maxDiscount;
      }

      Utils.showToast(`${discountPercent}% discount applied!`, 'success');
    } else {
      this._currentDiscount = 0;
      Utils.showToast('Invalid discount code', 'error');
    }

    this._updateTotals();
  },

  /* ── Generate Bill ── */
  async _handleGenerateBill() {
    if (this.cart.length === 0) {
      Utils.showToast('Add items to cart first!', 'error');
      return;
    }

    const customerName = document.getElementById('customer-name').value.trim();
    const customerPhone = document.getElementById('customer-phone').value.trim();

    if (!customerName) {
      Utils.showToast('Please enter customer name', 'error');
      document.getElementById('customer-name').focus();
      return;
    }

    // Minimum order check
    const subtotal = this.cart.reduce((sum, i) => sum + i.totalPrice, 0);
    if (subtotal < 20) {
      Utils.showToast('Minimum order is ₹20', 'error');
      return;
    }

    const session = Auth.getSession();
    const shop = Auth.getShop() || SHOPS[0];

    const tax = Utils.calculateTax(subtotal);
    const discount = this._currentDiscount || 0;
    const totalAmount = Math.round((subtotal + tax - discount) * 100) / 100;

    const order = {
      shopId: shop.id,
      salespersonName: session.name,
      customerName,
      customerPhone,
      items: this.cart.map(c => ({ ...c })),
      subtotal,
      tax,
      discount,
      totalAmount,
      paymentMethod: 'Cash',
    };

    // Save to database
    const savedOrder = await DataService.saveOrder(order);
    
    if (!savedOrder) {
        Utils.showToast('Failed to generate bill. Please try again.', 'error');
        return;
    }

    // Store for PDF download
    this._lastOrder = savedOrder;
    this._lastShop = shop;

    // Show bill preview modal
    this._showBillPreview(savedOrder, shop);
  },

  /* ── Show Bill Preview Modal ── */
  _showBillPreview(order, shop) {
    const previewHTML = PDFGenerator.getBillPreviewHTML(order, shop);
    document.getElementById('bill-preview-content').innerHTML = previewHTML;
    document.getElementById('bill-modal-overlay').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  },

  /* ── Close Modal ── */
  _closeModal() {
    document.getElementById('bill-modal-overlay').classList.add('hidden');
    document.body.style.overflow = '';

    // Reset cart after bill generation
    this.cart = [];
    this._currentDiscount = 0;
    document.getElementById('customer-name').value = '';
    document.getElementById('customer-phone').value = '';
    document.getElementById('discount-input').value = '';
    this._updateCartDisplay();
  },

  /* ── Download PDF ── */
  async _downloadPDF() {
    if (!this._lastOrder || !this._lastShop) return;
    await PDFGenerator.generateBill(this._lastOrder, this._lastShop);
  },
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => POS.init());
