import { eq, or } from "drizzle-orm";
import { db } from "@/db";
import { users, type NewUser } from "@/db/schema/users";

export async function findUserByLogin(login: string) {
  return db
    .select()
    .from(users)
    .where(or(eq(users.email, login), eq(users.username, login)))
    .limit(1)
    .then((rows) => rows[0] ?? null);
}

export async function findExistingUser(username: string, email: string) {
  return db
    .select({ username: users.username, email: users.email })
    .from(users)
    .where(or(eq(users.username, username), eq(users.email, email)))
    .limit(1)
    .then((rows) => rows[0] ?? null);
}

export async function createUser(data: NewUser) {
  await db.insert(users).values(data);
}
