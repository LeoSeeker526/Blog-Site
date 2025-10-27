import "dotenv/config";
import { db } from "./index";
import { categories } from "./schema";
import { slugify } from "@/lib/slugify";

const categoriesToSeed = [
  {
    name: "Technology",
    description: "Latest tech news, gadgets, and software development",
  },
  {
    name: "Anime",
    description: "Japanese animation, manga, and otaku culture",
  },
  {
    name: "Entertainment",
    description: "Movies, TV shows, celebrities, and pop culture",
  },
  {
    name: "Food",
    description: "Recipes, restaurants, cooking tips, and culinary experiences",
  },
  {
    name: "Travel",
    description: "Destinations, travel guides, and adventure stories",
  },
  {
    name: "Music",
    description: "Artists, albums, concerts, and music industry news",
  },
  {
    name: "Literature",
    description: "Books, authors, poetry, and literary analysis",
  },
  {
    name: "Art",
    description: "Visual arts, design, photography, and creative expression",
  },
  {
    name: "Politics",
    description: "Current events, government, and political commentary",
  },
  {
    name: "History",
    description: "Historical events, figures, and cultural heritage",
  },
  {
    name: "Sports",
    description: "Athletics, competitions, teams, and sporting events",
  },
  {
    name: "Gaming",
    description: "Video games, esports, and gaming culture",
  },
  {
    name: "Science",
    description: "Scientific discoveries, research, and innovations",
  },
  {
    name: "Fashion",
    description: "Style, trends, designers, and fashion industry",
  },
  {
    name: "Health & Fitness",
    description: "Wellness, nutrition, exercise, and mental health",
  },
  {
    name: "Business",
    description: "Entrepreneurship, startups, finance, and career advice",
  },
  {
    name: "Education",
    description: "Learning, teaching, academic topics, and educational resources",
  },
  {
    name: "Lifestyle",
    description: "Daily living, personal development, and life advice",
  },
  {
    name: "Miscellaneous",
    description: "Everything else that doesn't fit into other categories",
  },
];

async function seedCategories() {
  console.log("🌱 Starting to seed categories...\n");

  try {
    // Check existing categories
    const existingCategories = await db.select().from(categories);
    console.log(`📊 Found ${existingCategories.length} existing categories\n`);

    let insertedCount = 0;
    let skippedCount = 0;

    for (const category of categoriesToSeed) {
      const slug = slugify(category.name);

      // Check if category already exists
      const existing = existingCategories.find(
        (c) => c.slug === slug || c.name === category.name
      );

      if (existing) {
        console.log(`⏭️  Skipping "${category.name}" - already exists`);
        skippedCount++;
        continue;
      }

      // Insert new category
      await db.insert(categories).values({
        name: category.name,
        description: category.description,
        slug: slug,
      });

      console.log(`✅ Added "${category.name}" (slug: ${slug})`);
      insertedCount++;
    }

    console.log("\n" + "=".repeat(50));
    console.log(`\n🎉 Seeding complete!`);
    console.log(`   ✅ Inserted: ${insertedCount} categories`);
    console.log(`   ⏭️  Skipped: ${skippedCount} categories`);
    console.log(`   📊 Total: ${insertedCount + existingCategories.length} categories in database\n`);

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error seeding categories:", error);
    process.exit(1);
  }
}

seedCategories();
