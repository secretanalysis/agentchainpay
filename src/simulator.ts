import { ContrarianAgent } from "./agents/contrarianAgent";
import { AgentState } from "./agent";
import { Orchestrator, OrchestratorLogger, OrchestratorOptions } from "./orchestrator";

export interface SimulationOptions extends OrchestratorOptions {
  ticks?: number;
  tickDelayMs?: number;
  logger?: OrchestratorLogger;
}

export async function runSim(optionsOrTicks: number | SimulationOptions = 200): Promise<AgentState> {
  const options = normalizeSimulationOptions(optionsOrTicks);
  const orchestrator = new Orchestrator(options);
  orchestrator.registerAgent(new ContrarianAgent("agent-1", "did:tron:agent-1", orchestrator.eventBus));
  orchestrator.registerAgent(new ContrarianAgent("agent-2", "did:tron:agent-2", orchestrator.eventBus));

  for (let tick = 0; tick < options.ticks; tick += 1) {
    await orchestrator.runTick();
    if (options.tickDelayMs > 0) {
      await delay(options.tickDelayMs);
    }
  }

  options.logger?.log("Simulation completed", {
    signals: orchestrator.state.recentSignals.length,
    offers: orchestrator.state.recentOffers.length,
    proposals: orchestrator.state.recentProposals.length
  });

  return orchestrator.state;
}

function normalizeSimulationOptions(optionsOrTicks: number | SimulationOptions): Required<SimulationOptions> {
  if (typeof optionsOrTicks === "number") {
    return {
      attackSignalProbability: 0.18,
      logger: console,
      now: Date.now,
      random: Math.random,
      ticks: optionsOrTicks,
      tickDelayMs: 5
    };
  }

  return {
    attackSignalProbability: optionsOrTicks.attackSignalProbability ?? 0.18,
    logger: optionsOrTicks.logger ?? console,
    now: optionsOrTicks.now ?? Date.now,
    random: optionsOrTicks.random ?? Math.random,
    ticks: optionsOrTicks.ticks ?? 200,
    tickDelayMs: optionsOrTicks.tickDelayMs ?? 5
  };
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
