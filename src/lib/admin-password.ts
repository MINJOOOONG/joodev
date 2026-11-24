import { createHash, timingSafeEqual } from "node:crypto";
import bcrypt from "bcryptjs";

export class AdminAuthConfigurationError extends Error {
  constructor() {
    super("Admin authentication is not configured correctly.");
    this.name = "AdminAuthConfigurationError";
  }
}

const BCRYPT_HASH = /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/;

export async function verifyPassword(password: string): Promise<boolean> {
  const configuredHash = process.env.ADMIN_PASSWORD_HASH;
  if (configuredHash) {
    if (!BCRYPT_HASH.test(configuredHash)) throw new AdminAuthConfigurationError();
    return bcrypt.compare(password, configuredHash);
  }

  // Existing deployments use ADMIN_PASSWORD. Keep their current credential
  // working; an explicitly configured bcrypt hash always takes precedence.
  const existingPassword = process.env.ADMIN_PASSWORD;
  if (!existingPassword) throw new AdminAuthConfigurationError();
  if (BCRYPT_HASH.test(existingPassword)) return bcrypt.compare(password, existingPassword);

  const digest = (value: string) => createHash("sha256").update(value, "utf8").digest();
  return timingSafeEqual(digest(password), digest(existingPassword));
}
