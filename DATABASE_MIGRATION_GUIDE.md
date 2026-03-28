# Database Price Migration Guide

## Overview

Your database currently stores prices in **Toman scale** (e.g., 500000 for 500k Toman), but your frontend now displays them in **GBP**. Without updating the database, prices will be displayed incorrectly (e.g., £500,000 instead of £50).

## Option 1: Update All Prices Manually (Admin Dashboard)

If you only have a few products/classes, you can manually update them through your admin panel:

1. Go to Admin Dashboard → Products/Classes tabs
2. For each item, divide the old price by approximately **10000** to get the GBP equivalent:
   - 500000 Toman ≈ £50 (÷ 10000)
   - 100000 Toman ≈ £10 (÷ 10000)
   - 2000000 Toman ≈ £200 (÷ 10000)

## Option 2: Run a Database Migration Script

If you have many products/classes, use this Node.js script to update all prices at once.

### Create a Migration Script

Create a file called `migrate-prices.js` in your backend folder:

```javascript
// backend/migrate-prices.js
const mongoose = require("mongoose");
require("dotenv").config();

// Import your models
const Product = require("./models/product");
const Class = require("./models/class");

async function migratePrices() {
  try {
    // Connect to MongoDB
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/parsswim",
    );
    console.log("Connected to MongoDB");

    // Migration factor: divide old prices by this to get GBP
    const DIVISION_FACTOR = 10000;

    // Update Products
    const productsResult = await Product.updateMany({ price: { $gt: 0 } }, [
      {
        $set: {
          price: { $divide: ["$price", DIVISION_FACTOR] },
        },
      },
    ]);
    console.log(`✓ Updated ${productsResult.modifiedCount} products`);

    // Update Classes
    const classesResult = await Class.updateMany({ price: { $gt: 0 } }, [
      {
        $set: {
          price: { $divide: ["$price", DIVISION_FACTOR] },
        },
      },
    ]);
    console.log(`✓ Updated ${classesResult.modifiedCount} classes`);

    console.log("\n✅ Migration completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

migratePrices();
```

### Run the Migration

```bash
cd backend
node migrate-prices.js
```

## Option 3: Verify Migration with MongoDB Compass

If you have MongoDB Compass installed:

1. Open MongoDB Compass
2. Connect to your database
3. Go to the `products` collection
4. Open the `product` model
5. Search for any document: `{ price: { $exists: true } }`
6. Update one test document manually to verify the format
7. Example: Change `500000` to `50` and save

## Important Considerations

### Before Migration

- **Backup your database** first!
  ```bash
  # Export your database
  mongodump --uri "your_mongodb_uri" --out ./backup
  ```

### Exchange Rate Reference

If you have a mix of prices, here's a rough conversion guide:

- 500000 Toman ≈ £40-50
- 100000 Toman ≈ £8-10
- 2000000 Toman ≈ £150-200

Adjust these based on your current exchange rates and business needs.

### Testing After Migration

1. Go to your app's product or class pages
2. Verify prices display correctly in GBP
3. Test the cart functionality with updated prices
4. Check admin dashboard tables for correct formatting

## Rollback (If Needed)

If something goes wrong, restore from your backup:

```bash
# Restore your database
mongorestore --uri "your_mongodb_uri" ./backup
```

## Support

If you have any issues with the migration, check:

- MongoDB connection string in your `.env` file
- Model paths in `migrate-prices.js` match your actual model locations
- Database has write permissions
