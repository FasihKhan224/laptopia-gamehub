// Supabase Configuration
// To connect to Supabase:
// 1. Create a free account at https://supabase.com
// 2. Create a new project
// 3. Go to Settings > API and copy your URL and anon key
// 4. Replace the values below

const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

// Check if Supabase is configured
const isSupabaseConfigured = () => {
  return SUPABASE_URL !== 'YOUR_SUPABASE_URL' && SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY';
};

// Initialize Supabase client (lazy)
let _supabase = null;
const getSupabase = () => {
  if (!_supabase && isSupabaseConfigured() && window.supabase) {
    _supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return _supabase;
};

const SAMPLE_PRODUCTS = [
  {
    id: 'hp-1', name: 'HP Omen 16', brand: 'hp', category: 'gaming', price: 1499.99,
    specs: { cpu: 'Intel Core i7-13700HX', ram: '16GB DDR5', gpu: 'NVIDIA RTX 4060', storage: '1TB NVMe SSD', display: '16" QHD 165Hz', battery: '83Wh' },
    image_url: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600', featured: true
  },
  {
    id: 'hp-2', name: 'HP Spectre x360', brand: 'hp', category: 'ultrabook', price: 1299.99,
    specs: { cpu: 'Intel Core i7-1355U', ram: '16GB LPDDR5', gpu: 'Intel Iris Xe', storage: '512GB PCIe SSD', display: '13.5" 3K2K OLED Touch', battery: '66Wh' },
    image_url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600', featured: false
  },
  {
    id: 'dell-1', name: 'Dell XPS 15', brand: 'dell', category: 'ultrabook', price: 1899.99,
    specs: { cpu: 'Intel Core i7-13700H', ram: '32GB DDR5', gpu: 'NVIDIA RTX 4050', storage: '1TB NVMe SSD', display: '15.6" 3.5K OLED', battery: '86Wh' },
    image_url: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=600', featured: true
  },
  {
    id: 'dell-2', name: 'Dell Latitude 7440', brand: 'dell', category: 'business', price: 1399.00,
    specs: { cpu: 'Intel Core i5-1345U', ram: '16GB LPDDR5', gpu: 'Intel Iris Xe', storage: '512GB SSD', display: '14" FHD+ WVA', battery: '57Wh' },
    image_url: 'https://images.unsplash.com/photo-1593642702821-c823b13eb2a2?w=600', featured: false
  },
  {
    id: 'lenovo-1', name: 'Lenovo Legion Pro 7i', brand: 'lenovo', category: 'gaming', price: 2299.99,
    specs: { cpu: 'Intel Core i9-13900HX', ram: '32GB DDR5', gpu: 'NVIDIA RTX 4080', storage: '2TB NVMe SSD', display: '16" WQXGA 240Hz', battery: '99.9Wh' },
    image_url: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=600', featured: true
  },
  {
    id: 'lenovo-2', name: 'Lenovo ThinkPad X1 Carbon', brand: 'lenovo', category: 'business', price: 1599.99,
    specs: { cpu: 'Intel Core i7-1355U', ram: '16GB LPDDR5', gpu: 'Intel Iris Xe', storage: '512GB SSD', display: '14" WUXGA', battery: '57Wh' },
    image_url: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600', featured: false
  },
  {
    id: 'asus-1', name: 'ASUS ROG Zephyrus G14', brand: 'asus', category: 'gaming', price: 1699.99,
    specs: { cpu: 'AMD Ryzen 9 7940HS', ram: '16GB DDR5', gpu: 'NVIDIA RTX 4060', storage: '1TB NVMe SSD', display: '14" QHD 165Hz Nebula', battery: '76Wh' },
    image_url: 'https://images.unsplash.com/photo-1600861194942-f884de60f66b?w=600', featured: true
  },
  {
    id: 'asus-2', name: 'ASUS Zenbook 14 OLED', brand: 'asus', category: 'ultrabook', price: 999.99,
    specs: { cpu: 'Intel Core i5-1340P', ram: '16GB LPDDR5', gpu: 'Intel Iris Xe', storage: '512GB SSD', display: '14" 2.8K OLED', battery: '75Wh' },
    image_url: 'https://images.unsplash.com/photo-1629131726692-1accd0c53ce0?w=600', featured: false
  },
  {
    id: 'acer-1', name: 'Acer Predator Helios 16', brand: 'acer', category: 'gaming', price: 1799.99,
    specs: { cpu: 'Intel Core i7-13700HX', ram: '16GB DDR5', gpu: 'NVIDIA RTX 4070', storage: '1TB NVMe SSD', display: '16" WQXGA 240Hz', battery: '90Wh' },
    image_url: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=600', featured: false
  },
  {
    id: 'acer-2', name: 'Acer Swift 14', brand: 'acer', category: 'ultrabook', price: 1199.99,
    specs: { cpu: 'Intel Core i7-13700H', ram: '16GB LPDDR5', gpu: 'Intel Iris Xe', storage: '1TB SSD', display: '14" WQXGA Touch', battery: '65Wh' },
    image_url: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600', featured: false
  },
  {
    id: 'msi-1', name: 'MSI Stealth 16 Studio', brand: 'msi', category: 'gaming', price: 1999.99,
    specs: { cpu: 'Intel Core i7-13700H', ram: '32GB DDR5', gpu: 'NVIDIA RTX 4070', storage: '1TB NVMe SSD', display: '16" QHD+ 240Hz', battery: '99.9Wh' },
    image_url: 'https://images.unsplash.com/photo-1625842268584-8f3296236761?w=600', featured: true
  },
  {
    id: 'msi-2', name: 'MSI Prestige 14 Evo', brand: 'msi', category: 'business', price: 1099.99,
    specs: { cpu: 'Intel Core i7-1355U', ram: '16GB LPDDR5', gpu: 'Intel Iris Xe', storage: '512GB SSD', display: '14" FHD+', battery: '72Wh' },
    image_url: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=600', featured: false
  },
  {
    id: 'razer-1', name: 'Razer Blade 15', brand: 'razer', category: 'gaming', price: 2499.99,
    specs: { cpu: 'Intel Core i7-13800H', ram: '16GB DDR5', gpu: 'NVIDIA RTX 4070', storage: '1TB NVMe SSD', display: '15.6" QHD 240Hz', battery: '80Wh' },
    image_url: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=600', featured: true
  },
  {
    id: 'razer-2', name: 'Razer Blade 14', brand: 'razer', category: 'gaming', price: 2399.99,
    specs: { cpu: 'AMD Ryzen 9 7940HS', ram: '16GB DDR5', gpu: 'NVIDIA RTX 4070', storage: '1TB NVMe SSD', display: '14" QHD+ 240Hz', battery: '68.1Wh' },
    image_url: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600', featured: false
  },
  {
    id: 'apple-1', name: 'MacBook Pro 16"', brand: 'apple', category: 'workstation', price: 2499.00,
    specs: { cpu: 'Apple M2 Pro', ram: '16GB Unified', gpu: '19-core GPU', storage: '512GB SSD', display: '16.2" Liquid Retina XDR', battery: '100Wh' },
    image_url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600', featured: true
  },
  {
    id: 'apple-2', name: 'MacBook Air 15"', brand: 'apple', category: 'ultrabook', price: 1299.00,
    specs: { cpu: 'Apple M2', ram: '8GB Unified', gpu: '10-core GPU', storage: '256GB SSD', display: '15.3" Liquid Retina', battery: '66.5Wh' },
    image_url: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=600', featured: false
  },
  {
    id: 'alienware-1', name: 'Alienware m18', brand: 'alienware', category: 'gaming', price: 2899.99,
    specs: { cpu: 'Intel Core i9-13980HX', ram: '32GB DDR5', gpu: 'NVIDIA RTX 4090', storage: '2TB NVMe SSD', display: '18" QHD+ 165Hz', battery: '97Wh' },
    image_url: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=600', featured: false
  },
  {
    id: 'alienware-2', name: 'Alienware x14 R2', brand: 'alienware', category: 'gaming', price: 1799.99,
    specs: { cpu: 'Intel Core i7-13620H', ram: '16GB LPDDR5', gpu: 'NVIDIA RTX 4060', storage: '1TB NVMe SSD', display: '14" QHD+ 165Hz', battery: '80Wh' },
    image_url: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600', featured: false
  },
  {
    id: 'gigabyte-1', name: 'Gigabyte AERO 16 OLED', brand: 'gigabyte', category: 'workstation', price: 2199.99,
    specs: { cpu: 'Intel Core i9-13900H', ram: '32GB DDR5', gpu: 'NVIDIA RTX 4070', storage: '1TB NVMe SSD', display: '16" 4K OLED', battery: '88Wh' },
    image_url: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=600', featured: true
  },
  {
    id: 'gigabyte-2', name: 'Gigabyte AORUS 15', brand: 'gigabyte', category: 'gaming', price: 1499.99,
    specs: { cpu: 'Intel Core i7-13700H', ram: '16GB DDR5', gpu: 'NVIDIA RTX 4060', storage: '1TB NVMe SSD', display: '15.6" QHD 165Hz', battery: '99Wh' },
    image_url: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=600', featured: false
  }
];

const ADMIN_PASSWORD = 'laptopia_admin_2024';

// Database abstraction layer
const DB = {
  // Products
  async getProducts(filters = {}) {
    if (isSupabaseConfigured()) {
      let query = getSupabase().from('products').select('*');
      if (filters.brand) query = query.eq('brand', filters.brand);
      if (filters.category) query = query.eq('category', filters.category);
      if (filters.featured) query = query.eq('featured', true);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    } else {
      let products = [...SAMPLE_PRODUCTS];
      if (filters.brand) products = products.filter(p => p.brand === filters.brand);
      if (filters.category) products = products.filter(p => p.category === filters.category);
      if (filters.featured) products = products.filter(p => p.featured);
      return products;
    }
  },

  async getProduct(id) {
    if (isSupabaseConfigured()) {
      const { data, error } = await getSupabase().from('products').select('*').eq('id', id).single();
      if (error) throw error;
      return data;
    } else {
      return SAMPLE_PRODUCTS.find(p => p.id === id) || null;
    }
  },

  async getProductsByBrand(brand) {
    return this.getProducts({ brand });
  },

  async getFeaturedProducts() {
    return this.getProducts({ featured: true });
  },

  async addProduct(product) {
    if (isSupabaseConfigured()) {
      const { data, error } = await getSupabase().from('products').insert([product]).select();
      if (error) throw error;
      return data;
    } else {
      console.warn('addProduct not fully supported in localStorage mode');
      return product;
    }
  },

  async updateProduct(id, productData) {
    if (isSupabaseConfigured()) {
      const { data, error } = await getSupabase().from('products').update(productData).eq('id', id).select();
      if (error) throw error;
      return data;
    } else {
      console.warn('updateProduct not fully supported in localStorage mode');
      return productData;
    }
  },

  async deleteProduct(id) {
    if (isSupabaseConfigured()) {
      const { error } = await getSupabase().from('products').delete().eq('id', id);
      if (error) throw error;
      return true;
    } else {
      console.warn('deleteProduct not fully supported in localStorage mode');
      return true;
    }
  },

  // Orders
  async createOrder(order) {
    if (isSupabaseConfigured()) {
      const { data, error } = await getSupabase().from('orders').insert([order]).select();
      if (error) throw error;
      return data;
    } else {
      const orders = JSON.parse(localStorage.getItem('laptopia_orders') || '[]');
      const newOrder = { ...order, id: Date.now().toString(), status: 'pending', created_at: new Date().toISOString() };
      orders.push(newOrder);
      localStorage.setItem('laptopia_orders', JSON.stringify(orders));
      return newOrder;
    }
  },

  async getOrders() {
    if (isSupabaseConfigured()) {
      const { data, error } = await getSupabase().from('orders').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    } else {
      return JSON.parse(localStorage.getItem('laptopia_orders') || '[]');
    }
  },

  async updateOrderStatus(id, status) {
    if (isSupabaseConfigured()) {
      const { data, error } = await getSupabase().from('orders').update({ status }).eq('id', id).select();
      if (error) throw error;
      return data;
    } else {
      const orders = JSON.parse(localStorage.getItem('laptopia_orders') || '[]');
      const index = orders.findIndex(o => o.id === id);
      if (index !== -1) {
        orders[index].status = status;
        localStorage.setItem('laptopia_orders', JSON.stringify(orders));
        return orders[index];
      }
      return null;
    }
  },

  // Inquiries
  async createInquiry(inquiry) {
    if (isSupabaseConfigured()) {
      const { data, error } = await getSupabase().from('inquiries').insert([inquiry]).select();
      if (error) throw error;
      return data;
    } else {
      const inquiries = JSON.parse(localStorage.getItem('laptopia_inquiries') || '[]');
      const newInquiry = { ...inquiry, id: Date.now().toString(), created_at: new Date().toISOString() };
      inquiries.push(newInquiry);
      localStorage.setItem('laptopia_inquiries', JSON.stringify(inquiries));
      return newInquiry;
    }
  },

  async getInquiries() {
    if (isSupabaseConfigured()) {
      const { data, error } = await getSupabase().from('inquiries').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    } else {
      return JSON.parse(localStorage.getItem('laptopia_inquiries') || '[]');
    }
  },

  // Auth (Admin)
  async adminLogin(email, password) {
    if (isSupabaseConfigured()) {
      const { data, error } = await getSupabase().auth.signInWithPassword({ email, password });
      if (error) throw error;
      return data;
    } else {
      if (password === ADMIN_PASSWORD) {
        localStorage.setItem('laptopia_admin_auth', 'true');
        return { user: { email } };
      } else {
        throw new Error('Invalid credentials');
      }
    }
  },

  async adminLogout() {
    if (isSupabaseConfigured()) {
      await getSupabase().auth.signOut();
    } else {
      localStorage.removeItem('laptopia_admin_auth');
    }
  },

  async isAdminLoggedIn() {
    if (isSupabaseConfigured()) {
      const { data } = await getSupabase().auth.getSession();
      return !!data.session;
    } else {
      return localStorage.getItem('laptopia_admin_auth') === 'true';
    }
  }
};
