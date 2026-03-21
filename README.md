# Agent Chain Pay — Story Roadmap (Alpha on Tron)

Agent Chain Pay is an alpha-stage architecture for turning agent actions into verifiable, bond-backed, and eventually liquidity-enabled payment flows on Tron.

The current repository is intentionally small: it demonstrates the core ingredients, not a production-ready network. Today, the codebase shows how an agent can receive an ephemeral capability token, how that token can be reduced to a commitment instead of exposing raw capability state, how a minimal governor-driven King DPoS layer can anchor operator actions, and how a bond registry plus liquidity router can sketch the settlement surface for future flows.

This README tells the project as a roadmap story so contributors can understand **what exists now, why it exists, and what has to happen next**.

## The story in one sentence

Build a Tron-native agent payment stack where:
- agents receive **ephemeral capability rights**,
- the chain stores **commitments instead of raw secrets**,
- operators are coordinated by a **minimal King DPoS governance layer**,
- economic behavior is constrained with **bonding and slashing**, and
- liquidity eventually supports **credit-like settlement and redemptions**.

## Current alpha components

### 1. Capability encoding and ephemeral agent tokens
The TypeScript alpha starts with a `PrimePowerRegistry` that maps capabilities to primes and encodes an agent's permissions as a product of `p^3` factors. That product is meant for in-memory use only; the code explicitly warns against persisting it publicly because it is factorable. Instead, the token flow creates a salted SHA-512 commitment and signs an attestation bundle with a demo HMAC stub. In production, this is meant to evolve into hybrid post-quantum attestations backed by HSM or MPC infrastructure.

### 2. Agent orchestration and simulation
The repository includes a lightweight orchestration layer and a simulator so the team can test agent behaviors before wiring those behaviors into real value flows. The short simulation and GA sweep are not yet economic truth engines; they are scaffolding to exercise agent interactions, generate signals/offers/proposals, and later become a proving ground for parameter tuning such as bond size, king term duration, challenge windows, and slashing rates.

### 3. Minimal on-chain control plane
The Solidity contracts sketch the smallest on-chain footprint needed for the story:
- `KingDPoSTron.sol` stores capability commitments, allows a governor to elect the current king, and emits slash events.
- `BondRegistryTron.sol` holds bonds tied to DID hashes and allows time-locked withdrawals.
- `LiquidityRouterTron.sol` accepts deposits and can redeem credit based on off-chain proof material.

The philosophy is clear across the contracts: keep sensitive verification and complex logic off-chain for now, and let the chain act as a minimal settlement and accountability surface.

### 4. Deployment and security posture
The deployment notes and PQFS notes make the intended security direction explicit. The repository is alpha-only, Shasta/test usage is the target for experiments, and mainnet-like operation is blocked on multisig, timelocks, audit work, deterministic builds, hybrid PQ cryptography, and hardened secret handling.

## End-to-end product story

The roadmap can be understood as a sequence of chapters.

### Chapter 0 — Research sandbox
**Where the repo is now.**

The project begins as a sandbox for three ideas:
1. represent agent permissions without exposing them directly,
2. separate fast off-chain reasoning from minimal on-chain commitments, and
3. model a payment network where governance, bond discipline, and liquidity are distinct layers instead of one monolithic contract.

At this stage, the code exists to prove the shape of the system:
- the CLI runs a demo of capability registration and token commitment generation,
- the simulator exercises agent interactions,
- the GA harness explores parameter candidates,
- and the contracts define the eventual on-chain anchoring points.

### Chapter 1 — Capability-constrained agents
**First milestone: an agent should only do what it was authorized to do.**

The first operational story is simple:
- define a capability vocabulary such as `CREATE`, `SETTLE`, `DISPUTE`, `CHALLENGE`, and `RELAYER`,
- encode authorized capabilities in-memory,
- turn that state into a commitment-bearing token,
- and pass only the attestation package downstream.

The outcome of this chapter is not “perfect cryptography”; it is a working contract between the agent runtime and the settlement stack:
- raw capability products remain ephemeral,
- commitments become the durable record,
- and verification boundaries are made explicit.

