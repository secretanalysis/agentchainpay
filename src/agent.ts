import EventEmitter from "events";

export type Action = { type: string; meta?: unknown };
export type SignalType = "attack" | "opportunity" | "noise";

export interface Signal {
  id: string;
  type: SignalType;
  severity: number;
  tick: number;
  timestamp: number;
  meta?: Record<string, unknown>;
}

export interface SignalOffer {
  agent: string;
  signalId: string;
  stance: "buy" | "sell";
  conviction: number;
  priceOffset: number;
  timestamp: number;
}

export interface GovernanceProposal {
  agent: string;
  signalId: string;
  change: "tighten-risk" | "loosen-risk";
  rationale: string;
  value: number;
  timestamp: number;
}

export interface AgentState {
  eventBus: EventEmitter;
  recentSignals: Signal[];
  recentOffers: SignalOffer[];
  recentProposals: GovernanceProposal[];
  tick: number;
  protocolTreasury: number;
}

export abstract class Agent {
  id: string;
  did: string;
  eventBus: EventEmitter;

  constructor(id: string, did: string, eventBus: EventEmitter) {
    this.id = id;
    this.did = did;
    this.eventBus = eventBus;
  }

  abstract step(state: AgentState): Promise<void>;
}
