const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
require("dotenv").config();

const User = require("./models/user");
const Class = require("./models/class");
const Product = require("./models/product");

const mongoUrl =
  process.env.MONGODB_URL || "mongodb://localhost:27017/parsswim";

const sampleClasses = [
  {
    title: "کلاس شنای مبتدی",
    classType: "جلسه آزمایشی رایگان",
    description: "کلاس رایگان برای تازه واردان",
    duration: 60,
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
    time: "10:00",
    maxStudents: 8,
    currentStudents: 0,
    price: 0,
    instructor: "مربی اول",
    location: "استخر اصلی",
    requiresRegistration: true,
    isActive: true,
  },
  {
    title: "کلاس خصوصی حرفه‌ای",
    classType: "کلاس خصوصی ۱۲ جلسه",
    description: "آموزش تخصصی و شخصی‌سازی شده",
    duration: 90,
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    time: "14:00",
    maxStudents: 1,
    currentStudents: 0,
    price: 850000,
    instructor: "مربی اول",
    location: "استخر اصلی",
    requiresRegistration: true,
    isActive: true,
  },
  {
    title: "کلاس پدر و فرزند",
    classType: "کلاس پدر و فرزند",
    description: "تجربه شنا با خانواده",
    duration: 75,
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    time: "16:30",
    maxStudents: 6,
    currentStudents: 2,
    price: 450000,
    instructor: "هر دو مربی",
    location: "استخر اصلی",
    requiresRegistration: true,
    isActive: true,
  },
];

const sampleProducts = [
  {
    name: "مایو حرفه‌ای نایک",
    price: 450000,
    category: "swimwear",
    description: "مایو ورزشی با کیفیت بالا مناسب برای تمرین و مسابقه",
    image: "/images/swimwear/swimwear-1.jpg",
    inStock: true,
    quantity: 15,
    brand: "Nike",
    isActive: true,
  },
  {
    name: "عینک شنا اسپیدو",
    price: 180000,
    category: "swimgoggles",
    description: "عینک شنا ضد مه با بند قابل تنظیم",
    image: "/images/swimgoggles/goggles-1.jpg",
    inStock: true,
    quantity: 25,
    brand: "Speedo",
    isActive: true,
  },
  {
    name: "فین شنا آرنا",
    price: 320000,
    category: "swimfins",
    description: "فین انعطاف‌پذیر برای تقویت عضلات پا",
    image: "/images/swimfin/fin-1.jpg",
    inStock: true,
    quantity: 12,
    brand: "Arena",
    isActive: true,
  },
  {
    name: "کلاه شنا سیلیکونی",
    price: 85000,
    category: "swimequipment",
    description: "کلاه ضد آب و راحت",
    image: "/images/equipment/cap-1.jpg",
    inStock: true,
    quantity: 30,
    brand: "Speedo",
    isActive: true,
  },
  {
    name: "کیف شنا ورزشی",
    price: 125000,
    category: "swimequipment",
    description: "کیف مقاوم در برابر آب با جیب‌های متعدد",
    image: "/images/equipment/backpack-1.jpg",
    inStock: true,
    quantity: 8,
    brand: "Nike",
    isActive: true,
  },
];

// Sample Users for testing
const sampleUsers = [
  {
    name: "testuser",
    email: "testuser@parsswim.ir",
    phone: "+989123456789",
    password: bcrypt.hashSync("password123", 8), // Pre-hash password
    age: 25,
    balance: 1000000,
    swimmingType: "normal",
    skillLevel: "beginner",
    role: "student",
  },
  {
    name: "testadmin",
    email: "admin@parsswim.ir",
    phone: "+989198765432",
    password: bcrypt.hashSync("admin123456", 8), // Pre-hash password
    age: 35,
    balance: 0,
    swimmingType: "competition",
    skillLevel: "advanced",
    role: "admin",
  },
  {
    name: "john_swimmer",
    email: "john@parsswim.ir",
    phone: "+989101111111",
    password: bcrypt.hashSync("john123456", 8),
    age: 30,
    balance: 2500000,
    swimmingType: "normal",
    skillLevel: "intermediate",
    role: "student",
  },
];

async function seedDatabase() {
  try {
    console.log("🔄 Connecting to MongoDB...");
    await mongoose.connect(mongoUrl);
    console.log("✅ Connected to MongoDB");

    // Clear existing data
    console.log("🔄 Clearing existing data...");
    await User.deleteMany({});
    await Class.deleteMany({});
    await Product.deleteMany({});
    console.log("✅ Existing data cleared");

    // Add sample users
    console.log("🔄 Adding sample users...");
    await User.insertMany(sampleUsers);
    console.log(`✅ Added ${sampleUsers.length} users`);

    // Add sample classes
    console.log("🔄 Adding sample classes...");
    await Class.insertMany(sampleClasses);
    console.log(`✅ Added ${sampleClasses.length} classes`);

    // Add sample products
    console.log("🔄 Adding sample products...");
    await Product.insertMany(sampleProducts);
    console.log(`✅ Added ${sampleProducts.length} products`);

    console.log("🎉 Database seeded successfully!");

    // Verify data
    const userCount = await User.countDocuments();
    const classCount = await Class.countDocuments();
    const productCount = await Product.countDocuments();
    console.log(`📊 Total users: ${userCount}`);
    console.log(`📊 Total classes: ${classCount}`);
    console.log(`📊 Total products: ${productCount}`);

    // Display test credentials
    console.log("\n🔑 Test Credentials:");
    console.log("━".repeat(50));
    console.log("👤 Student: testuser / password123");
    console.log("👤 Alternate: john_swimmer / john123456");
    console.log("🔐 Admin: testadmin / admin123456");
    console.log("━".repeat(50));
  } catch (error) {
    console.error("❌ Error seeding database:", error);
  } finally {
    await mongoose.connection.close();
    console.log("🔒 Database connection closed");
    process.exit(0);
  }
}

// Run the seeder
seedDatabase();
