import EventEmitter from "events";
import { Agent, AgentState, GovernanceProposal, Signal, SignalOffer } from "./agent";
import { PrimePowerRegistry } from "./primes";

const MAX_SIGNAL_HISTORY = 200;
const MAX_EVENT_HISTORY = 100;
const DEFAULT_ATTACK_SIGNAL_PROBABILITY = 0.18;

export type OrchestratorLogger = Pick<Console, "log">;

export interface OrchestratorOptions {
  attackSignalProbability?: number;
  now?: () => number;
  random?: () => number;
  logger?: OrchestratorLogger;
}

export class Orchestrator {
  public state: AgentState;
  public eventBus: EventEmitter;
  public primes: PrimePowerRegistry;
  public agents: Agent[] = [];

  private readonly attackSignalProbability: number;
  private readonly now: () => number;
  private readonly random: () => number;
  private readonly logger?: OrchestratorLogger;

  constructor(options: OrchestratorOptions = {}) {
    this.eventBus = new EventEmitter();
    this.primes = new PrimePowerRegistry(["CREATE", "SETTLE", "DISPUTE", "CHALLENGE", "RELAYER"]);
    this.state = {
      eventBus: this.eventBus,
      recentSignals: [],
      recentOffers: [],
      recentProposals: [],
      tick: 0,
      protocolTreasury: 0
    };

    this.attackSignalProbability = options.attackSignalProbability ?? DEFAULT_ATTACK_SIGNAL_PROBABILITY;
    this.now = options.now ?? Date.now;
    this.random = options.random ?? Math.random;
    this.logger = options.logger;

    this.eventBus.on("signal.posted", (signal: Signal) => {
      pushBounded(this.state.recentSignals, signal, MAX_SIGNAL_HISTORY);
    });

    this.eventBus.on("signal.offer", (offer: SignalOffer) => {
      pushBounded(this.state.recentOffers, offer, MAX_EVENT_HISTORY);
      this.logger?.log("[Offer]", offer);
    });

    this.eventBus.on("governance.proposal", (proposal: GovernanceProposal) => {
      pushBounded(this.state.recentProposals, proposal, MAX_EVENT_HISTORY);
      this.logger?.log("[Proposal]", proposal);
    });
  }

  registerAgent(agent: Agent): void {
    this.agents.push(agent);
  }

  async runTick(): Promise<void> {
    this.state.tick += 1;
    const signal = maybeCreateAttackSignal(this.state.tick, this.attackSignalProbability, this.random, this.now);
    if (signal) {
      this.eventBus.emit("signal.posted", signal);
      this.logger?.log(`[Tick ${this.state.tick}] adversarial signal severity=${signal.severity.toFixed(3)}`);
    }

    for (const agent of this.agents) {
      await agent.step(this.state);
    }
  }
}

function maybeCreateAttackSignal(
  tick: number,
  attackSignalProbability: number,
  random: () => number,
  now: () => number
): Signal | null {
  if (random() >= attackSignalProbability) {
    return null;
  }

  return {
    id: `signal-${tick}`,
    type: "attack",
    severity: Number(random().toFixed(3)),
    tick,
    timestamp: now(),
    meta: {}
  };
}

function pushBounded<T>(items: T[], item: T, maxItems: number): void {
  items.push(item);
  if (items.length > maxItems) {
    items.shift();
  }
}
