import "dotenv/config";

import { db } from "./index";
import { categories } from "./schema";

async function testConnection() {
  try {
    // Insert a test category
    const result = await db
      .insert(categories)
      .values({
        name: "Technology",
        description: "Tech-related posts",
        slug: "technology",
      })
      .returning();

    console.log("✅ Database connection successful!");
    console.log("Created category:", result);

    // Query all categories
    const allCategories = await db.select().from(categories);
    console.log("All categories:", allCategories);
  } catch (error) {
    console.error("❌ Database connection failed:", error);
  }
}

testConnection();
