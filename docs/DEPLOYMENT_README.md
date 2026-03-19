Alpha deployment notes
- Compile contracts using your preferred tool (solc, TronBox, Hardhat with Tron plugin).
- On Tron Shasta: set TRON_PRIVATE_KEY locally (only for testing) and GOV env to governor address.
- Replace single-key deploy with multisig/timelock in production.
- Never deploy contracts that accept funds without audit + timelock + multisig.

Recommended flow
1. Compile contracts with deterministic solc.
2. Deploy BondRegistry and LiquidityRouter first.
3. Seed test LPs on Shasta only.
4. Deploy KingDPoS and set commitments via governor (multisig).
