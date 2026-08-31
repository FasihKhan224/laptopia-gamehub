document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }
  
  document.querySelectorAll('.admin-tab').forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab.dataset.tab));
  });

  const productForm = document.getElementById('productForm');
  if (productForm) {
    productForm.addEventListener('submit', handleSaveProduct);
  }

  // Close modals on overlay click
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.classList.remove('active');
      }
    });
  });
});

let currentOrders = [];
let currentProducts = [];

async function checkAuth() {
  try {
    if (typeof DB !== 'undefined' && DB.isAdminLoggedIn) {
      const isLoggedIn = await DB.isAdminLoggedIn();
      if (isLoggedIn) {
        showDashboard();
      }
    }
  } catch (e) {
    console.warn('Auth check failed:', e);
  }
}

async function handleLogin(e) {
  e.preventDefault();
  const email = e.target.email.value;
  const password = e.target.password.value;
  const errorEl = document.getElementById('loginError');
  
  if (typeof DB === 'undefined' || !DB.adminLogin) {
    errorEl.textContent = "Database not ready. Please refresh and try again.";
    errorEl.style.display = 'block';
    return;
  }

  try {
    await DB.adminLogin(email, password);
    errorEl.style.display = 'none';
    showDashboard();
  } catch (err) {
    errorEl.textContent = err.message || "Invalid credentials. Please try again.";
    errorEl.style.display = 'block';
  }
}

function showDashboard() {
  document.getElementById('adminLogin').style.display = 'none';
  document.getElementById('adminDashboard').style.display = 'block';
  loadDashboardData();
}

async function loadDashboardData() {
  try {
    const orders = await DB.getOrders();
    currentOrders = orders || [];
    updateStats(currentOrders);
    renderOrdersTable(currentOrders);
    
    const inquiries = await DB.getInquiries();
    renderInquiriesTable(inquiries || []);
    
    const products = await DB.getProducts();
    currentProducts = products || [];
    renderAdminProducts(currentProducts);
  } catch (error) {
    console.error("Error loading dashboard data:", error);
  }
}

function updateStats(orders) {
  document.getElementById('statTotal').textContent = orders.length;
  document.getElementById('statPending').textContent = orders.filter(o => o.status === 'pending').length;
  document.getElementById('statContacted').textContent = orders.filter(o => o.status === 'contacted').length;
  document.getElementById('statCompleted').textContent = orders.filter(o => o.status === 'completed').length;
}

