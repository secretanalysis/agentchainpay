# Agent Chain Pay — Alpha (Tron)

Agent Chain Pay is an alpha prototype for a payment and market-coordination network where software agents can discover opportunities, prove bounded capabilities, react to adversarial signals, and settle value flows with minimal on-chain state. The current repository is a simulation-first sandbox: it demonstrates agent coordination, ephemeral capability commitments, governance reactions, and Tron-oriented contract sketches that can later be hardened for real deployments.

## Project story

The core story behind Agent Chain Pay is:

1. **Agents need constrained permissions.** Instead of granting broad, reusable credentials, an agent receives a short-lived token derived from a capability set encoded through a prime-power registry.
2. **Capabilities should be attestable without exposing everything.** The demo creates a salted commitment over the in-memory capability product and treats the raw product as ephemeral.
3. **Markets need active defense.** Agents in the simulator watch for adversarial signals and respond with offers or governance proposals when conditions cross defined thresholds.
4. **Settlement should stay simple on-chain.** The Tron contract sketches keep only minimal commitments, bonds, and liquidity flows on-chain while leaving richer verification and policy logic off-chain.
5. **Production readiness depends on security hardening.** The repository explicitly treats the current crypto, signing, treasury, and deployment setup as placeholders that must be replaced before handling real funds.

## Current alpha scope

Today, the repo provides four connected building blocks:

- **Capability encoding and token minting** for short-lived agent permissions.
- **A local event-driven orchestrator** that produces attack signals and lets agents react.
- **A simulation and GA harness** for exploring policy and market parameters.
- **Tron/EVM-compatible contract sketches** for bonds, king-election/governance, and liquidity routing.

This makes the project suitable for architecture exploration, demo runs, and early mechanism design, but **not** for production custody, live settlement, or permissionless deployment.

## Quick start

1. Install dependencies:
   ```bash
   npm ci
   ```
2. Run the capability/token demo:
   ```bash
   npm run demo
   ```
3. Run the short simulation:
   ```bash
   npm run sim-short
   ```
4. Run the short GA sweep:
   ```bash
   npm run ga-short
   ```
5. Build TypeScript:
   ```bash
   npm run build
   ```

## Repository map

- `src/`: TypeScript orchestrator, agent primitives, capability registry, token creation, simulator, and GA harness.
- `src/agents/`: Example agent implementations.
- `contracts/`: Tron/EVM-compatible Solidity sketches for bonding, governance, and liquidity.
- `deploy/`: Tron deployment adapter.
- `docs/`: Deployment guidance and operator notes.
- `ops/`: Security and PQFS-oriented operational notes.
- `openai/`: OpenAPI material.
- `docker-compose.alpha.yml`: Local stack skeleton.

## Architecture at a glance

### 1) Capability layer

The `PrimePowerRegistry` assigns each capability a prime number and encodes a capability set as the product of each prime raised to the third power. The alpha uses this as an in-memory encoding mechanism and warns against exposing the raw product publicly.

### 2) Token and attestation layer

An agent token is created from:

- agent DID
- encoded capability product
- random salt
- expiry time
- demo signature material

The repository commits to the capability product using `SHA-512(salt || "|" || product)` and keeps the raw product ephemeral.

### 3) Agent coordination layer

The orchestrator emits occasional adversarial attack signals. Agents consume recent signal history, generate offers when attack severity crosses a trading threshold, and generate governance proposals when it crosses a stricter threshold.

### 4) Economic simulation layer

The simulator runs repeated ticks with multiple agents. The GA harness wraps the simulator to explore policy vectors like bond size, term duration, regen rate, challenge window, and slash percentage.

### 5) On-chain settlement layer

The Solidity sketches model:

- **BondRegistry** for staking and time-locked withdrawals.
- **KingDPoS** for governor-controlled commitment setting, king election, and slashing events.
- **LiquidityRouter** for deposits and alpha-style redemptions.

## Full story roadmap

The roadmap below tells the intended story from prototype to a more credible network.

### Phase 0 — Alpha sandbox (present repo)

**Goal:** Prove the interaction model.

Delivered in this phase:

- Capability encoding with prime-power products.
- Ephemeral token commitments and expiry handling.
- Event-driven orchestrator with synthetic attack signals.
- Contrarian agents that convert attacks into offers and risk-tightening proposals.
- Basic GA/search loop for policy experimentation.
- Tron-oriented contract sketches for bond, governance, and liquidity flows.

**Success criteria:**

- Team members can run demos locally.
- Simulation produces consistent signal/offers/proposals activity.
- Core trust boundaries are visible in code and docs.

### Phase 1 — Credible off-chain attestation

