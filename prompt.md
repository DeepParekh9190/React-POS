# React Point of Sale (POS) System - Project Prompt

## Overview
Create a simple, modern, and highly responsive Point of Sale (POS) application using React. The application should allow users to browse products, add them to a shopping cart, adjust quantities, calculate totals (including tax), and process a simulated checkout. 

## Technology Stack
- **Frontend Framework**: React (initialize with Vite for fast builds: `npx -y create-vite@latest ./ --template react`)
- **Styling**: Vanilla CSS (prioritize modern, rich aesthetics without relying on external UI libraries like Tailwind unless specified).
- **State Management**: React Context API or simple component state (useState, useReducer) depending on complexity.

## Core Features
1. **Product Catalog**:
   - Display a grid of products with images, titles, prices, and categories.
   - Include a search bar to filter products by name.
   - Include category filters (e.g., All, Food, Drinks, Electronics).

2. **Shopping Cart / Order Panel**:
   - A persistent side panel or dedicated section showing the current order.
   - Ability to add items to the cart from the product catalog.
   - Ability to increase/decrease item quantities in the cart.
   - Ability to remove items entirely from the cart.

3. **Checkout & Totals**:
   - Dynamically calculate the subtotal, tax (e.g., 10%), and final total.
   - Provide a "Clear Cart" button to reset the order.
   - Provide a "Pay Now" or "Checkout" button that triggers a success modal/alert and clears the cart.

4. **Design & Aesthetics (CRITICAL)**:
   - **Color Theme (Midnight & Neon Purple)**: Implement a sleek Dark Mode UI. Use a deep midnight blue (`#0f172a`) for the main background, slightly lighter blue/gray (`#1e293b`) for cards and panels, and a vibrant neon purple (`#8b5cf6` or `#a855f7`) for primary buttons, highlights, and active states. Add soft glowing drop shadows for interactive elements.
   - **Interactive**: Add micro-animations (e.g., hover effects on product cards, smooth transitions when items are added to the cart).
   - **Responsive**: Ensure the layout works seamlessly on both desktop (POS terminal view) and tablet devices.
   - **Typography**: Use modern fonts like Inter, Roboto, or Outfit.

## Mock Data
Provide a hardcoded array of mock products in a separate file (e.g., `src/data/products.js`) to populate the store. Each product should have:
- `id`: Unique identifier
- `name`: Product name
- `price`: Number
- `category`: String
- `image`: URL (Use placeholder image URLs like Unsplash source or generic UI placeholders)

## Implementation Steps
1. **Setup**: Initialize the Vite React project and clean up boilerplate.
2. **Global CSS**: Set up `index.css` with CSS variables for colors, typography, and global resets. Create utility classes for common layouts (flex, grid).
3. **Components**:
   - `Header`: Contains branding and search/filter controls.
   - `ProductList`: Grid displaying `ProductCard` components.
   - `Cart`: The order panel displaying `CartItem` components and total calculations.
   - `CheckoutModal`: A modal to confirm the transaction.
4. **State**: Lift the cart state to the main `App` component or use a Context provider so both the `ProductList` and `Cart` can interact with it.
5. **Polish**: Add CSS transitions, empty state handling for the cart, and responsive media queries.

## Definition of Done
- The app runs locally without errors.
- A user can select a category, search for a product, add it to the cart, modify the quantity, and "checkout".
- The design looks professional, modern, and visually impressive.
