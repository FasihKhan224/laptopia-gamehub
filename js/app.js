// Global Application Logic

// Cart Manager — stores full product details for rendering on cart page
const CartManager = {
  getItems() {
    return JSON.parse(localStorage.getItem('laptopia_cart') || '[]');
  },
  
  saveItems(items) {
    localStorage.setItem('laptopia_cart', JSON.stringify(items));
    this.updateBadge();
  },
  
  addItem(product) {
    const items = this.getItems();
    const existing = items.find(item => item.id === (product.id || product.productId));
    if (existing) {
      existing.quantity += 1;
    } else {
      items.push({
        id: product.id,
        productId: product.id,
        name: product.name,
        brand: product.brand,
        price: product.price,
        image: product.image_url || product.image || '',
        image_url: product.image_url || product.image || '',
        specs: product.specs || {},
        quantity: 1
      });
    }
    this.saveItems(items);
  },
  
  removeItem(id) {
    const items = this.getItems().filter(item => item.id !== id && item.productId !== id);
    this.saveItems(items);
  },
  
  updateQuantity(id, qty) {
    if (qty <= 0) {
      this.removeItem(id);
      return;
    }
    const items = this.getItems();
    const existing = items.find(item => item.id === id || item.productId === id);
    if (existing) {
      existing.quantity = qty;
      this.saveItems(items);
    }
  },

  increaseQuantity(id) {
    const items = this.getItems();
    const existing = items.find(item => item.id === id || item.productId === id);
    if (existing) {
      existing.quantity += 1;
      this.saveItems(items);
    }
  },

  decreaseQuantity(id) {
    const items = this.getItems();
    const existing = items.find(item => item.id === id || item.productId === id);
    if (existing) {
      existing.quantity -= 1;
      if (existing.quantity <= 0) {
        this.removeItem(id);
      } else {
        this.saveItems(items);
      }
    }
  },
  
  getTotal() {
    return this.getItems().reduce((total, item) => total + (item.price || 0) * (item.quantity || 1), 0);
  },
  
  getCount() {
    return this.getItems().reduce((total, item) => total + (item.quantity || 1), 0);
  },
  
  clear() {
    this.saveItems([]);
  },
  
  updateBadge() {
    const badge = document.getElementById('cartBadge');
    if (badge) {
      const count = this.getCount();
      badge.textContent = count;
      badge.style.display = count > 0 ? 'inline-flex' : 'none';
    }
  }
};

// Toast Notifications
const showToast = (message, type = 'success') => {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  
  const toast = document.createElement('div');
  toast.className = `toast toast-${type} glass`;
  const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
  toast.innerHTML = `<span>${icon} ${message}</span>`;
  
  container.appendChild(toast);
  
  // Animate in
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(0)';
  });
  
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100px)';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
};

// DOM Ready Handler
document.addEventListener('DOMContentLoaded', () => {
  // Page Transition
  document.body.classList.add('page-loaded');
  
  // Initialize Cart Badge
  CartManager.updateBadge();
  
  // Sidebar Toggle Logic
  const menuBtn = document.getElementById('menuBtn');
  const sidebar = document.getElementById('sidebar');
  const sidebarOverlay = document.getElementById('sidebarOverlay');
  const sidebarClose = document.getElementById('sidebarClose');
  
  const openSidebar = () => {
    if(menuBtn) menuBtn.classList.add('active');
    if(sidebar) sidebar.classList.add('active');
    if(sidebarOverlay) sidebarOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  const closeSidebar = () => {
    if(menuBtn) menuBtn.classList.remove('active');
    if(sidebar) sidebar.classList.remove('active');
    if(sidebarOverlay) sidebarOverlay.classList.remove('active');
    document.body.style.overflow = '';
  };
  
  if (menuBtn) {
    menuBtn.addEventListener('click', () => {
      if (sidebar && sidebar.classList.contains('active')) {
        closeSidebar();
      } else {
        openSidebar();
      }
    });
  }
  
  if (sidebarClose) {
    sidebarClose.addEventListener('click', closeSidebar);
  }
  
  if (sidebarOverlay) {
    sidebarOverlay.addEventListener('click', closeSidebar);
  }

  // Close sidebar on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeSidebar();
  });
  
  // Scroll Animations (Intersection Observer)
  const animatedElements = document.querySelectorAll('.animate-on-scroll');
  if (animatedElements.length > 0) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          // Stagger animation delay
          entry.target.style.animationDelay = `${index * 0.1}s`;
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    
    animatedElements.forEach(el => observer.observe(el));
  }
  
  // Active Sidebar Link Logic
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const urlParams = new URLSearchParams(window.location.search);
  const brandParam = urlParams.get('brand');
  
  const sidebarLinks = document.querySelectorAll('.sidebar-link');
  sidebarLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
  
  if (brandParam) {
    const brandLinks = document.querySelectorAll('.brand-link');
    brandLinks.forEach(link => {
      if (link.getAttribute('href') === `brand.html?brand=${brandParam}`) {
        link.style.borderColor = 'var(--accent)';
        link.style.color = 'var(--accent)';
      }
    });
  }
});