function renderOrdersTable(orders) {
  const tbody = document.getElementById('ordersTableBody');
  tbody.innerHTML = '';
  
  if (orders.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:20px;color:var(--text-muted)">No orders found.</td></tr>';
    return;
  }

  // Sort by date descending
  const sorted = [...orders].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  sorted.forEach(order => {
    const date = new Date(order.created_at).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
    
    // Summary of items
    let itemsSummary = '';
    try {
      const itemsObj = typeof order.items === 'string' ? JSON.parse(order.items) : (order.items || []);
      const count = itemsObj.length;
      if (count > 0) {
        const firstItem = itemsObj[0].name || 'Item';
        itemsSummary = count === 1 ? firstItem : `${firstItem} +${count - 1} more`;
      }
    } catch (e) {
      itemsSummary = 'Error loading items';
    }

    const statusClass = `status-${order.status || 'pending'}`;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="white-space:nowrap">${date}</td>
      <td>${escapeHTML(order.customer_name)}</td>
      <td>${escapeHTML(order.phone)}</td>
      <td>${itemsSummary}</td>
      <td style="font-weight:600;color:var(--accent)">$${parseFloat(order.total || 0).toFixed(2)}</td>
      <td>
        <select class="form-input" style="padding:6px 10px;font-size:0.8rem;height:auto;min-width:110px;cursor:pointer" onchange="handleStatusChange('${order.id}', this.value)">
          <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>⏳ Pending</option>
          <option value="contacted" ${order.status === 'contacted' ? 'selected' : ''}>📞 Contacted</option>
          <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>✅ Completed</option>
          <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>❌ Cancelled</option>
        </select>
      </td>
      <td>
        <div style="display:flex;gap:8px">
          <button class="btn btn-sm" style="background:#25D366;color:white;padding:6px 12px" onclick="openWhatsApp('${order.id}')" title="Chat on WhatsApp">💬 WA</button>
          <button class="btn btn-secondary btn-sm" onclick="showOrderDetail('${order.id}')">👁 View</button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

async function handleStatusChange(orderId, newStatus) {
  try {
    await DB.updateOrderStatus(orderId, newStatus);
    // Update local state
    const orderIndex = currentOrders.findIndex(o => o.id === orderId);
    if (orderIndex !== -1) {
      currentOrders[orderIndex].status = newStatus;
      updateStats(currentOrders);
    }
    if (typeof showToast === 'function') {
      showToast(`Order status updated to ${newStatus}`);
    }
  } catch (err) {
    console.error("Failed to update status:", err);
    alert("Failed to update status. Please try again.");
    loadDashboardData();
  }
}

function openWhatsApp(orderId) {
  const order = currentOrders.find(o => o.id === orderId);
  if (!order) return;
  
  const rawNumber = order.whatsapp || order.phone || '';
  // Clean number: remove spaces, dashes, plus, parentheses
  let cleaned = rawNumber.replace(/[\s\-\+()]/g, '');
  
  // Build message with order details
  let itemsList = '';
  try {
    const items = typeof order.items === 'string' ? JSON.parse(order.items) : (order.items || []);
    itemsList = items.map(i => `• ${i.name || 'Item'} (x${i.quantity || 1})`).join('\n');
  } catch(e) {}
  
  const text = `Hi ${order.customer_name}! 👋\n\nThis is *Laptopia & GameHub*. We received your order:\n\n${itemsList}\n\n💰 Total: $${parseFloat(order.total || 0).toFixed(2)}\n\nWe'd like to confirm your order details and discuss delivery. Please let us know if everything looks correct!`;
  const url = `https://wa.me/${cleaned}?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
}

function showOrderDetail(orderId) {
  const order = currentOrders.find(o => o.id === orderId);
  if (!order) return;
  
  const modalContent = document.getElementById('orderModalContent');
  const date = new Date(order.created_at).toLocaleString();
  
  let itemsHtml = '';
  try {
    const items = typeof order.items === 'string' ? JSON.parse(order.items) : (order.items || []);
    itemsHtml = items.map(item => `
      <div style="display:flex;gap:12px;margin-bottom:12px;background:rgba(255,255,255,0.05);padding:12px;border-radius:10px">
        <img src="${item.image_url || item.image || 'https://placehold.co/60x60/1a1a2e/00d4ff?text=Item'}" alt="${item.name || 'Item'}" style="width:60px;height:60px;object-fit:cover;border-radius:8px">
        <div style="flex:1">
          <div style="font-weight:600">${escapeHTML(item.name || 'Unknown Item')}</div>
          <div style="color:var(--text-muted);font-size:0.9rem">Qty: ${item.quantity || 1} × $${parseFloat(item.price || 0).toFixed(2)}</div>
        </div>
        <div style="font-weight:600;color:var(--accent)">$${(parseFloat(item.price || 0) * (item.quantity || 1)).toFixed(2)}</div>
      </div>
    `).join('');
  } catch(e) {
    itemsHtml = '<p style="color:var(--text-muted)">Unable to load order items</p>';
  }

  modalContent.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px">
      <h2 style="margin:0">Order <span class="accent">Details</span></h2>
      <button class="btn btn-secondary btn-sm" onclick="closeOrderModal()">✕</button>
    </div>
    
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:24px">
      <div>
        <h4 style="color:var(--accent);margin-bottom:10px">👤 Customer Info</h4>
        <p><strong>Name:</strong> ${escapeHTML(order.customer_name)}</p>
        <p><strong>Phone:</strong> ${escapeHTML(order.phone)}</p>
        <p><strong>WhatsApp:</strong> ${escapeHTML(order.whatsapp || 'N/A')}</p>
        <p><strong>Address:</strong><br>${escapeHTML(order.address || 'N/A')}</p>
        <p><strong>Notes:</strong><br>${escapeHTML(order.notes || 'None')}</p>
      </div>
      <div>
        <h4 style="color:var(--accent);margin-bottom:10px">📦 Order Info</h4>
        <p><strong>Order ID:</strong> <code style="font-size:0.8rem">${order.id}</code></p>
        <p><strong>Date:</strong> ${date}</p>
        <p><strong>Status:</strong> <span class="status-badge status-${order.status}">${order.status}</span></p>
        <p><strong>Total:</strong> <span style="font-size:1.4rem;font-weight:700;color:var(--accent)">$${parseFloat(order.total || 0).toFixed(2)}</span></p>
        <div style="margin-top:16px">
          <button class="btn" style="width:100%;background:#25D366;color:white" onclick="openWhatsApp('${order.id}')">💬 Chat on WhatsApp</button>
        </div>
      </div>
    </div>
    
    <h4 style="color:var(--accent);margin-bottom:12px">🛒 Items</h4>
    <div style="max-height:300px;overflow-y:auto;padding-right:10px">
      ${itemsHtml}
    </div>
  `;
  
  document.getElementById('orderModal').classList.add('active');
}

function closeOrderModal() {
  document.getElementById('orderModal').classList.remove('active');
}

function renderInquiriesTable(inquiries) {
  const tbody = document.getElementById('inquiriesTableBody');
  tbody.innerHTML = '';
  
  if (inquiries.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:20px;color:var(--text-muted)">No inquiries found.</td></tr>';
    return;
  }

  inquiries.forEach(inq => {
    const date = new Date(inq.created_at).toLocaleDateString();
    const msgTrimmed = (inq.message || '').length > 80 ? inq.message.substring(0, 80) + '...' : (inq.message || '');
    
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="white-space:nowrap">${date}</td>
      <td>${escapeHTML(inq.name)}</td>
      <td><a href="mailto:${escapeHTML(inq.email || '')}" style="color:var(--accent)">${escapeHTML(inq.email || 'N/A')}</a></td>
      <td title="${escapeHTML(inq.message || '')}" style="max-width:300px">${escapeHTML(msgTrimmed)}</td>
    `;
    tbody.appendChild(tr);
  });
}

function renderAdminProducts(products) {
  const grid = document.getElementById('adminProductsGrid');
  grid.innerHTML = '';
  
  if (products.length === 0) {
    grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--text-muted)">No products found. Add one above.</div>';
    return;
  }

  products.forEach(p => {
    const card = document.createElement('div');
    card.className = 'glass-card';
    card.style.cssText = 'padding:20px';
    card.innerHTML = `
      <div style="display:flex;gap:16px;align-items:center;margin-bottom:16px">
        <img src="${p.image_url || 'https://placehold.co/60x60/1a1a2e/00d4ff?text=Product'}" alt="${escapeHTML(p.name)}" style="width:60px;height:60px;object-fit:cover;border-radius:8px" onerror="this.src='https://placehold.co/60x60/1a1a2e/00d4ff?text=Product'">
        <div>
          <h3 style="font-size:1rem;margin:0;line-height:1.3">${escapeHTML(p.name)}</h3>
          <span style="color:var(--text-muted);font-size:0.85rem;text-transform:uppercase">${escapeHTML(p.brand)}</span>
        </div>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
        <span style="font-weight:700;color:var(--accent);font-size:1.1rem">$${parseFloat(p.price || 0).toLocaleString()}</span>
        ${p.featured ? '<span class="status-badge status-completed">⭐ Featured</span>' : '<span class="status-badge status-pending">Standard</span>'}
      </div>
      <div style="display:flex;gap:10px">
        <button class="btn btn-secondary btn-sm" style="flex:1" onclick="editProduct('${p.id}')">✏️ Edit</button>
        <button class="btn btn-danger btn-sm" style="flex:1" onclick="handleDeleteProduct('${p.id}')">🗑 Delete</button>
      </div>
    `;
    grid.appendChild(card);
  });
}

function switchTab(tabName) {
  document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
  const activeTab = document.querySelector(`.admin-tab[data-tab="${tabName}"]`);
  if (activeTab) activeTab.classList.add('active');
  
  document.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');
  const tabContent = document.getElementById(`tab-${tabName}`);
  if (tabContent) tabContent.style.display = 'block';
}

function showAddProductModal() {
  const form = document.getElementById('productForm');
  if (form) form.reset();
  const prodId = document.getElementById('prodId');
  if (prodId) prodId.value = '';
  const title = document.getElementById('productModalTitle');
  if (title) title.innerHTML = 'Add <span class="accent">Product</span>';
  document.getElementById('productModal').classList.add('active');
}

function editProduct(id) {
  const p = currentProducts.find(prod => prod.id === id);
  if (!p) return;
  
  const setVal = (elId, val) => { const el = document.getElementById(elId); if (el) el.value = val || ''; };
  
  setVal('prodId', p.id);
  setVal('prodName', p.name);
  setVal('prodBrand', p.brand);
  setVal('prodCategory', p.category);
  setVal('prodPrice', p.price);
  setVal('prodImage', p.image_url);
  setVal('prodDescription', p.description);
  
  const featuredEl = document.getElementById('prodFeatured');
  if (featuredEl) featuredEl.checked = p.featured;
  
  if (p.specs) {
    setVal('specCpu', p.specs.cpu);
    setVal('specRam', p.specs.ram);
    setVal('specGpu', p.specs.gpu);
    setVal('specStorage', p.specs.storage);
    setVal('specDisplay', p.specs.display);
    setVal('specBattery', p.specs.battery);
  }
  
  const title = document.getElementById('productModalTitle');
  if (title) title.innerHTML = 'Edit <span class="accent">Product</span>';
  document.getElementById('productModal').classList.add('active');
}

function closeProductModal() {
  document.getElementById('productModal').classList.remove('active');
}

async function handleSaveProduct(e) {
  e.preventDefault();
  const btn = document.getElementById('saveProductBtn');
  if (btn) { btn.textContent = 'Saving...'; btn.disabled = true; }
  
  const id = document.getElementById('prodId')?.value;
  
  const specs = {
    cpu: document.getElementById('specCpu')?.value || '',
    ram: document.getElementById('specRam')?.value || '',
    gpu: document.getElementById('specGpu')?.value || '',
    storage: document.getElementById('specStorage')?.value || '',
    display: document.getElementById('specDisplay')?.value || '',
    battery: document.getElementById('specBattery')?.value || ''
  };
  
  const productData = {
    name: document.getElementById('prodName')?.value || '',
    brand: document.getElementById('prodBrand')?.value || '',
    category: document.getElementById('prodCategory')?.value || 'gaming',
    price: parseFloat(document.getElementById('prodPrice')?.value || 0),
    image_url: document.getElementById('prodImage')?.value || '',
    description: document.getElementById('prodDescription')?.value || '',
    featured: document.getElementById('prodFeatured')?.checked || false,
    specs: specs
  };
  
  try {
    if (id) {
      await DB.updateProduct(id, productData);
    } else {
      await DB.addProduct(productData);
    }
    
    closeProductModal();
    const products = await DB.getProducts();
    currentProducts = products || [];
    renderAdminProducts(currentProducts);
    if (typeof showToast === 'function') showToast('Product saved successfully!');
  } catch (err) {
    console.error("Error saving product:", err);
    alert("Error saving product: " + (err.message || "Unknown error"));
  }
  
  if (btn) { btn.textContent = 'Save Product'; btn.disabled = false; }
}

async function handleDeleteProduct(id) {
  if (!confirm("Are you sure you want to delete this product?")) return;
  
  try {
    await DB.deleteProduct(id);
    const products = await DB.getProducts();
    currentProducts = products || [];
    renderAdminProducts(currentProducts);
    if (typeof showToast === 'function') showToast('Product deleted');
  } catch (err) {
    console.error("Failed to delete product:", err);
    alert("Failed to delete product.");
  }
}

async function handleLogout() {
  try {
    if (DB && DB.adminLogout) {
      await DB.adminLogout();
    }
  } catch(e) {}
  document.getElementById('adminDashboard').style.display = 'none';
  document.getElementById('adminLogin').style.display = 'flex';
}

function escapeHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
