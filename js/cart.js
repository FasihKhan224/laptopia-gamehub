document.addEventListener('DOMContentLoaded', () => {
  renderCart();
});

function renderCart() {
  // Gracefully handle missing CartManager
  if (typeof CartManager === 'undefined') {
    console.warn('CartManager is not defined yet.');
    return;
  }
  
  const items = CartManager.getItems();
  const cartContent = document.getElementById('cartContent');
  const checkoutSection = document.getElementById('checkoutSection');
  
  if (!cartContent || !checkoutSection) return;
  
  if (items.length === 0) {
    // Show empty state
    cartContent.innerHTML = `
      <div class="cart-empty glass-card" style="text-align: center; padding: 60px 20px;">
        <div style="font-size:4rem; margin-bottom: 20px;">💻</div>
        <h2>Your cart is empty</h2>
        <p style="color:var(--text-muted); margin: 10px 0 20px;">Looks like you haven't added any laptops yet.</p>
        <a href="brands.html" class="btn btn-primary" style="margin-top:20px; display: inline-block;">Start Shopping</a>
      </div>
    `;
    checkoutSection.style.display = 'none';
    return;
  }
  
  // Show cart items
  checkoutSection.style.display = 'block';
  
  let cartItemsHTML = '<div class="cart-items-list" style="display: flex; flex-direction: column; gap: 20px;">';
  
  items.forEach((item) => {
    cartItemsHTML += `
      <div class="cart-item glass-card" style="display: flex; align-items: center; gap: 20px; padding: 20px; position: relative;">
        <img src="${item.image || 'https://via.placeholder.com/100'}" alt="${item.name}" style="width: 100px; height: 100px; object-fit: cover; border-radius: 8px;">
        <div class="cart-item-details" style="flex: 1;">
          <h3 style="margin: 0 0 10px 0; font-size: 1.1rem;">${item.name}</h3>
          <div style="color: var(--accent); font-weight: 600; font-size: 1.2rem;">$${item.price}</div>
        </div>
        <div class="cart-item-quantity" style="display: flex; align-items: center; gap: 10px; background: rgba(255,255,255,0.05); padding: 5px; border-radius: 8px;">
          <button class="btn-qty-minus" data-id="${item.id}" style="background: none; border: none; color: white; cursor: pointer; padding: 5px 10px;">-</button>
          <span style="font-weight: 500;">${item.quantity}</span>
          <button class="btn-qty-plus" data-id="${item.id}" style="background: none; border: none; color: white; cursor: pointer; padding: 5px 10px;">+</button>
        </div>
        <button class="btn-remove" data-id="${item.id}" style="background: rgba(255,0,0,0.2); color: #ff4444; border: none; padding: 8px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; width: 36px; height: 36px;">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </button>
      </div>
    `;
  });
  
  cartItemsHTML += '</div>';
  cartContent.innerHTML = cartItemsHTML;
  
  // Attach event listeners to quantity buttons
  document.querySelectorAll('.btn-qty-minus').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.dataset.id;
      CartManager.decreaseQuantity(id);
      renderCart();
    });
  });
  
  document.querySelectorAll('.btn-qty-plus').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.dataset.id;
      CartManager.increaseQuantity(id);
      renderCart();
    });
  });
  
  document.querySelectorAll('.btn-remove').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.dataset.id;
      CartManager.removeItem(id);
      renderCart();
    });
  });
  
  renderSummary();
}

function renderSummary() {
  if (typeof CartManager === 'undefined') return;
  const items = CartManager.getItems();
  const summaryContainer = document.getElementById('cartSummary');
  const total = CartManager.getTotal();
  
  if (!summaryContainer) return;
  
  let summaryHTML = '<div style="padding: 24px;">';
  
  items.forEach(item => {
    summaryHTML += `
      <div style="display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 0.95rem;">
        <span style="color: var(--text-muted);">${item.name} (x${item.quantity})</span>
        <span>$${(item.price * item.quantity).toFixed(2)}</span>
      </div>
    `;
  });
  
  summaryHTML += `
    <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.1); margin: 20px 0;">
    <div style="display: flex; justify-content: space-between; font-size: 1.2rem; font-weight: 600;">
      <span>Total</span>
      <span class="accent">$${total.toFixed(2)}</span>
    </div>
  </div>`;
  
  summaryContainer.innerHTML = summaryHTML;
}

// Handle checkout form submission
document.getElementById('checkoutForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);
  const order = {
    customer_name: formData.get('name'),
    phone: formData.get('phone'),
    whatsapp: formData.get('whatsapp'),
    address: formData.get('address'),
    notes: formData.get('notes'),
    items: CartManager.getItems(),
    total: CartManager.getTotal(),
    status: 'pending',
    created_at: new Date().toISOString()
  };
  
  try {
    const btn = form.querySelector('button[type="submit"]');
    btn.innerHTML = 'Processing...';
    btn.disabled = true;

    // Save order to DB
    if (typeof DB !== 'undefined' && typeof DB.createOrder === 'function') {
      await DB.createOrder(order);
    } else {
      // Mock delay if DB is not fully implemented
      await new Promise(r => setTimeout(r, 1000));
      console.log('Order created:', order);
    }
    
    // Clear cart
    CartManager.clear();
    
    // Show success message / modal
    showSuccessModal();
    
    form.reset();
    renderCart();
  } catch (error) {
    console.error('Error placing order:', error);
    alert('Failed to place order. Please try again.');
  } finally {
    const btn = form.querySelector('button[type="submit"]');
    if (btn) {
      btn.innerHTML = 'Place Order via WhatsApp';
      btn.disabled = false;
    }
  }
});

function showSuccessModal() {
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.8);
    backdrop-filter: blur(5px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    opacity: 0;
    transition: opacity 0.3s ease;
  `;
  
  modal.innerHTML = `
    <div class="glass-card" style="padding: 40px; text-align: center; max-width: 400px; transform: translateY(20px); transition: transform 0.3s ease;">
      <div style="font-size: 4rem; margin-bottom: 20px;">✅</div>
      <h2 style="margin-bottom: 15px;">Order Placed Successfully!</h2>
      <p style="color: var(--text-muted); margin-bottom: 25px;">Our team will contact you on WhatsApp shortly to confirm your order.</p>
      <button class="btn btn-primary" onclick="this.closest('div').parentElement.remove()">Continue Shopping</button>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Trigger animation
  setTimeout(() => {
    modal.style.opacity = '1';
    modal.querySelector('.glass-card').style.transform = 'translateY(0)';
  }, 10);
  
  // Add listener to redirect button
  modal.querySelector('button').addEventListener('click', () => {
    window.location.href = 'index.html';
  });
}
