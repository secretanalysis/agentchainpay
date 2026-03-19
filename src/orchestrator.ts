// src/orchestrator.ts
import EventEmitter from "eventemitter3";
import { PrimePowerRegistry } from "./primes";
import { Agent } from "./agent";

export class Orchestrator {
  public state: any;
  public eventBus: EventEmitter;
  public primes: PrimePowerRegistry;
  public agents: Agent[] = [];

  constructor() {
    this.eventBus = new EventEmitter();
    this.primes = new PrimePowerRegistry(["CREATE","SETTLE","DISPUTE","CHALLENGE","RELAYER"]);
    this.state = { eventBus: this.eventBus, recentSignals: [], tick: 0, protocolTreasury: 0 };

    this.eventBus.on("signal.posted", (s) => {
      this.state.recentSignals.push(s);
      if (this.state.recentSignals.length > 200) this.state.recentSignals.shift();
    });

    this.eventBus.on("signal.offer", (o) => {
      console.log("[Offer]", o);
    });

    this.eventBus.on("governance.proposal", (p) => {
      console.log("[Proposal]", p);
    });
  }

  registerAgent(a: Agent) {
    this.agents.push(a);
  }

  // Run a single tick: inject random adversarial signals then let agents step
  async runTick() {
    this.state.tick++;
    if (Math.random() < 0.18) {
      const s = { type: "attack", severity: Math.random(), meta: {} };
      this.eventBus.emit("signal.posted", s);
      console.log(`[Tick ${this.state.tick}] adversarial signal severity=${s.severity.toFixed(3)}`);
    }
    for (const a of this.agents) await a.step(this.state);
  }
}
