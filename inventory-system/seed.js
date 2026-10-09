// Run with: npm run seed  (inserts 12 sample products so GET /api/products shows 2 pages)
require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

const products = [
  { name: 'Study Table', sku: 'FURN-TB-812', category: 'Furniture', price: 3999, quantity: 2, reorderLevel: 4, supplier: 'IKEA India' },
  { name: 'Office Chair', sku: 'FURN-CH-201', category: 'Furniture', price: 5499, quantity: 15, reorderLevel: 5, supplier: 'Godrej Interio' },
  { name: 'Bookshelf', sku: 'FURN-BS-310', category: 'Furniture', price: 2799, quantity: 3, reorderLevel: 5, supplier: 'IKEA India' },
  { name: 'Wireless Mouse', sku: 'ELEC-MS-101', category: 'Electronics', price: 799, quantity: 40, reorderLevel: 15, supplier: 'Logitech' },
  { name: 'Mechanical Keyboard', sku: 'ELEC-KB-102', category: 'Electronics', price: 3499, quantity: 8, reorderLevel: 10, supplier: 'Redragon' },
  { name: 'Bluetooth Speaker', sku: 'ELEC-SP-103', category: 'Electronics', price: 2499, quantity: 30, reorderLevel: 10, supplier: 'boAt' },
  { name: 'Laptop Stand', sku: 'ELEC-LS-104', category: 'Electronics', price: 1299, quantity: 18, reorderLevel: 8, supplier: 'Portronics' },
  { name: 'Cotton T-Shirt', sku: 'APRL-TS-401', category: 'Apparel', price: 599, quantity: 50, reorderLevel: 20, supplier: 'Allen Solly' },
  { name: 'Denim Jeans', sku: 'APRL-JN-402', category: 'Apparel', price: 2199, quantity: 28, reorderLevel: 10, supplier: "Levi's" },
  { name: 'Gel Pen Pack of 15', sku: 'STNY-PN-713', category: 'Stationery', price: 120, quantity: 40, reorderLevel: 20, supplier: 'Cello Pens' },
  { name: 'A4 Notebook', sku: 'STNY-NB-714', category: 'Stationery', price: 90, quantity: 6, reorderLevel: 25, supplier: 'Classmate' },
  { name: 'Basmati Rice 5kg', sku: 'GROC-RC-901', category: 'Grocery', price: 650, quantity: 22, reorderLevel: 10, supplier: 'India Gate' },
];

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await Product.deleteMany({});
    await Product.insertMany(products);
    console.log(`Seeded ${products.length} products`);
  } catch (err) {
    console.error(err.message);
  } finally {
    await mongoose.disconnect();
  }
})();
