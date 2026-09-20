import { hash, compare } from "bcryptjs";

export function hashPassword(plain: string) {
  return hash(plain, 12);
}

export function verifyPassword(plain: string, passwordHash: string) {
  return compare(plain, passwordHash);
}
