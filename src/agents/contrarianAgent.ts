// src/agents/contrarianAgent.ts
import { Agent } from "../agent";

type Signal = {
  type?: string;
  severity?: number;
};

type ContrarianState = {
  recentSignals?: Signal[];
  agentState?: Record<string, { lastSignalIndex?: number }>;
};

const ATTACK_THRESHOLD = 0.6;
const GOVERNANCE_PROPOSAL_ODDS = 0.05;

function clampSeverity(value: number) {
  return Math.max(0, Math.min(1, value));
}

function invertSeverity(value: number) {
  return 1 - clampSeverity(value);
}

export class ContrarianAgent extends Agent {
  // Monitors new attack signals and inverts them into discounted offers.
  async step(state: ContrarianState) {
    const signals = state.recentSignals || [];
    const agentState = (state.agentState ||= {});
    const memory = (agentState[this.id] ||= {});
    const startIndex = memory.lastSignalIndex ?? 0;

    for (let i = startIndex; i < signals.length; i++) {
      const signal = signals[i];
      const severity = clampSeverity(signal.severity ?? 0);
      if (signal.type !== "attack" || severity <= ATTACK_THRESHOLD) {
        continue;
      }

      this.eventBus.emit("signal.offer", {
        agent: this.id,
        source: "contrarian-invert",
        severity,
        value: invertSeverity(severity),
        timestamp: Date.now(),
      });
    }

    memory.lastSignalIndex = signals.length;

    if (Math.random() < GOVERNANCE_PROPOSAL_ODDS) {
      this.eventBus.emit("governance.proposal", {
        agent: this.id,
        change: "tweak-fee",
        val: Math.random(),
      });
    }
  }
}
