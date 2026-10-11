import { jwtVerify, SignJWT } from "jose";

export const SESSION_COOKIE = "office_session";
const SESSION_DAYS = 30;
const RESET_HOURS = 24;
const RESET_AUDIENCE = "password-reset";

function secretKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error("AUTH_SECRET is missing or too short. See .env.example.");
  }
  return new TextEncoder().encode(secret);
}

/**
 * A short fingerprint of the stored password hash. Tokens carry it, so changing
 * the password invalidates existing sessions and used reset links.
 */
export async function passwordFingerprint(passwordHash: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(passwordHash));
  return Buffer.from(digest).toString("base64url").slice(0, 16);
}

export async function signSession(userId: string, passwordHash: string) {
  const expires = new Date(Date.now() + SESSION_DAYS * 86_400_000);
  const token = await new SignJWT({ pv: await passwordFingerprint(passwordHash) })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(expires)
    .sign(secretKey());
  return { token, expires };
}

/** Returns the session's user id and password fingerprint, or null if invalid or expired. */
export async function verifySession(token: string | undefined) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey(), { algorithms: ["HS256"] });
    // Reset-link tokens are signed with the same key; never accept them as sessions.
    if (payload.aud || !payload.sub) return null;
    return { userId: payload.sub, pv: typeof payload.pv === "string" ? payload.pv : undefined };
  } catch {
    return null;
  }
}

export async function signResetToken(userId: string, passwordHash: string) {
  return new SignJWT({ pv: await passwordFingerprint(passwordHash) })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setAudience(RESET_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(`${RESET_HOURS}h`)
    .sign(secretKey());
}

export async function verifyResetToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secretKey(), {
      algorithms: ["HS256"],
      audience: RESET_AUDIENCE,
    });
    if (!payload.sub || typeof payload.pv !== "string") return null;
    return { userId: payload.sub, pv: payload.pv };
  } catch {
    return null;
  }
}
