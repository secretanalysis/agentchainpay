import { Agent, AgentState, GovernanceProposal, Signal, SignalOffer } from "../agent";

const DEFAULT_ATTACK_THRESHOLD = 0.6;
const DEFAULT_GOVERNANCE_THRESHOLD = 0.85;
const MAX_CONSIDERED_SIGNALS = 12;

export class ContrarianAgent extends Agent {
  private readonly processedSignals = new Set<string>();
  private readonly attackThreshold: number;
  private readonly governanceThreshold: number;

  constructor(
    id: string,
    did: string,
    eventBus: Agent["eventBus"],
    attackThreshold = DEFAULT_ATTACK_THRESHOLD,
    governanceThreshold = DEFAULT_GOVERNANCE_THRESHOLD
  ) {
    super(id, did, eventBus);
    this.attackThreshold = attackThreshold;
    this.governanceThreshold = governanceThreshold;
  }

  async step(state: AgentState): Promise<void> {
    const pendingSignals = state.recentSignals.slice(-MAX_CONSIDERED_SIGNALS);
    for (const signal of pendingSignals) {
      if (this.processedSignals.has(signal.id)) continue;
      this.processedSignals.add(signal.id);
      this.handleSignal(signal);
    }
  }

  private handleSignal(signal: Signal): void {
    const offer = this.buildOffer(signal);
    if (offer) {
      this.eventBus.emit("signal.offer", offer);
    }

    const proposal = this.buildProposal(signal);
    if (proposal) {
      this.eventBus.emit("governance.proposal", proposal);
    }
  }

  private buildOffer(signal: Signal): SignalOffer | null {
    if (signal.type !== "attack" || signal.severity < this.attackThreshold) {
      return null;
    }

    return {
      agent: this.id,
      signalId: signal.id,
      stance: "buy",
      conviction: round(signal.severity),
      priceOffset: round(1 - signal.severity),
      timestamp: Date.now()
    };
  }

  private buildProposal(signal: Signal): GovernanceProposal | null {
    if (signal.type !== "attack" || signal.severity < this.governanceThreshold) {
      return null;
    }

    return {
      agent: this.id,
      signalId: signal.id,
      change: "tighten-risk",
      rationale: "High-severity attack inverted into stricter risk settings.",
      value: round(signal.severity),
      timestamp: Date.now()
    };
  }
}

function round(value: number): number {
  return Number(value.toFixed(3));
}
