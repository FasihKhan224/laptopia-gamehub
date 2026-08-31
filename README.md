# 💻 Laptopia & GameHub

![Laptopia & GameHub Logo Placeholder](https://via.placeholder.com/800x200?text=Laptopia+%26+GameHub)

**Laptopia & GameHub** is a premium, futuristic e-commerce platform for high-end laptops, tailored for gamers and creators. Featuring a stunning dark mode UI with glassmorphism effects, it offers a seamless shopping experience and a comprehensive admin dashboard for managing inventory and orders.

## 🔗 Live Demo
[View Live Site](#) *(Placeholder for GitHub Pages URL)*

## 📸 Screenshots
*(Add screenshots here)*
- Homepage
- Products Page
- Shopping Cart
- Admin Dashboard

## ✨ Features
- **Stunning UI/UX:** Dark futuristic theme, iOS 26-style glassmorphism, responsive design.
- **Dynamic Product Catalog:** View, filter, and search through top brands (Razer, Alienware, Apple, ASUS, etc.).
- **Shopping Cart System:** Add to cart, adjust quantities, and calculate totals instantly.
- **WhatsApp Integration:** Direct order submission via WhatsApp, generating pre-filled messages.
- **Admin Dashboard:** Secure login for store owners to manage products, view orders, and track inquiries.
- **Supabase Backend:** Powered by Supabase (PostgreSQL) for reliable real-time database and authentication.

## 🚀 Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/laptopia-gamehub.git
cd laptopia-gamehub
```

### 2. Backend Setup (Supabase)
The app requires a Supabase backend to function completely (products, cart, admin).
1. Create a free account at [Supabase](https://supabase.com).
2. Create a new project.
3. Open the **SQL Editor** in Supabase and run the provided `supabase/schema.sql` file to set up tables, security policies, and sample data.
4. Go to **Project Settings > API** and copy your `URL` and `anon` public key.
5. Update the configuration in `js/supabase-config.js` with your keys.
6. Create an admin user via Supabase Auth or use the built-in custom admin login function if implemented.

### 3. Run Locally
You can run this project simply by opening `index.html` in your browser, or better yet, using a local live server:
- Using VS Code: Install the **Live Server** extension, right-click `index.html` -> "Open with Live Server".
- Using Node.js: `npx serve .`
- Using Python: `python -m http.server 8000`

## 🔐 Admin Access
To access the admin dashboard (`admin.html`):
- **Email:** `admin@laptopia.store`
- **Password:** `laptopia_admin_2024`

*Note: Ensure you have added this user to your Supabase Auth users to allow sign-in, or modify the authentication logic in `js/supabase-config.js` as needed.*

## 🛠️ Tech Stack
- **Frontend:** HTML5, CSS3 (Variables, Grid, Flexbox, Glassmorphism), Vanilla JavaScript
- **Backend/Database:** Supabase (PostgreSQL)
- **Deployment:** GitHub Pages (via GitHub Actions)
- **Fonts:** Google Fonts (Inter, Space Grotesk)

## 📄 License
This project is licensed under the MIT License.
