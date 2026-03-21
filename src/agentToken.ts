// src/agentToken.ts
// NOTE: demo uses HMAC stub signature. Replace with hybrid PQ signatures + HSM in production.
import crypto from "crypto";

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

// Create ephemeral token: compute product in-memory then commit.
export function createAgentToken(did: DID, product: bigint, ttlSeconds: number, signerKeyHex: string): AgentToken {
  if (!Number.isFinite(ttlSeconds) || ttlSeconds <= 0) {
    throw new Error("ttlSeconds must be a positive number");
  }

  const salt = crypto.randomBytes(16).toString("base64");
  const commitment = createCommitment(salt, product);
  const expiresAt = Math.floor(Date.now() / 1000) + Math.floor(ttlSeconds);
  // HMAC stub: production must use hybrid PQ signature (Dilithium + Ed25519) and store verification keys externally.
  const signature = signTokenPayload(did, commitment, expiresAt, signerKeyHex);
  return { did, rawProduct: product, commitment, salt, expiresAt, signature };
}

// Verify token signature + expiry (demo HMAC).
export function verifyAgentToken(token: AgentToken, signerKeyHex: string): boolean {
  const expectedSignature = signTokenPayload(token.did, token.commitment, token.expiresAt, signerKeyHex);
  if (!timingSafeMatch(expectedSignature, token.signature)) {
    return false;
  }

  if (token.expiresAt < Math.floor(Date.now() / 1000)) {
    return false;
  }

  if (token.rawProduct !== undefined) {
    const expectedCommitment = createCommitment(token.salt, token.rawProduct);
    if (!timingSafeMatch(expectedCommitment, token.commitment)) {
      return false;
    }
  }

  return true;
}

export function createCommitment(salt: string, product: bigint): string {
  return crypto.createHash("sha512").update(`${salt}|${product.toString()}`, "utf8").digest("hex");
}

function signTokenPayload(did: DID, commitment: string, expiresAt: number, signerKeyHex: string): string {
  return crypto
    .createHmac("sha256", signerKeyHex)
    .update(`${did}|${commitment}|${expiresAt}`)
    .digest("base64");
}

function timingSafeMatch(left: string, right: string): boolean {
  const encoder = new TextEncoder();
  const leftBytes = encoder.encode(left);
  const rightBytes = encoder.encode(right);
  if (leftBytes.length !== rightBytes.length) {
    return false;
  }

  return crypto.timingSafeEqual(leftBytes, rightBytes);
}

// For on-chain verification: produce attestation package {did, commitment, salt, expiresAt, signature}
// On-chain contract should only store commitment or merkle root.
