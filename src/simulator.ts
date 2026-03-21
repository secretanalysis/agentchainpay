// src/simulator.ts
import { Orchestrator } from "./orchestrator";
import { ContrarianAgent } from "./agents/contrarianAgent";

export async function runSim(ticks = 200) {
  const orchestrator = new Orchestrator();
  orchestrator.registerAgent(new ContrarianAgent("agent-1", "did:tron:agent-1", orchestrator.eventBus));
  orchestrator.registerAgent(new ContrarianAgent("agent-2", "did:tron:agent-2", orchestrator.eventBus));
  for (let i = 0; i < ticks; i++) {
    await orchestrator.runTick();
    await new Promise((r) => setTimeout(r, 5)); // simulate time
  }
  console.log("Simulation completed, events:", orchestrator.state.recentSignals.length);
  return orchestrator.state;
}
