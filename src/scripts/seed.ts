/**
 * SmartDukaan Seed Script
 * Run: npx tsx src/scripts/seed.ts
 */

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const MONGODB_URI = process.env.MONGODB_URI!;

async function seed() {
  console.log("🌱 Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI);

  // Import models after connection
  const { default: User } = await import("../models/User");
  const { default: Business } = await import("../models/Business");
  const { default: Category } = await import("../models/Category");
  const { default: Product } = await import("../models/Product");

  console.log("🗑️  Clearing existing data...");
  await Promise.all([
    User.deleteMany({}),
    Business.deleteMany({}),
    Category.deleteMany({}),
    Product.deleteMany({}),
  ]);

  // Create super admin
  console.log("🔑 Creating super admin...");
  const hashedPw = await bcrypt.hash("demo1234", 12);
  await User.create({
    name: "Super Admin",
    email: "admin@smartdukaan.com",
    password: hashedPw,
    role: "super_admin",
    phone: "+91 9000000000",
    isVerified: true,
    isActive: true,
  });

  // Create demo user
  console.log("👤 Creating demo user...");
  const user = await User.create({
    name: "Rajesh Patel",
    email: "demo@smartdukaan.com",
    password: hashedPw,
    role: "business_owner",
    phone: "+91 9876543210",
    isVerified: true,
    isActive: true,
  });

  // Create demo business
  console.log("🏪 Creating demo business (Fresh Mart Grocery)...");
  const business = await Business.create({
    name: "Fresh Mart Grocery",
    slug: "fresh-mart",
    ownerId: user._id,
    email: "freshmart@example.com",
    phone: "+91 9876543210",
    address: "123, Gandhi Road, Near Post Office",
    city: "Ahmedabad",
    state: "Gujarat",
    pincode: "380001",
    gstNumber: "24AABCS1429B1ZB",
    description: "Your neighborhood grocery store. Fresh fruits, vegetables, and daily essentials at the best prices.",
    descriptionGu: "તમારી નજીકની કિરાણા. તાજા ફળ, શાકભાજી અને રોજની જરૂરિયાત.",
    tagline: "Fresh everyday, delivered with care!",
    taglineGu: "દરરોજ તાજું, પ્રેમ સાથે!",
    theme: "grocery",
    status: "active",
    whatsappNumber: "+91 9876543210",
    primaryColor: "#10b981",
    settings: {
      currency: "INR",
      currencySymbol: "₹",
      taxEnabled: true,
      defaultGst: 5,
      invoicePrefix: "FM",
      invoiceCounter: 1,
      loyaltyEnabled: true,
      onlineOrderEnabled: true,
      whatsappOrderEnabled: true,
      language: "en",
    },
    openingHours: [
      { day: "Monday", open: "07:00", close: "21:00", isClosed: false },
      { day: "Tuesday", open: "07:00", close: "21:00", isClosed: false },
      { day: "Wednesday", open: "07:00", close: "21:00", isClosed: false },
      { day: "Thursday", open: "07:00", close: "21:00", isClosed: false },
      { day: "Friday", open: "07:00", close: "21:00", isClosed: false },
      { day: "Saturday", open: "07:00", close: "21:00", isClosed: false },
      { day: "Sunday", open: "08:00", close: "20:00", isClosed: false },
    ],
  });

  // Update user with business
  await User.findByIdAndUpdate(user._id, { businessId: business._id });

  // Create categories
  console.log("📁 Creating categories...");
  const categories = await Category.create([
    { businessId: business._id, name: "Fruits & Vegetables", nameGu: "ફળ અને શાકભાજી", slug: "fruits-vegetables", sortOrder: 1, isActive: true },
    { businessId: business._id, name: "Dairy & Eggs", nameGu: "દૂધ અને ઈંડા", slug: "dairy-eggs", sortOrder: 2, isActive: true },
    { businessId: business._id, name: "Grains & Pulses", nameGu: "અનાજ અને કઠોળ", slug: "grains-pulses", sortOrder: 3, isActive: true },
    { businessId: business._id, name: "Snacks & Beverages", nameGu: "નાસ્તો અને પીણા", slug: "snacks-beverages", sortOrder: 4, isActive: true },
    { businessId: business._id, name: "Personal Care", nameGu: "વ્યક્તિગત સ્વચ્છતા", slug: "personal-care", sortOrder: 5, isActive: true },
  ]);

  const [fruitsVeg, dairy, grains, snacks, personal] = categories;

  // Create products
  console.log("📦 Creating products...");
  await Product.create([
    // Fruits & Vegetables
    { businessId: business._id, categoryId: fruitsVeg._id, name: "Fresh Tomatoes", nameGu: "તાજા ટામેટા", price: 40, stock: 50, minStock: 10, status: "active", gstPercentage: 0, unit: "kg", isFeatured: true, totalSold: 245 },
    { businessId: business._id, categoryId: fruitsVeg._id, name: "Onions", nameGu: "ડુંગળી", price: 30, stock: 80, minStock: 15, status: "active", gstPercentage: 0, unit: "kg", totalSold: 312 },
    { businessId: business._id, categoryId: fruitsVeg._id, name: "Potatoes", nameGu: "બટાટા", price: 25, stock: 100, minStock: 20, status: "active", gstPercentage: 0, unit: "kg", totalSold: 418 },
    { businessId: business._id, categoryId: fruitsVeg._id, name: "Alphonso Mangoes", nameGu: "હાફૂસ કેરી", price: 250, stock: 20, minStock: 5, status: "active", gstPercentage: 0, unit: "dozen", isFeatured: true, totalSold: 89 },
    { businessId: business._id, categoryId: fruitsVeg._id, name: "Spinach", nameGu: "પાલક", price: 20, stock: 3, minStock: 5, status: "active", gstPercentage: 0, unit: "bunch", totalSold: 167 },

    // Dairy
    { businessId: business._id, categoryId: dairy._id, name: "Amul Full Cream Milk", nameGu: "અમૂલ ફૂલ ક્રીમ દૂધ", price: 60, stock: 40, minStock: 10, status: "active", gstPercentage: 5, unit: "ltr", isFeatured: true, totalSold: 580 },
    { businessId: business._id, categoryId: dairy._id, name: "Fresh Curd", nameGu: "તાજું દહીં", price: 45, stock: 25, minStock: 8, status: "active", gstPercentage: 5, unit: "500g", totalSold: 234 },
    { businessId: business._id, categoryId: dairy._id, name: "Amul Butter", nameGu: "અમૂલ બટર", price: 55, stock: 30, minStock: 10, status: "active", gstPercentage: 12, unit: "100g", totalSold: 156 },
    { businessId: business._id, categoryId: dairy._id, name: "Farm Fresh Eggs", nameGu: "ખેત ઈંડા", price: 90, stock: 0, minStock: 12, status: "out_of_stock", gstPercentage: 0, unit: "dozen", totalSold: 203 },

    // Grains
    { businessId: business._id, categoryId: grains._id, name: "Basmati Rice", nameGu: "બાસ્મતી ચોખા", price: 120, stock: 50, minStock: 10, status: "active", gstPercentage: 5, unit: "kg", isFeatured: true, totalSold: 189 },
    { businessId: business._id, categoryId: grains._id, name: "Toor Dal", nameGu: "તુવેર દાળ", price: 145, stock: 35, minStock: 10, status: "active", gstPercentage: 5, unit: "kg", totalSold: 145 },
    { businessId: business._id, categoryId: grains._id, name: "Whole Wheat Flour (Atta)", nameGu: "ઘઉંનો લોટ (આટો)", price: 55, stock: 60, minStock: 15, status: "active", gstPercentage: 5, unit: "kg", totalSold: 367 },

    // Snacks
    { businessId: business._id, categoryId: snacks._id, name: "Haldiram Bhujia", nameGu: "હલ્દીરામ ભૂજિયા", price: 120, stock: 25, minStock: 8, status: "active", gstPercentage: 12, unit: "400g", isFeatured: true, totalSold: 234 },
    { businessId: business._id, categoryId: snacks._id, name: "Thums Up 600ml", nameGu: "ઠુમ્સ અપ 600ml", price: 40, stock: 48, minStock: 12, status: "active", gstPercentage: 28, unit: "bottle", totalSold: 445 },
    { businessId: business._id, categoryId: snacks._id, name: "Bingo Mad Angles", nameGu: "બિંગો મેડ એન્ગલ્સ", price: 20, stock: 60, minStock: 20, status: "active", gstPercentage: 12, unit: "pcs", totalSold: 612 },

    // Personal care
    { businessId: business._id, categoryId: personal._id, name: "Lifebuoy Soap", nameGu: "લાઇફ બોય સાબુ", price: 35, stock: 40, minStock: 10, status: "active", gstPercentage: 18, unit: "pcs", totalSold: 198 },
    { businessId: business._id, categoryId: personal._id, name: "Colgate Toothpaste", nameGu: "કોલ્ગેટ ટૂથ પેસ્ટ", price: 89, stock: 2, minStock: 10, status: "active", gstPercentage: 18, unit: "200g", totalSold: 167 },
  ]);

  // Create a second demo business (cafe)
  console.log("☕ Creating demo business (Mocha Cafe)...");
  const cafeUser = await User.create({
    name: "Priya Sharma",
    email: "cafe@smartdukaan.com",
    password: hashedPw,
    role: "business_owner",
    phone: "+91 9865432100",
    isVerified: true,
    isActive: true,
  });

  const cafeBusiness = await Business.create({
    name: "Mocha Cafe",
    slug: "mocha-cafe",
    ownerId: cafeUser._id,
    email: "mocha@example.com",
    phone: "+91 9865432100",
    address: "Shop 5, Phoenix Market City",
    city: "Surat",
    state: "Gujarat",
    pincode: "395007",
    description: "Premium coffee and artisan sandwiches. Your perfect escape.",
    tagline: "Life begins after coffee ☕",
    theme: "cafe",
    status: "active",
    whatsappNumber: "+91 9865432100",
    primaryColor: "#d97706",
    settings: {
      currency: "INR",
      currencySymbol: "₹",
      taxEnabled: true,
      defaultGst: 18,
      invoicePrefix: "MC",
      invoiceCounter: 1,
      loyaltyEnabled: true,
      onlineOrderEnabled: true,
      whatsappOrderEnabled: true,
      language: "en",
    },
  });

  await User.findByIdAndUpdate(cafeUser._id, { businessId: cafeBusiness._id });

  const cafeCategories = await Category.create([
    { businessId: cafeBusiness._id, name: "Hot Beverages", nameGu: "ગરમ પીણા", slug: "hot-beverages", sortOrder: 1, isActive: true },
    { businessId: cafeBusiness._id, name: "Cold Beverages", nameGu: "ઠંડા પીણા", slug: "cold-beverages", sortOrder: 2, isActive: true },
    { businessId: cafeBusiness._id, name: "Sandwiches & Wraps", nameGu: "સેન્ડવીચ", slug: "sandwiches-wraps", sortOrder: 3, isActive: true },
    { businessId: cafeBusiness._id, name: "Desserts", nameGu: "ડેઝર્ટ", slug: "desserts", sortOrder: 4, isActive: true },
  ]);

  const [hot, cold, sand, dessert] = cafeCategories;

  await Product.create([
    { businessId: cafeBusiness._id, categoryId: hot._id, name: "Cappuccino", nameGu: "કેપ્પુચિનો", price: 180, stock: 100, status: "active", gstPercentage: 18, unit: "cup", isFeatured: true, totalSold: 456 },
    { businessId: cafeBusiness._id, categoryId: hot._id, name: "Masala Chai", nameGu: "મસાલા ચા", price: 80, stock: 100, status: "active", gstPercentage: 5, unit: "cup", totalSold: 892 },
    { businessId: cafeBusiness._id, categoryId: hot._id, name: "Espresso", nameGu: "એક્સ્પ્રેસો", price: 150, stock: 100, status: "active", gstPercentage: 18, unit: "shot", totalSold: 234 },
    { businessId: cafeBusiness._id, categoryId: cold._id, name: "Cold Coffee", nameGu: "ઠંડી કૉફી", price: 220, stock: 100, status: "active", gstPercentage: 18, unit: "glass", isFeatured: true, totalSold: 678 },
    { businessId: cafeBusiness._id, categoryId: cold._id, name: "Mango Smoothie", nameGu: "આંબા સ્મૂધી", price: 199, stock: 100, status: "active", gstPercentage: 12, unit: "glass", isFeatured: true, totalSold: 345 },
    { businessId: cafeBusiness._id, categoryId: sand._id, name: "Veg Club Sandwich", nameGu: "વેજ ક્લબ સેન્ડવીચ", price: 250, stock: 50, status: "active", gstPercentage: 18, unit: "pcs", totalSold: 234 },
    { businessId: cafeBusiness._id, categoryId: sand._id, name: "Paneer Tikka Wrap", nameGu: "પનીર ટિક્કા રૅપ", price: 280, stock: 40, status: "active", gstPercentage: 18, unit: "pcs", totalSold: 189 },
    { businessId: cafeBusiness._id, categoryId: dessert._id, name: "Chocolate Brownie", nameGu: "ચૉકોલેટ બ્રાઉની", price: 150, stock: 30, status: "active", gstPercentage: 18, unit: "slice", isFeatured: true, totalSold: 412 },
    { businessId: cafeBusiness._id, categoryId: dessert._id, name: "Cheesecake Slice", nameGu: "ચીઝ કૅક", price: 180, stock: 20, status: "active", gstPercentage: 18, unit: "slice", totalSold: 267 },
  ]);

  console.log("\n✅ Seed data created successfully!\n");
  console.log("Demo accounts:");
  console.log("  Super Admin:   admin@smartdukaan.com / demo1234");
  console.log("  Grocery Store: demo@smartdukaan.com / demo1234");
  console.log("  Cafe:          cafe@smartdukaan.com / demo1234\n");
  console.log("Demo storefronts:");
  console.log("  http://localhost:3000/en/business/fresh-mart");
  console.log("  http://localhost:3000/en/business/mocha-cafe\n");

  await mongoose.disconnect();
}

seed().catch((error) => {
  console.error("❌ Seed failed:", error);
  process.exit(1);
});
