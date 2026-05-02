import "./env";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "./index";
import { users } from "./schema/users";
import { general } from "./schema/general";
import { transactionStatuses } from "./schema/transaction-statuses";
import { transactionItemTypes } from "./schema/transaction-item-types";
import { GENERAL_KEYS } from "@/shared/constants/general-keys";

async function seed() {
  console.log("Seeding...");

  await db
    .insert(transactionStatuses)
    .values({ status: "OPEN" })
    .onConflictDoNothing();

  const itemTypes = ["ITEM", "TAX", "SERVICE_CHARGE", "ADDITIONAL"];
  for (const type of itemTypes) {
    await db
      .insert(transactionItemTypes)
      .values({ type })
      .onConflictDoNothing();
  }

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

  const existingAdminEmail = await db
    .select()
    .from(general)
    .where(eq(general.key, GENERAL_KEYS.authAdminEmail))
    .limit(1);

  if (existingAdminEmail.length === 0) {
    await db.insert(general).values({
      key: GENERAL_KEYS.authAdminEmail,
      value: "admin@example.com",
    });
  }

  console.log("Done.");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
