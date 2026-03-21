import EventEmitter from "events";
import { Agent, AgentState, GovernanceProposal, Signal, SignalOffer } from "./agent";
import { PrimePowerRegistry } from "./primes";

const MAX_SIGNAL_HISTORY = 200;
const MAX_EVENT_HISTORY = 100;
const ATTACK_SIGNAL_PROBABILITY = 0.18;

export class Orchestrator {
  public state: AgentState;
  public eventBus: EventEmitter;
  public primes: PrimePowerRegistry;
  public agents: Agent[] = [];

  constructor() {
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

    this.eventBus.on("signal.posted", (signal: Signal) => {
      pushBounded(this.state.recentSignals, signal, MAX_SIGNAL_HISTORY);
    });

    this.eventBus.on("signal.offer", (offer: SignalOffer) => {
      pushBounded(this.state.recentOffers, offer, MAX_EVENT_HISTORY);
      console.log("[Offer]", offer);
    });

    this.eventBus.on("governance.proposal", (proposal: GovernanceProposal) => {
      pushBounded(this.state.recentProposals, proposal, MAX_EVENT_HISTORY);
      console.log("[Proposal]", proposal);
    });
  }

  registerAgent(agent: Agent): void {
    this.agents.push(agent);
  }

  async runTick(): Promise<void> {
    this.state.tick += 1;
    const signal = maybeCreateAttackSignal(this.state.tick);
    if (signal) {
      this.eventBus.emit("signal.posted", signal);
      console.log(`[Tick ${this.state.tick}] adversarial signal severity=${signal.severity.toFixed(3)}`);
    }

    for (const agent of this.agents) {
      await agent.step(this.state);
    }
  }
}

function maybeCreateAttackSignal(tick: number): Signal | null {
  if (Math.random() >= ATTACK_SIGNAL_PROBABILITY) {
    return null;
  }

  return {
    id: `signal-${tick}`,
    type: "attack",
    severity: Number(Math.random().toFixed(3)),
    tick,
    timestamp: Date.now(),
    meta: {}
  };
}

function pushBounded<T>(items: T[], item: T, maxItems: number): void {
  items.push(item);
  if (items.length > maxItems) {
    items.shift();
  }
}
