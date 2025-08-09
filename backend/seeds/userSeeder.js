const bcrypt = require("bcrypt");
const User = require("../database/entities/User");
const Connection = require("../database/data-source");

async function seedAdminUser() {
  try {
    if (!Connection.isInitialized) {
      await Connection.initialize();
      console.log("Database initialized for Admin seeding...");
    }

    const userRepo = Connection.getRepository(User);

    const adminEmail = "admin@example.com";
    const existingAdmin = await userRepo.findOne({
      where: { email: adminEmail },
    });

    if (existingAdmin) {
      console.log("Admin user already exists.");
      return;
    }

    // Hash the admin password
    const hashedPassword = await bcrypt.hash("Admin@123", 10);

    const adminUser = userRepo.create({
      name: "Super Admin",
      email: adminEmail,
      passwordHash: hashedPassword,
      role: "admin",
    });

    await userRepo.save(adminUser);
    console.log("Admin user created successfully!");
  } catch (error) {
    console.error("Seeding admin user failed:", error);
  }
}

module.exports = seedAdminUser;
