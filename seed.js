require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const User = require("./models/User");
const MenuItem = require("./models/MenuItem");
const Order = require("./models/Order");

const menuItems = [
  { name: "Paneer Tikka", category: "Starters", price: 220, image: "🍢", description: "Grilled cottage cheese skewers" },
  { name: "Chicken Wings", category: "Starters", price: 260, image: "🍗", description: "Spicy buffalo wings" },
  { name: "Veg Biryani", category: "Main Course", price: 250, image: "🍛", description: "Fragrant basmati rice with vegetables" },
  { name: "Butter Chicken", category: "Main Course", price: 320, image: "🍲", description: "Creamy tomato chicken curry" },
  { name: "Margherita Pizza", category: "Fast Food", price: 280, image: "🍕", description: "Classic cheese and basil pizza" },
  { name: "Cheeseburger", category: "Fast Food", price: 190, image: "🍔", description: "Beef patty with cheddar cheese" },
  { name: "Cold Coffee", category: "Beverages", price: 120, image: "🥤", description: "Chilled coffee with ice cream" },
  { name: "Fresh Lime Soda", category: "Beverages", price: 80, image: "🍋", description: "Refreshing lime soda" },
  { name: "Chocolate Brownie", category: "Desserts", price: 150, image: "🍫", description: "Warm brownie with ice cream" },
  { name: "Gulab Jamun", category: "Desserts", price: 100, image: "🍮", description: "Classic Indian sweet" },
  { name: "Family Combo", category: "Combos", price: 650, image: "🍽️", description: "Serves 4 - mixed starters and mains" },
];

const seed = async () => {
  await connectDB();

  await User.deleteMany();
  await MenuItem.deleteMany();
  await Order.deleteMany();

  const admin = await User.create({
    name: "Admin User",
    email: "admin@foodorder.com",
    password: "admin123",
    role: "admin",
  });

  const createdItems = await MenuItem.insertMany(menuItems);

  const sampleOrder = await Order.create({
    orderNumber: "ORD-DEMO001",
    customerName: "Mohilesh",
    customerPhone: "9876543210",
    orderType: "Dine-In",
    tableNumber: "5",
    items: [
      { menuItem: createdItems[2]._id, name: createdItems[2].name, price: createdItems[2].price, quantity: 2 },
      { menuItem: createdItems[6]._id, name: createdItems[6].name, price: createdItems[6].price, quantity: 2 },
    ],
    totalAmount: createdItems[2].price * 2 + createdItems[6].price * 2,
    status: "Completed",
    paymentStatus: "Paid",
    createdBy: admin._id,
  });

  console.log("Seed data created:");
  console.log(`- Admin login: admin@foodorder.com / admin123`);
  console.log(`- ${createdItems.length} menu items`);
  console.log(`- 1 sample order (${sampleOrder.orderNumber})`);

  mongoose.connection.close();
};

seed().catch((err) => {
  console.error(err);
  mongoose.connection.close();
});
