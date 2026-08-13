import { db } from 'src/config/db';
import { categories  as categoriesTable} from 'src/schema';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  console.log('🌱 Seeding database...');

  try {
    // 1. Read the JSON file
    const filePath = path.join(process.cwd(), 'categories.json');
    const fileContents = fs.readFileSync(filePath, 'utf-8');
    const categoriesToInsert = JSON.parse(fileContents);

    if (!Array.isArray(categoriesToInsert) || categoriesToInsert.length === 0) {
      console.log('No categories to insert. Exiting.');
      return;
    }

    // 2. Insert all categories in a single command
    console.log(`Inserting ${categoriesToInsert.length} categories...`);

    // This is the Drizzle command for bulk insert
    await db.insert(categoriesTable).values(categoriesToInsert);

    console.log('✅ Database seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:');
    console.error(error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

main();
