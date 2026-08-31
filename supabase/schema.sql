-- Laptopia & GameHub Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  category TEXT DEFAULT 'gaming',
  price DECIMAL(10,2) NOT NULL,
  specs JSONB DEFAULT '{}',
  image_url TEXT,
  description TEXT,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  address TEXT,
  notes TEXT,
  items JSONB NOT NULL DEFAULT '[]',
  total DECIMAL(10,2) NOT NULL DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Inquiries table
CREATE TABLE inquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

-- Products: public read, authenticated write
CREATE POLICY "Public can view products" ON products FOR SELECT USING (true);
CREATE POLICY "Authenticated can manage products" ON products FOR ALL USING (auth.role() = 'authenticated');

-- Orders: public insert (for placing orders), authenticated read/update
CREATE POLICY "Anyone can place orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated can view orders" ON orders FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated can update orders" ON orders FOR UPDATE USING (auth.role() = 'authenticated');

-- Inquiries: public insert, authenticated read
CREATE POLICY "Anyone can submit inquiries" ON inquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated can view inquiries" ON inquiries FOR SELECT USING (auth.role() = 'authenticated');

-- Indexes
CREATE INDEX idx_products_brand ON products(brand);
CREATE INDEX idx_products_featured ON products(featured);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);

-- Insert sample products
INSERT INTO products (name, brand, category, price, specs, image_url, description, featured) VALUES
('Razer Blade 15', 'Razer', 'gaming', 2299.99, '{"cpu":"Intel Core i7-13800H", "ram":"16GB DDR5", "gpu":"NVIDIA RTX 4070", "storage":"1TB NVMe SSD", "display":"15.6\" QHD 240Hz", "battery":"80Wh"}', 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=600&auto=format&fit=crop', 'Premium gaming laptop with ultra-thin design.', true),
('Alienware m16 R2', 'Alienware', 'gaming', 2499.99, '{"cpu":"Intel Core Ultra 7", "ram":"32GB DDR5", "gpu":"NVIDIA RTX 4070", "storage":"1TB NVMe SSD", "display":"16\" QHD+ 240Hz", "battery":"90Wh"}', 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&auto=format&fit=crop', 'High-performance gaming beast with advanced cooling.', true),
('ASUS ROG Zephyrus G14', 'ASUS', 'gaming', 1599.99, '{"cpu":"AMD Ryzen 9 8945HS", "ram":"16GB LPDDR5X", "gpu":"NVIDIA RTX 4060", "storage":"1TB NVMe SSD", "display":"14\" 3K OLED 120Hz", "battery":"73Wh"}', 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=600&auto=format&fit=crop', 'Compact and powerful gaming laptop.', true),
('MSI Titan 18 HX', 'MSI', 'gaming', 4999.99, '{"cpu":"Intel Core i9-14900HX", "ram":"128GB DDR5", "gpu":"NVIDIA RTX 4090", "storage":"4TB NVMe SSD", "display":"18\" 4K Mini-LED 120Hz", "battery":"99.9Wh"}', 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&auto=format&fit=crop', 'The ultimate desktop replacement.', false),
('Lenovo Legion Pro 7i', 'Lenovo', 'gaming', 2799.99, '{"cpu":"Intel Core i9-14900HX", "ram":"32GB DDR5", "gpu":"NVIDIA RTX 4080", "storage":"2TB NVMe SSD", "display":"16\" WQXGA 240Hz", "battery":"99.9Wh"}', 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=600&auto=format&fit=crop', 'AI-tuned gaming performance.', true),
('Dell XPS 16', 'Dell', 'creator', 2199.99, '{"cpu":"Intel Core Ultra 7", "ram":"32GB LPDDR5x", "gpu":"NVIDIA RTX 4060", "storage":"1TB NVMe SSD", "display":"16\" 4K+ OLED Touch", "battery":"99.5Wh"}', 'https://images.unsplash.com/photo-1593642702821-c823b13eb2a2?w=600&auto=format&fit=crop', 'Sleek premium creator laptop.', false),
('Apple MacBook Pro 16"', 'Apple', 'creator', 2499.00, '{"cpu":"Apple M3 Pro", "ram":"18GB Unified", "gpu":"18-core GPU", "storage":"512GB SSD", "display":"16.2\" Liquid Retina XDR", "battery":"100Wh"}', 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop', 'Industry-leading battery life and performance.', true),
('HP Spectre x360 14', 'HP', 'ultrabook', 1499.99, '{"cpu":"Intel Core Ultra 7", "ram":"16GB LPDDR5x", "gpu":"Intel Arc Graphics", "storage":"1TB NVMe SSD", "display":"14\" 2.8K OLED Touch", "battery":"68Wh"}', 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&auto=format&fit=crop', 'Premium 2-in-1 convertible.', false),
('Acer Predator Helios 18', 'Acer', 'gaming', 2999.99, '{"cpu":"Intel Core i9-14900HX", "ram":"32GB DDR5", "gpu":"NVIDIA RTX 4080", "storage":"2TB NVMe SSD", "display":"18\" WQXGA Mini-LED 250Hz", "battery":"90Wh"}', 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&auto=format&fit=crop', 'Massive screen for immersive gaming.', false),
('Gigabyte AORUS 17X', 'Gigabyte', 'gaming', 3499.99, '{"cpu":"Intel Core i9-14900HX", "ram":"32GB DDR5", "gpu":"NVIDIA RTX 4090", "storage":"2TB NVMe SSD", "display":"17.3\" QHD 240Hz", "battery":"99Wh"}', 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=600&auto=format&fit=crop', 'Flagship gaming powerhouse.', false),
('Razer Blade 14', 'Razer', 'gaming', 1999.99, '{"cpu":"AMD Ryzen 9 8945HS", "ram":"16GB DDR5", "gpu":"NVIDIA RTX 4060", "storage":"1TB NVMe SSD", "display":"14\" QHD+ 240Hz", "battery":"68.1Wh"}', 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=600&auto=format&fit=crop', 'Ultra-portable 14-inch gaming laptop.', false),
('Alienware x14 R2', 'Alienware', 'gaming', 1799.99, '{"cpu":"Intel Core i7-13620H", "ram":"16GB LPDDR5", "gpu":"NVIDIA RTX 4060", "storage":"1TB NVMe SSD", "display":"14\" QHD+ 165Hz", "battery":"80Wh"}', 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&auto=format&fit=crop', 'World''s thinnest 14" gaming laptop.', false),
('ASUS TUF Gaming A15', 'ASUS', 'budget', 1099.99, '{"cpu":"AMD Ryzen 7 7735HS", "ram":"16GB DDR5", "gpu":"NVIDIA RTX 4050", "storage":"512GB NVMe SSD", "display":"15.6\" FHD 144Hz", "battery":"90Wh"}', 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=600&auto=format&fit=crop', 'Durable, affordable gaming.', false),
('Lenovo ThinkPad X1 Carbon Gen 12', 'Lenovo', 'ultrabook', 1899.99, '{"cpu":"Intel Core Ultra 7", "ram":"32GB LPDDR5x", "gpu":"Intel Arc Graphics", "storage":"1TB NVMe SSD", "display":"14\" 2.8K OLED", "battery":"57Wh"}', 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&auto=format&fit=crop', 'The gold standard for business.', true),
('Apple MacBook Air 15"', 'Apple', 'ultrabook', 1299.00, '{"cpu":"Apple M3", "ram":"8GB Unified", "gpu":"10-core GPU", "storage":"256GB SSD", "display":"15.3\" Liquid Retina", "battery":"66.5Wh"}', 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop', 'Thin, light, and surprisingly powerful.', false),
('MSI Cyborg 15', 'MSI', 'budget', 899.99, '{"cpu":"Intel Core i7-12650H", "ram":"16GB DDR5", "gpu":"NVIDIA RTX 4050", "storage":"512GB NVMe SSD", "display":"15.6\" FHD 144Hz", "battery":"53.5Wh"}', 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&auto=format&fit=crop', 'Cyberpunk styling on a budget.', false),
('Dell G15', 'Dell', 'budget', 949.99, '{"cpu":"Intel Core i5-13450HX", "ram":"16GB DDR5", "gpu":"NVIDIA RTX 3050", "storage":"512GB NVMe SSD", "display":"15.6\" FHD 120Hz", "battery":"56Wh"}', 'https://images.unsplash.com/photo-1593642702821-c823b13eb2a2?w=600&auto=format&fit=crop', 'Solid entry-level gaming laptop.', false),
('Acer Nitro 5', 'Acer', 'budget', 799.99, '{"cpu":"Intel Core i5-12500H", "ram":"8GB DDR4", "gpu":"NVIDIA RTX 3050", "storage":"512GB NVMe SSD", "display":"15.6\" FHD 144Hz", "battery":"57.5Wh"}', 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=600&auto=format&fit=crop', 'Affordable gaming for the masses.', false),
('HP OMEN Transcend 14', 'HP', 'gaming', 1599.99, '{"cpu":"Intel Core Ultra 7", "ram":"16GB LPDDR5x", "gpu":"NVIDIA RTX 4060", "storage":"1TB NVMe SSD", "display":"14\" 2.8K OLED 120Hz", "battery":"71Wh"}', 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=600&auto=format&fit=crop', 'Lightweight lifestyle gaming laptop.', false),
('Gigabyte Aero 16', 'Gigabyte', 'creator', 2199.99, '{"cpu":"Intel Core i9-13900H", "ram":"32GB DDR5", "gpu":"NVIDIA RTX 4070", "storage":"1TB NVMe SSD", "display":"16\" 4K OLED", "battery":"88Wh"}', 'https://images.unsplash.com/photo-1593642702821-c823b13eb2a2?w=600&auto=format&fit=crop', 'Color-accurate display for creators.', false);
