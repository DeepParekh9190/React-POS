const products = [
  // --- Coffee ---
  { id: 1, name: "Espresso", price: 149, category: "Coffee", image: "https://images.unsplash.com/photo-1485808191679-5f86510681a2?w=300&h=300&fit=crop" },
  { id: 2, name: "Cappuccino", price: 199, category: "Coffee", image: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=300&h=300&fit=crop" },
  { id: 3, name: "Latte", price: 219, category: "Coffee", image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=300&h=300&fit=crop" },
  { id: 4, name: "Mocha", price: 249, category: "Coffee", image: "https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?w=300&h=300&fit=crop" },
  { id: 5, name: "Cold Brew", price: 229, category: "Coffee", image: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=300&h=300&fit=crop" },
  { id: 6, name: "Americano", price: 179, category: "Coffee", image: "https://images.unsplash.com/photo-1559496417-e7f25cb247f3?w=300&h=300&fit=crop" },
  // --- Tea ---
  { id: 7, name: "Masala Chai", price: 129, category: "Tea", image: "https://images.unsplash.com/photo-1563911892437-1feda0179e1b?w=300&h=300&fit=crop" },
  { id: 8, name: "Green Tea", price: 149, category: "Tea", image: "https://images.unsplash.com/photo-1556881286-fc6915169721?w=300&h=300&fit=crop" },
  { id: 9, name: "Iced Tea", price: 169, category: "Tea", image: "https://images.unsplash.com/photo-1499638673689-79a0b5115d87?w=300&h=300&fit=crop" },
  { id: 10, name: "Earl Grey", price: 159, category: "Tea", image: "https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?w=300&h=300&fit=crop" },
  // --- Pastries ---
  { id: 11, name: "Croissant", price: 149, category: "Pastries", image: "https://images.unsplash.com/photo-1555507036-ab1f4038024a?w=300&h=300&fit=crop" },
  { id: 12, name: "Blueberry Muffin", price: 179, category: "Pastries", image: "https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=300&h=300&fit=crop" },
  { id: 13, name: "Chocolate Croissant", price: 199, category: "Pastries", image: "https://images.unsplash.com/photo-1549903072-7e6e0bedb7fb?w=300&h=300&fit=crop" },
  { id: 14, name: "Banana Bread", price: 169, category: "Pastries", image: "https://images.unsplash.com/photo-1605197623158-42e8c9c21a5e?w=300&h=300&fit=crop" },
  { id: 15, name: "Cookie", price: 99, category: "Pastries", image: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=300&h=300&fit=crop" },
  // --- Sandwiches ---
  { id: 16, name: "Grilled Cheese", price: 299, category: "Sandwiches", image: "https://images.unsplash.com/photo-1528736235302-52922df5c122?w=300&h=300&fit=crop" },
  { id: 17, name: "Club Sandwich", price: 349, category: "Sandwiches", image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=300&h=300&fit=crop" },
  { id: 18, name: "Paneer Wrap", price: 279, category: "Sandwiches", image: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=300&h=300&fit=crop" },
  { id: 19, name: "Veggie Panini", price: 319, category: "Sandwiches", image: "https://images.unsplash.com/photo-1540713434306-58505cf1b6fc?w=300&h=300&fit=crop" },
  // --- Specials ---
  { id: 20, name: "Frappuccino", price: 349, category: "Specials", image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=300&h=300&fit=crop" },
  { id: 21, name: "Hot Chocolate", price: 229, category: "Specials", image: "https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=300&h=300&fit=crop" },
  { id: 22, name: "Smoothie Bowl", price: 399, category: "Specials", image: "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=300&h=300&fit=crop" },
  { id: 23, name: "Milkshake", price: 279, category: "Specials", image: "https://images.unsplash.com/photo-1577805947697-89e18249d767?w=300&h=300&fit=crop" },
];

export default products;
