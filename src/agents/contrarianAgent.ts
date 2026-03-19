// src/agents/contrarianAgent.ts
import { Agent } from "../agent";

export class ContrarianAgent extends Agent {
  // Monitors recent signals and converts attacks into market offers
  async step(state: any) {
    const signals = state.recentSignals || [];
    for (const s of signals) {
      if (s.type === "attack" && s.severity > 0.6 && Math.random() < 0.5) {
        // Post a market offer (simulated)
        this.eventBus.emit("signal.offer", { agent: this.id, value: s.severity, timestamp: Date.now() });
      }
    }
    // Chance to propose governance tweak
    if (Math.random() < 0.05) {
      this.eventBus.emit("governance.proposal", { agent: this.id, change: "tweak-fee", val: Math.random() });
    }
  }
}
