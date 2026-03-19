Agent Chain Pay — Alpha (Tron)

Quick start
1. Create files from repo chunks.
2. Install dependencies:
   npm ci
3. Run demo (capability registry + token flow):
   npm run demo
4. Run short sim:
   npm run sim-short
5. Run short GA sweep:
   npm run ga-short

Security & safety
- Replace all placeholder keys and HMAC stubs with proper PQ hybrid signatures and threshold HSM usage.
- Use multisig + timelock for origin/admin before funding or mainnet deploy.
- Treat prime^3 product as ephemeral; persist only salted commitments or Merkle roots.

Contents
- src/: TypeScript orchestrator, agent primitives, primes registry (prime^3), simulator, GA harness, Tron deploy adapter.
- contracts/: Tron/EVM‑compatible Solidity sketches (King/BondRegistry/LiquidityRouter)
- openapi/: API YAML
- docker-compose.alpha.yml: local stack skeleton
- ops/: PQFS notes
