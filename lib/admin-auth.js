import crypto from "crypto";
import { ensureAffiliateTables } from "./affiliates";
import { neon } from "@neondatabase/serverless";

const COOKIE = "love3d_admin";
const MAX_AGE = 60 * 60 * 8;

function secret() {
  if (!process.env.ADMIN_SESSION_SECRET) throw new Error("ADMIN_SESSION_SECRET não configurada.");
  return process.env.ADMIN_SESSION_SECRET;
}

function sign(value) {
  return crypto.createHmac("sha256", secret()).update(value).digest("hex");
}

export function createSessionToken() {
  const payload = `admin.${Date.now() + MAX_AGE * 1000}`;
  return `${payload}.${sign(payload)}`;
}

export function isValidSessionToken(token) {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3 || parts[0] !== "admin") return false;
  const [prefix, expires, signature] = parts;
  if (Number(expires) < Date.now()) return false;
  const expected = sign(`${prefix}.${expires}`);
  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}

export function setSessionCookie(res) {
  res.setHeader("Set-Cookie", `${COOKIE}=${createSessionToken()}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${MAX_AGE}`);
}

export function clearSessionCookie(res) {
  res.setHeader("Set-Cookie", `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`);
}

export function requireAdmin(req, res) {
  const raw = req.cookies?.[COOKIE];
  if (!isValidSessionToken(raw)) {
    res.status(401).json({ error: "Não autenticado." });
    return false;
  }
  return true;
}

export function passwordIsValid(password) {
  const configured = process.env.ADMIN_PASSWORD;
  if (!configured || !password) return false;
  const a = Buffer.from(password);
  const b = Buffer.from(configured);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export function hashCode(code) {
  return crypto.createHash("sha256").update(`${code}:${secret()}`).digest("hex");
}

export function generateCode() {
  return String(crypto.randomInt(100000, 1000000));
}

export async function saveSmsCode(code) {
  await ensureAffiliateTables();
  const sql = neon(process.env.DATABASE_URL);
  await sql`UPDATE admin_sms_codes SET used_at = NOW() WHERE used_at IS NULL`;
  await sql`
    INSERT INTO admin_sms_codes (code_hash, expires_at)
    VALUES (${hashCode(code)}, NOW() + INTERVAL '5 minutes')
  `;
}

export async function verifySmsCode(code) {
  await ensureAffiliateTables();
  const sql = neon(process.env.DATABASE_URL);
  const rows = await sql`
    SELECT id, code_hash, attempts
    FROM admin_sms_codes
    WHERE used_at IS NULL AND expires_at > NOW()
    ORDER BY created_at DESC
    LIMIT 1
  `;
  if (!rows[0] || rows[0].attempts >= 5) return false;

  const valid = rows[0].code_hash === hashCode(code);
  if (!valid) {
    await sql`UPDATE admin_sms_codes SET attempts = attempts + 1 WHERE id = ${rows[0].id}`;
    return false;
  }

  await sql`UPDATE admin_sms_codes SET used_at = NOW() WHERE id = ${rows[0].id}`;
  return true;
}

export { COOKIE };