**What needs to happen next in this chapter**
- Replace HMAC signing with the documented hybrid signature stack.
- Move verification keys and signing authority into HSM/MPC-backed infrastructure.
- Add explicit attestation formats for relayers, challengers, and settlement executors.
- Introduce replay protection, revocation windows, and challenge proofs.

### Chapter 2 — Governed operator coordination
**Second milestone: not every actor should be equal at every moment.**

The King DPoS contract introduces a temporary operator focal point: the elected king. In alpha form, the governor elects the king directly, which is intentionally centralized. The purpose is not decentralization theater; the purpose is to create a controllable starting point for the following behaviors:
- assigning operational authority for a term,
- publishing commitment updates,
- and creating a slashing surface for misconduct.

This chapter tells the governance story:
- off-chain systems observe agent and market behavior,
- the governor or future governance machinery records commitment state on-chain,
- a king is elected for a bounded term,
- and evidence-driven slashing becomes possible once staking/accounting is expanded.

**What needs to happen next in this chapter**
- Replace direct governor-only election with off-chain ordered candidate lists and proof submission.
- Add transparent term, challenge, and succession rules.
- Connect slashing to actual bonded stake flows and treasury routing.
- Move governor powers behind multisig and timelock before any serious deployment.

### Chapter 3 — Bonded accountability
**Third milestone: misbehavior must become economically expensive.**

The bond registry is the first piece of economic discipline. In the current alpha, a DID hash can accumulate stake bonds that unlock after a fixed time. This is deliberately bare-bones, but it establishes the eventual enforcement pattern:
- participants post capital to back behavior,
- the system tracks those bonds against identities or roles,
- and later governance can slash or unlock them based on outcomes.

This is the chapter where Agent Chain Pay transitions from “authenticated actions” to “economically accountable actions.”

**What needs to happen next in this chapter**
- Add bond classes for operators, relayers, challengers, and liquidity providers.
- Link evidence and slash events to actual balance deductions.
- Define dispute windows and challenger rewards.
- Model partial slashing, progressive penalties, and recovery paths in the simulator.

### Chapter 4 — Liquidity-backed payment flow
**Fourth milestone: authorized actions should settle into usable value flows.**

The liquidity router sketches how the network could move from commitments and governance into actual credit redemption. In the alpha, it only supports deposits and a proof-triggered redeem flow. The larger story is:
- liquidity providers deposit inventory,
- agent-authorized activity creates redeemable credit claims,
- relayers or settlement actors present off-chain attestations,
- and the router releases funds when policy conditions are met.

This is where Agent Chain Pay becomes more than governance plus registry logic. It becomes the beginnings of a payment rail.

**What needs to happen next in this chapter**
- Enforce proof verification against hardened attestation formats.
- Add accounting for issued credit, redeemed credit, and outstanding liabilities.
- Introduce LP protections, rate limits, and insolvency guards.
- Simulate stress conditions like redemption spikes, malicious claims, and delayed finality.

### Chapter 5 — Simulation-driven parameter discovery
**Fifth milestone: tune the system before trusting it.**

The simulator and GA harness are the project's laboratory. Their long-term role is to answer questions such as:
- What bond sizes deter bad behavior without blocking participation?
- How long should a king term last?
- What slashing percentage produces credible deterrence?
- How wide should challenge windows be?
- How much liquidity reserve is needed for target redemption latency?

Today, the GA scoring is a stub. Tomorrow, it should become one of the most important safety tools in the stack.

**What needs to happen next in this chapter**
- Replace random fitness with metrics derived from simulation outcomes.
- Track loss rates, settlement latency, challenge success, capital efficiency, and governance churn.
- Add adversarial agents and failure scenarios.
- Use simulation output to generate proposed parameter sets for staged deployments.

### Chapter 6 — Secure deployment discipline
**Sixth milestone: prove the operational path is as safe as the protocol path.**

