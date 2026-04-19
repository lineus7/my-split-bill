import { eq } from "drizzle-orm";
import { db } from "@/db";
import { general, type General } from "@/db/schema/general";
import type { GeneralKey } from "@/shared/constants/general-keys";

export async function getGeneralValue(key: GeneralKey): Promise<string | null> {
  const row = await db
    .select({ value: general.value })
    .from(general)
    .where(eq(general.key, key))
    .limit(1)
    .then((rows) => rows[0]);
  return row?.value ?? null;
}

export async function getGeneralList(key: GeneralKey): Promise<General[]> {
  return db.select().from(general).where(eq(general.key, key));
}
