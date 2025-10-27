import "dotenv/config";
import { sql } from "drizzle-orm";
import { db } from "./index";

async function resetDatabase() {
  console.log("🗑️  Dropping all tables...\n");

  try {
    // Drop tables in order (respecting foreign keys)
    await db.execute(sql`DROP TABLE IF EXISTS post_categories CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS posts CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS categories CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS users CASCADE`);

    console.log("✅ All tables dropped\n");

    console.log("📦 Creating tables...\n");

    // Create users table
    await db.execute(sql`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);
    console.log("✅ Created users table");

    // Create categories table
    await db.execute(sql`
      CREATE TABLE categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        slug VARCHAR(100) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);
    console.log("✅ Created categories table");

    // Create posts table
    await db.execute(sql`
      CREATE TABLE posts (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        published BOOLEAN DEFAULT FALSE NOT NULL,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);
    console.log("✅ Created posts table");

    // Create post_categories junction table
    await db.execute(sql`
      CREATE TABLE post_categories (
        post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
        category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
        PRIMARY KEY (post_id, category_id)
      )
    `);
    console.log("✅ Created post_categories table");

    console.log("\n🎉 Database reset complete!\n");
    console.log("Next steps:");
    console.log("1. Run: npm run db:seed");
    console.log("2. Register a new user at /register");
    console.log("3. Create posts!\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error resetting database:", error);
    process.exit(1);
  }
}

resetDatabase();
