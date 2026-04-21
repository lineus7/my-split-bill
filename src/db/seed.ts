import { config } from "dotenv";
config({ path: ".env.local" });

import bcrypt from "bcryptjs";
import { db } from "./index";
import { users } from "./schema/users";
import { transactionStatuses } from "./schema/transaction-statuses";

async function seed() {
  console.log("Seeding...");

  await db
    .insert(transactionStatuses)
    .values({ status: "OPEN" })
    .onConflictDoNothing();

  const hashedPassword = await bcrypt.hash("password", 10);
  await db
    .insert(users)
    .values({
      username: "admin",
      email: "admin@example.com",
      password: hashedPassword,
      isActive: true,
    })
    .onConflictDoNothing();

  console.log("Done.");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
