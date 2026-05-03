/* ============================================================
   MANA COFFEE HOUSE — PDF Bill Generator
   Uses html2pdf.js to create downloadable PDF bills
   ============================================================ */

const PDFGenerator = {

  /**
   * Generate and download a PDF bill for an order
   * @param {Object} order - The order data
   * @param {Object} shop - The shop data
   */
  async generateBill(order, shop) {
    const billHTML = this._createBillHTML(order, shop);

    // Create a temporary container
    const container = document.createElement('div');
    container.innerHTML = billHTML;
    container.style.position = 'fixed';
    container.style.left = '-9999px';
    container.style.top = '0';
    document.body.appendChild(container);

    const element = container.querySelector('.pdf-bill');

    const opt = {
      margin:       [5, 5, 5, 5],
      filename:     `${order.billNumber}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'mm', format: [80, 200], orientation: 'portrait' },
    };

    try {
      await html2pdf().set(opt).from(element).save();
      Utils.showToast(`Bill ${order.billNumber} downloaded!`, 'success');
    } catch (err) {
      console.error('PDF generation error:', err);
      Utils.showToast('Failed to generate PDF. Showing preview instead.', 'error');
    } finally {
      document.body.removeChild(container);
    }
  },

  /**
   * Show a bill preview in a modal (called before PDF download)
   * @returns {string} HTML string for the bill content
   */
  getBillPreviewHTML(order, shop) {
    return this._createBillContentHTML(order, shop);
  },

  /**
   * Create the full bill HTML structure for PDF
   */
  _createBillHTML(order, shop) {
    return `
      <div class="pdf-bill" style="
        width: 280px;
        padding: 15px;
        font-family: 'Courier New', Courier, monospace;
        font-size: 12px;
        color: #333;
        background: #fff;
        line-height: 1.5;
      ">
        ${this._createBillContentHTML(order, shop)}
      </div>
    `;
  },

  /**
   * Create the bill content HTML (shared between preview & PDF)
   */
  _createBillContentHTML(order, shop) {
    const itemsHTML = (order.items || []).map(item => `
      <tr>
        <td style="padding: 3px 0; font-size: 12px;">${item.name}</td>
        <td style="padding: 3px 0; text-align: center; font-size: 12px;">${item.quantity}</td>
        <td style="padding: 3px 0; text-align: right; font-size: 12px;">₹${item.unitPrice}</td>
        <td style="padding: 3px 0; text-align: right; font-size: 12px;">₹${item.totalPrice}</td>
      </tr>
    `).join('');

    const dateStr = Utils.formatDate(order.timestamp);
    const timeStr = Utils.formatTimeShort(order.timestamp);

    return `
      <!-- Header -->
      <div style="text-align: center; border-bottom: 2px dashed #aaa; padding-bottom: 10px; margin-bottom: 10px;">
        <div style="font-size: 12px;">☕</div>
        <div style="font-size: 18px; font-weight: bold; font-family: 'Outfit', sans-serif; color: #1a0f0a; margin: 4px 0;">
          MANA COFFEE HOUSE
        </div>
        <div style="font-size: 10px; color: #888; font-style: italic;">
          "Taste That Brings Us Together"
        </div>
        <div style="font-size: 10px; color: #666; margin-top: 4px;">
          ${shop ? shop.address : 'Hyderabad'}
        </div>
        <div style="font-size: 10px; color: #666;">
          Ph: ${shop ? shop.phone : 'N/A'}
        </div>
      </div>

      <!-- Bill Info -->
      <div style="font-size: 11px; margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px dashed #ccc;">
        <div style="display: flex; justify-content: space-between;">
          <span>Bill #:</span>
          <strong>${order.billNumber}</strong>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span>Date:</span>
          <span>${dateStr}</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span>Time:</span>
          <span>${timeStr}</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span>Customer:</span>
          <span>${order.customerName || 'Walk-in'}</span>
        </div>
        ${order.customerPhone ? `
        <div style="display: flex; justify-content: space-between;">
          <span>Phone:</span>
          <span>${order.customerPhone}</span>
        </div>` : ''}
        <div style="display: flex; justify-content: space-between;">
          <span>Server:</span>
          <span>${order.salespersonName || 'Staff'}</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span>Location:</span>
          <span>${shop ? shop.area + ' Hyd' : 'N/A'}</span>
        </div>
      </div>

      <!-- Items Table -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px;">
        <thead>
          <tr style="border-bottom: 1px solid #999;">
            <th style="text-align: left; padding: 4px 0; font-size: 11px; color: #555;">Item</th>
            <th style="text-align: center; padding: 4px 0; font-size: 11px; color: #555;">Qty</th>
            <th style="text-align: right; padding: 4px 0; font-size: 11px; color: #555;">Price</th>
            <th style="text-align: right; padding: 4px 0; font-size: 11px; color: #555;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHTML}
        </tbody>
      </table>

      <!-- Totals -->
      <div style="border-top: 1px dashed #ccc; padding-top: 8px;">
        <div style="display: flex; justify-content: space-between; font-size: 12px; color: #555; padding: 2px 0;">
          <span>Subtotal</span>
          <span>₹${order.subtotal.toFixed(2)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 12px; color: #555; padding: 2px 0;">
          <span>GST (5%)</span>
          <span>₹${order.tax.toFixed(2)}</span>
        </div>
        ${order.discount > 0 ? `
        <div style="display: flex; justify-content: space-between; font-size: 12px; color: #27ae60; padding: 2px 0;">
          <span>Discount</span>
          <span>-₹${order.discount.toFixed(2)}</span>
        </div>` : ''}
        <div style="display: flex; justify-content: space-between; font-size: 16px; font-weight: bold; color: #1a0f0a; border-top: 2px solid #333; margin-top: 4px; padding-top: 6px;">
          <span>TOTAL</span>
          <span>₹${order.totalAmount.toFixed(2)}</span>
        </div>
      </div>

      <!-- Payment -->
      <div style="margin-top: 8px; font-size: 11px; color: #555; padding-bottom: 10px; border-bottom: 1px dashed #ccc;">
        <div style="display: flex; justify-content: space-between;">
          <span>Payment:</span>
          <span>${order.paymentMethod || 'Cash'}</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span>Status:</span>
          <span style="color: #27ae60; font-weight: bold;">Paid ✓</span>
        </div>
      </div>

      <!-- Footer -->
      <div style="text-align: center; margin-top: 10px; font-size: 11px; color: #888;">
        <div style="font-size: 13px; color: #333; font-weight: bold; margin-bottom: 4px;">
          Thank you! Visit again ☕
        </div>
        <div>Follow us: @manacoffeehouse</div>
        <div style="margin-top: 4px; font-size: 10px;">www.manacoffeehouse.com</div>
      </div>
    `;
  }
};
