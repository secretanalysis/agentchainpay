// src/agentToken.ts
// NOTE: demo uses HMAC stub signature. Replace with hybrid PQ signatures + HSM in production.
import crypto from "crypto";
import { PrimePowerRegistry } from "./primes";

export type DID = string;

export interface AgentToken {
  did: DID;
  // rawProduct only kept in-memory during token creation/verification; never persist it.
  rawProduct?: bigint;
  commitment: string; // hex string of SHA512(salt || '|' || product)
  salt: string; // base64
  expiresAt: number; // unix secs
  signature: string; // HMAC stub in demo
}

// Create ephemeral token: compute product in-memory then commit
export function createAgentToken(did: DID, product: bigint, ttlSeconds: number, signerKeyHex: string): AgentToken {
  const salt = crypto.randomBytes(16).toString("base64");
  const buf = Buffer.from(salt + "|" + product.toString(), "utf8");
  const commitment = crypto.createHash("sha512").update(buf).digest("hex");
  const expiresAt = Math.floor(Date.now() / 1000) + ttlSeconds;
  // HMAC stub: production must use hybrid PQ signature (Dilithium + Ed25519) and store verification keys externally.
  const sig = crypto.createHmac("sha256", Buffer.from(signerKeyHex, "hex")).update(`${did}|${commitment}|${expiresAt}`).digest("base64");
  return { did, rawProduct: product, commitment, salt, expiresAt, signature: sig };
}

// Verify token signature + expiry (demo HMAC)
export function verifyAgentToken(token: AgentToken, signerKeyHex: string): boolean {
  const expected = crypto.createHmac("sha256", Buffer.from(signerKeyHex, "hex")).update(`${token.did}|${token.commitment}|${token.expiresAt}`).digest("base64");
  if (expected !== token.signature) return false;
  if (token.expiresAt < Math.floor(Date.now() / 1000)) return false;
  return true;
}

// For on-chain verification: produce attestation package {did, commitment, salt, expiresAt, signature}
// On-chain contract should only store commitment or merkle root.
