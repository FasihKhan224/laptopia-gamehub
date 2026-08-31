// Shared product rendering utilities

function createProductCard(product) {
  if (!product) return '';
  
  const id = product.id || '';
  const name = product.name || 'Unknown Product';
  const brand = product.brand || 'Unknown Brand';
  const price = product.price || 0;
  const image_url = product.image_url || `https://placehold.co/600x400/1a1a2e/00d4ff?text=${encodeURIComponent(name)}`;
  
  const specs = product.specs || {};
  const cpu = specs.cpu || 'CPU N/A';
  const ram = specs.ram || 'RAM N/A';
  const gpu = specs.gpu || 'GPU N/A';
  
  return `
    <div class="glass-card product-card animate-on-scroll" onclick="window.location.href='product.html?id=${id}'" style="cursor:pointer">
      <img src="${image_url}" alt="${name}" class="product-card-image" 
           onerror="this.src='https://placehold.co/600x400/1a1a2e/00d4ff?text=${encodeURIComponent(name)}'">
      <div class="product-card-body">
        <span class="product-card-brand">${brand}</span>
        <h3 class="product-card-title">${name}</h3>
        <p class="product-card-specs">${cpu} • ${ram} • ${gpu}</p>
        <div class="product-card-price">${formatPrice(price)}</div>
        <div class="product-card-actions">
          <button class="btn btn-primary btn-sm" onclick="event.stopPropagation(); addToCartFromCard('${id}')">Add to Cart</button>
          <button class="btn btn-secondary btn-sm" onclick="event.stopPropagation(); window.location.href='product.html?id=${id}'">Details</button>
        </div>
      </div>
    </div>
  `;
}

// Add product to cart by ID (looks up from SAMPLE_PRODUCTS or DB)
async function addToCartFromCard(productId) {
  try {
    // Try to find product in SAMPLE_PRODUCTS first (fastest)
    let product = null;
    if (typeof SAMPLE_PRODUCTS !== 'undefined') {
      product = SAMPLE_PRODUCTS.find(p => p.id === productId);
    }
    // Fallback to DB
    if (!product && typeof DB !== 'undefined') {
      product = await DB.getProduct(productId);
    }
    
    if (product && typeof CartManager !== 'undefined') {
      CartManager.addItem(product);
      if (typeof showToast === 'function') {
        showToast(`${product.name} added to cart!`);
      }
    }
  } catch (err) {
    console.error('Failed to add to cart:', err);
  }
}

function formatPrice(price) {
  if (price == null) return '$0';
  return '$' + Number(price).toLocaleString();
}