**Goal:** Replace demo cryptography and ad hoc trust with verifiable attestations.

Planned work:

- Replace HMAC stub signatures with hybrid PQ + classical signatures.
- Move signer material into threshold HSM or MPC-backed control planes.
- Externalize verification keys and attestation bundles.
- Add structured attestation schemas for capability issuance, offer creation, and redemption proofs.
- Introduce revocation and expiration policies that can be checked by relayers and contracts.

**What this unlocks:**

- Safer agent identity proofs.
- More trustworthy redemption and governance workflows.
- Clearer operator boundaries between issuers, agents, and governors.

### Phase 2 — Stronger market simulation

**Goal:** Turn the simulator into a useful policy lab rather than a smoke test.

Planned work:

- Add more agent strategies beyond the contrarian baseline.
- Score GA candidates from simulation outputs instead of random fitness.
- Model liquidity exhaustion, slashing outcomes, treasury dynamics, and delayed settlement.
- Add replayable seeds and benchmark scenarios.
- Track KPIs such as fill rate, false-positive defense, treasury drawdown, and governance responsiveness.

**What this unlocks:**

- Mechanism tuning before deploying capital.
- Better understanding of adversarial behavior and parameter sensitivity.
- A reproducible evaluation path for protocol changes.

### Phase 3 — Hardened on-chain primitives

**Goal:** Convert sketches into audited, minimally trusted contracts.

Planned work:

- Replace single-governor assumptions with multisig + timelock administration.
- Implement real staking/slashing accounting and treasury routing.
- Add safer redemption constraints, replay protection, and proof validation.
- Reduce contract surface area to commitment storage and objective settlement checks.
- Build deterministic deployment and upgrade procedures for Tron testnets first.

**What this unlocks:**

- Safer custody boundaries.
- Clear challenge/slash pathways.
- Testnet environments suitable for external reviewers and friendly integrators.

### Phase 4 — Relayer and operator network

**Goal:** Make the system operable by multiple parties instead of a single team running everything.

Planned work:

- Define relayer roles for forwarding attestations and settlement requests.
- Add operator dashboards, logs, and alerting for governance and redemption events.
- Create policy around service levels, dispute handling, and evidence retention.
- Standardize API surfaces for issuers, agents, LPs, and auditors.
- Build onboarding flows for approved agent operators and liquidity providers.

**What this unlocks:**

- Operational decentralization.
- Better observability.
- Repeatable partner integrations.

### Phase 5 — Pilot network

**Goal:** Run a limited, supervised economic pilot.

Planned work:

- Launch on a controlled testnet or low-risk pilot environment.
- Use conservative caps on liquidity, issuance, and redemption volume.
- Run tabletop and live incident drills for compromised agents, false attestations, and liquidity shortfalls.
- Publish KPI reviews and governance decisions after each pilot window.
- Gate every expansion on measurable reliability and security thresholds.

**What this unlocks:**

- Real feedback from operator behavior.
- Practical evidence on whether the architecture can sustain real settlement flows.
- A factual basis for deciding whether mainnet progression is justified.

## Narrative user journey

A likely end-state workflow looks like this:

1. An operator registers an agent identity and approved capability policy.
2. A secure issuer creates a short-lived capability attestation for that agent.
3. The agent receives market or risk signals through the coordination layer.
4. The agent emits an offer, hedge, or governance recommendation.
5. Relayers carry the attestation package and settlement intent to the execution environment.
6. Contracts verify minimal proofs and enforce bond/liquidity rules.
7. Governance or challenger flows handle disputed behavior, with evidence retained off-chain and commitments anchored on-chain.

## Security and safety priorities

Before any production or real-value use, the following items must be completed:

- Replace all placeholder keys and HMAC stubs with proper PQ hybrid signatures and threshold HSM usage.
- Use multisig plus timelock for origin/admin authority before funding or mainnet deployment.
- Treat prime-power products as ephemeral values and persist only salted commitments or Merkle roots.
- Audit all fund-handling and redemption logic.
- Add replay protection, rate limits, monitoring, and formal incident response procedures.

## Deployment notes

Recommended alpha deployment flow:

1. Compile contracts using a deterministic Solidity toolchain.
2. Deploy `BondRegistry` and `LiquidityRouter` first.
3. Seed test liquidity only on non-production environments.
4. Deploy `KingDPoS` and set commitments through governed administration.
5. Keep private keys out of CI and use vault/HSM-backed secrets management.

## What this README is for

This README now serves as a project overview and story roadmap. If you are trying to decide whether Agent Chain Pay is:

- a **production payment network**: not yet,
- a **mechanism-design and security prototype**: yes,
- a **starting point for a harder, more secure system**: definitely.
