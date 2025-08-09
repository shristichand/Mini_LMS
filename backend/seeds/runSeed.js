const seedAdminUser = require("./userSeeder");

async function runSeed() {
  try {
    await seedAdminUser();
    console.log("Admin user seeded successfully.");
  } catch (error) {
    console.error("Seeding failed:", error);
  } finally {
    process.exit(0);
  }
}

runSeed();
