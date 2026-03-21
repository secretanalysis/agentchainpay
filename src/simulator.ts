import { ContrarianAgent } from "./agents/contrarianAgent";
import { AgentState } from "./agent";
import { Orchestrator } from "./orchestrator";

export async function runSim(ticks = 200): Promise<AgentState> {
  const orchestrator = new Orchestrator();
  orchestrator.registerAgent(new ContrarianAgent("agent-1", "did:tron:agent-1", orchestrator.eventBus));
  orchestrator.registerAgent(new ContrarianAgent("agent-2", "did:tron:agent-2", orchestrator.eventBus));

  for (let i = 0; i < ticks; i += 1) {
    await orchestrator.runTick();
    await new Promise((resolve) => setTimeout(resolve, 5));
  }

  console.log(
    "Simulation completed",
    {
      signals: orchestrator.state.recentSignals.length,
      offers: orchestrator.state.recentOffers.length,
      proposals: orchestrator.state.recentProposals.length
    }
  );

  return orchestrator.state;
}