The deployment notes are intentionally conservative. The project does not claim production readiness. The roadmap toward deployment should look like this:
1. deterministic compilation,
2. testnet deployment of BondRegistry and LiquidityRouter,
3. seeded test liquidity only,
4. KingDPoS deployment with multisig-backed governor controls,
5. commitment publication and dry-run governance operations,
6. audit remediation,
7. only then consider broader exposure.

This chapter also includes the cryptographic hardening path:
- Kyber768 + X25519 for hybrid KEM,
- Dilithium3 + Ed25519 for hybrid signatures,
- HKDF-SHA512 into strong AEAD schemes,
- and threshold HSM or MPC for any sensitive signing or unseal flow.

## Practical roadmap by phase

### Phase A — Complete the alpha foundations
- Keep the CLI demo, short simulation, and short GA flow working as baseline developer entry points.
- Expand README/docs so new contributors understand the architecture quickly.
- Preserve the rule that raw capability products stay ephemeral.
- Refactor demo-only assumptions into clearly labeled interfaces.

### Phase B — Harden cryptographic attestations
- Replace HMAC token signing with hybrid PQ + classical signatures.
- Define attestation schemas for issuance, redemption, challenge, and governance actions.
- Add key rotation, expiry semantics, and replay resistance.
- Externalize keys into HSM/MPC or secrets infrastructure.

### Phase C — Connect governance to economics
- Attach real staking and slashing accounting to the King/Bond flows.
- Formalize king election inputs and challenge mechanics.
- Simulate governance capture, collusion, and griefing scenarios.
- Move all privileged actions to multisig/timelock controls.

### Phase D — Build credible settlement plumbing
- Turn `LiquidityRouterTron` into a constrained settlement module.
- Add liabilities tracking and credit issuance accounting.
- Implement proof verification gates and treasury protections.
- Test LP risk boundaries and withdrawal behavior under stress.

### Phase E — Expand simulation into decision support
- Add measurable KPIs and adversarial scenarios.
- Feed simulation outputs into GA scoring.
- Compare candidate parameter sets by safety and capital efficiency.
- Use results to define testnet graduation criteria.

### Phase F — Testnet operations and staged decentralization
- Deploy on Tron test infrastructure with deterministic builds.
- Use seeded, explicitly non-production liquidity.
- Run governance drills, redemption drills, and slash drills.
- Progressively reduce manual governor control only after operational evidence supports it.

## How to explore the alpha today

### Quick start
1. Install dependencies:
   ```bash
   npm ci
   ```
2. Run the capability token demo:
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

### What each command shows
- `npm run demo` shows the capability registry, prime-powered encoding, and commitment-based token flow.
- `npm run sim-short` runs the lightweight multi-agent orchestration loop.
- `npm run ga-short` runs the stub GA parameter search over repeated short simulations.

## Repository map

- `src/` — TypeScript orchestrator, agent primitives, prime-power capability registry, simulator, GA harness, and CLI entrypoints.
- `contracts/` — Tron/EVM-compatible Solidity sketches for governance, bonds, and liquidity routing.
- `deploy/` — deployment adapter code for Tron.
- `docs/` — deployment notes and supporting documentation.
- `ops/` — PQFS and operational-security notes.
- `openai/` — OpenAPI specification assets.
- `scripts/` — example announcement and support material.

## Safety boundaries

Do **not** treat this repository as production-ready.

Before any funded or public deployment:
- replace placeholder keys and HMAC stubs,
- use multisig + timelock for all privileged roles,
- audit contracts and settlement logic,
- avoid persisting raw prime-power capability products,
- store only salted commitments or Merkle roots on-chain,
- and keep all testing capital isolated from real treasury flows.

## Contribution guide for roadmap work

If you want to contribute effectively, the highest-leverage areas are:
1. attestation design,
2. simulation metrics and adversarial scenarios,
3. staking/slashing accounting,
4. liquidity accounting and proof validation,
5. deterministic deployment and security automation,
6. clearer agent workflow specifications.

In other words: the alpha already demonstrates the system's **shape**. The roadmap is about converting that shape into a secure, measurable, and economically credible network.
