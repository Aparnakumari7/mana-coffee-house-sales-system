/* ============================================================
   MANA COFFEE HOUSE — Dashboard Page Logic
   KPIs, Charts (Plotly), Live Sales Feed, Export
   ============================================================ */

const Dashboard = {
  refreshInterval: null,
  REFRESH_MS: 10000,  // Fallback poll interval (BroadcastChannel handles instant updates)
  _lastOrderCount: 0, // Track to detect new sales
  _lastTopSaleId: null,
  _currentShopId: 'all',
  _currentTimeFilter: 'today',

  /* ── Initialization ── */
  async init() {
    if (!Auth.requireAuth()) return;

    const session = Auth.getSession();
    DataService.init();

    // Set nav info
    document.getElementById('nav-user-name').textContent = session.name;

    // Set up shop filter based on role
    if (session.role === 'owner') {
      this._currentShopId = 'all';
      const filterEl = document.getElementById('shop-filter');
      if (filterEl) {
        SHOPS.forEach(shop => {
          const opt = document.createElement('option');
          opt.value = shop.id;
          opt.textContent = shop.name;
          filterEl.appendChild(opt);
        });
        filterEl.style.display = 'inline-block';
        filterEl.addEventListener('change', async (e) => {
          this._currentShopId = e.target.value;
          this._lastOrderCount = await DataService.getTodayOrderCount(this._currentShopId);
          await this._renderDashboard();
        });
      }
    } else {
      this._currentShopId = session.shopId;
    }

    // Set up time filter
    const timeFilterEl = document.getElementById('time-filter');
    if (timeFilterEl) {
      timeFilterEl.addEventListener('change', async (e) => {
        this._currentTimeFilter = e.target.value;
        await this._renderDashboard();
      });
    }

    // Bind events
    this._bindEvents();

    // Listen for real-time sales (from BroadcastChannel / same-tab)
    DataService.on('sale:new', async (order) => {
      await this._onNewSale(order);
    });

    DataService.on('sales:updated', async () => {
      await this._renderDashboard();
    });

    // Initial render & snapshot
    this._lastOrderCount = await DataService.getTodayOrderCount(this._currentShopId);
    let todayOrders = await DataService.getTodayOrders();
    if (this._currentShopId !== 'all') {
      todayOrders = todayOrders.filter(o => o.shopId === this._currentShopId);
    }
    if (todayOrders.length > 0) {
      this._lastTopSaleId = todayOrders.sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp))[0].orderId;
    }
    await this._renderDashboard();

    // Fallback poll (catches any edge cases BroadcastChannel misses)
    this.refreshInterval = setInterval(async () => {
      const currentCount = await DataService.getTodayOrderCount(this._currentShopId);
      if (currentCount !== this._lastOrderCount) {
        this._lastOrderCount = currentCount;
        await this._renderDashboard();
      }
    }, this.REFRESH_MS);

    // Update clock
    this._updateClock();
    setInterval(() => this._updateClock(), 1000);
  },

  /* ── Event Bindings ── */
  _bindEvents() {
    // Logout
    document.getElementById('btn-logout').addEventListener('click', () => {
      clearInterval(this.refreshInterval);
      Auth.logout();
    });

    // Export CSV
    document.getElementById('btn-export').addEventListener('click', async () => {
      const data = await DataService.getExportData();
      if (data.length === 0) {
        Utils.showToast('No data to export', 'error');
        return;
      }
      Utils.exportCSV(data, `Mana_Sales_${Utils.getTodayStr()}.csv`);
      Utils.showToast('Sales data exported!', 'success');
    });

    // Refresh
    document.getElementById('btn-refresh').addEventListener('click', async () => {
      await this._renderDashboard();
      Utils.showToast('Dashboard refreshed', 'info');
    });

    // Go to POS
    const posBtn = document.getElementById('btn-goto-pos');
    if (posBtn) {
      posBtn.addEventListener('click', () => {
        window.location.href = 'pos.html';
      });
    }

    // Reset demo data
    const resetBtn = document.getElementById('btn-reset-data');
    if (resetBtn) {
      resetBtn.addEventListener('click', async () => {
        if (confirm('Reset all demo data? This will clear the database.')) {
          await DataService.resetData();
          await this._renderDashboard();
          Utils.showToast('Data reset!', 'success');
        }
      });
    }
  },

  /* ── Update Clock ── */
  _updateClock() {
    const el = document.getElementById('live-clock');
    if (el) {
      el.textContent = Utils.formatTime(new Date());
    }
  },

  /* ── Main Render ── */
  async _renderDashboard() {
    const data = await DataService.getDashboardData(this._currentShopId, this._currentTimeFilter);

    this._renderKPIs(data.kpis);
    this._renderSalesByAreaChart(data.salesByArea);
    this._renderPopularItemsChart(data.popularItems);
    this._renderHourlyTrendChart(data.hourlyRevenue);
    this._renderTargetChart(data.targetAchievement);
    this._renderSalesFeed(data.recentSales);

    document.getElementById('last-updated').textContent =
      `Last updated: ${Utils.formatTimeShort(new Date())}`;
  },

  /* ── KPI Cards ── */
  _renderKPIs(kpis) {
    document.getElementById('kpi-revenue').textContent = Utils.formatCurrency(kpis.totalRevenue);
    document.getElementById('kpi-orders').textContent = Utils.formatNumber(kpis.totalOrders);
    document.getElementById('kpi-aov').textContent = Utils.formatCurrency(kpis.avgOrderValue);
    document.getElementById('kpi-best-area').textContent = kpis.bestArea.name;
    document.getElementById('kpi-best-area-rev').textContent = Utils.formatCurrency(kpis.bestArea.revenue);

    // Change indicators
    this._setChangeIndicator('kpi-revenue-change', kpis.revenueChange);
    this._setChangeIndicator('kpi-orders-change', kpis.ordersChange);
    this._setChangeIndicator('kpi-aov-change', kpis.aovChange);
  },

  _setChangeIndicator(elementId, value) {
    const el = document.getElementById(elementId);
    if (!el) return;
    const isPositive = value >= 0;
    el.className = `kpi-change ${isPositive ? 'positive' : 'negative'}`;
    el.textContent = `${isPositive ? '↑' : '↓'} ${Math.abs(value)}% vs yesterday`;
  },

  /* ── Sales by Area Bar Chart ── */
  _renderSalesByAreaChart(salesByArea) {
    const areas = Object.keys(salesByArea);
    const values = Object.values(salesByArea);
    const colors = ['#e8c87a', '#c8956c', '#d4a574', '#6b4226'];

    const data = [{
      x: areas.map(a => a.replace(' Hyderabad', '')),
      y: values,
      type: 'bar',
      marker: {
        color: colors,
        line: { color: 'rgba(200, 149, 108, 0.3)', width: 1 },
      },
      hovertemplate: '%{x}<br>₹%{y:,.0f}<extra></extra>',
    }];

    const layout = this._getChartLayout('');
    layout.yaxis.title = 'Revenue (₹)';

    Plotly.react('chart-sales-area', data, layout, this._getChartConfig());
  },

  /* ── Popular Items Donut Chart ── */
  _renderPopularItemsChart(popularItems) {
    if (popularItems.length === 0) return;

    const data = [{
      labels: popularItems.map(i => i.name),
      values: popularItems.map(i => i.count),
      type: 'pie',
      hole: 0.5,
      marker: {
        colors: ['#e8c87a', '#c8956c', '#d4a574', '#6b4226', '#3e2215', '#a67c5b'],
        line: { color: '#1a0f0a', width: 2 },
      },
      textinfo: 'label+percent',
      textfont: { size: 11, color: '#f5e6d3' },
      hovertemplate: '%{label}<br>Qty: %{value}<br>%{percent}<extra></extra>',
    }];

    const layout = this._getChartLayout('');
    layout.showlegend = false;

    Plotly.react('chart-popular-items', data, layout, this._getChartConfig());
  },

  /* ── Hourly Trend Line Chart ── */
  _renderHourlyTrendChart(hourlyRevenue) {
    // Only show hours 7-22
    const hours = [];
    const values = [];
    for (let h = 7; h <= 22; h++) {
      hours.push(`${h}:00`);
      values.push(hourlyRevenue[h] || 0);
    }

    const data = [{
      x: hours,
      y: values,
      type: 'scatter',
      mode: 'lines+markers',
      line: {
        color: '#e8c87a',
        width: 3,
        shape: 'spline',
      },
      marker: {
        color: '#e8c87a',
        size: 6,
        line: { color: '#1a0f0a', width: 2 },
      },
      fill: 'tozeroy',
      fillcolor: 'rgba(232, 200, 122, 0.1)',
      hovertemplate: '%{x}<br>₹%{y:,.0f}<extra></extra>',
    }];

    const layout = this._getChartLayout('');
    layout.yaxis.title = 'Revenue (₹)';
    layout.xaxis.title = 'Hour';

    Plotly.react('chart-hourly-trend', data, layout, this._getChartConfig());
  },

  /* ── Target Achievement Horizontal Bar ── */
  _renderTargetChart(targetAchievement) {
    const areas = Object.keys(targetAchievement);
    const percentages = areas.map(a => targetAchievement[a].percentage);
    const revenues = areas.map(a => targetAchievement[a].revenue);

    const colors = percentages.map(p =>
      p >= 90 ? '#5cb85c' : p >= 70 ? '#e8c87a' : '#e74c3c'
    );

    const data = [{
      y: areas.map(a => a.replace(' Hyderabad', '')),
      x: percentages,
      type: 'bar',
      orientation: 'h',
      marker: {
        color: colors,
        line: { color: 'rgba(200, 149, 108, 0.3)', width: 1 },
      },
      text: percentages.map(p => `${p}%`),
      textposition: 'inside',
      textfont: { color: '#fff', size: 12, family: 'Inter' },
      hovertemplate: '%{y}<br>%{x}% of target<br>₹' +
        revenues.map(r => r.toLocaleString()).join('<extra></extra>') +
        '<extra></extra>',
    }];

    const layout = this._getChartLayout('');
    layout.xaxis.title = 'Achievement (%)';
    layout.xaxis.range = [0, 110];

    // Add target line
    layout.shapes = [{
      type: 'line',
      x0: 100, x1: 100,
      y0: -0.5, y1: areas.length - 0.5,
      line: { color: 'rgba(200, 149, 108, 0.4)', width: 2, dash: 'dash' },
    }];

    Plotly.react('chart-target', data, layout, this._getChartConfig());
  },

  /* ── Live Sales Feed ── */
  _renderSalesFeed(recentSales) {
    const tbody = document.getElementById('feed-tbody');
    if (!tbody) return;

    if (recentSales.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; padding: 2rem; color: var(--text-muted);">
            No sales recorded today yet
          </td>
        </tr>
      `;
      return;
    }

    // Highlight the newest entry if it's different from last render
    const newestId = recentSales[0]?.orderId;
    const isNew = newestId && newestId !== this._lastTopSaleId;
    if (isNew) this._lastTopSaleId = newestId;

    tbody.innerHTML = recentSales.map((sale, i) => `
      <tr class="${i === 0 && isNew ? 'new-sale' : ''}">
        <td><span class="feed-time">${sale.time}</span></td>
        <td><span class="feed-shop">📍 ${sale.shopName.replace(' Hyderabad', ' Hyd')}</span></td>
        <td>${sale.customerName}</td>
        <td><span class="feed-items" title="${sale.itemsSummary}">${sale.itemsSummary}</span></td>
        <td><span class="feed-amount">${Utils.formatCurrency(sale.totalAmount)}</span></td>
      </tr>
    `).join('');
  },

  /* ── New Sale Event (from BroadcastChannel or same tab) ── */
  async _onNewSale(order) {
    if (order && this._currentShopId !== 'all' && order.shopId !== this._currentShopId) {
      return; // Sale not relevant for current filtered view
    }

    this._lastOrderCount = await DataService.getTodayOrderCount(this._currentShopId);

    // Re-render dashboard with real data
    await this._renderDashboard();

    // Show notification toast
    if (order) {
      const shop = SHOPS.find(s => s.id === order.shopId);
      Utils.showToast(
        `⚡ New sale: ${Utils.formatCurrency(order.totalAmount)} at ${shop?.name || 'Shop'} — ${order.customerName}`,
        'success'
      );
    }
  },

  /* ── Chart Helpers ── */
  _getChartLayout(title) {
    return {
      title: {
        text: title,
        font: { size: 14, color: '#f5e6d3', family: 'Outfit' },
      },
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'transparent',
      font: { color: '#b89a7d', family: 'Inter', size: 11 },
      margin: { t: 30, r: 20, b: 45, l: 55 },
      xaxis: {
        gridcolor: 'rgba(200, 149, 108, 0.08)',
        linecolor: 'rgba(200, 149, 108, 0.15)',
        tickfont: { size: 10 },
      },
      yaxis: {
        gridcolor: 'rgba(200, 149, 108, 0.08)',
        linecolor: 'rgba(200, 149, 108, 0.15)',
        tickfont: { size: 10 },
      },
      hoverlabel: {
        bgcolor: '#2d1810',
        bordercolor: '#c8956c',
        font: { color: '#f5e6d3', size: 12 },
      },
    };
  },

  _getChartConfig() {
    return {
      displayModeBar: false,
      responsive: true,
    };
  },
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => Dashboard.init());
