// Simple GA driver: mutate parameter vectors and run the sim to get scores.
import { AgentState } from "./agent";
import { runSim } from "./simulator";

export type Params = {
  bondSize: number;
  kingTermHours: number;
  regenRate: number;
  challengeWindowHours: number;
  slashPct: number;
};

type Candidate = {
  params: Params;
  score: number;
  metrics?: FitnessMetrics;
};

type FitnessMetrics = {
  signalCoverage: number;
  proposalRate: number;
  treasuryPenalty: number;
  offerBalance: number;
};

const SILENT_LOGGER = { log: () => undefined };

function randomParams(random: () => number): Params {
  return {
    bondSize: Math.pow(3, Math.floor(random() * 4)),
    kingTermHours: pick([6, 24, 72], random),
    regenRate: pick([0.05, 0.2, 1.0], random),
    challengeWindowHours: pick([24, 48, 72], random),
    slashPct: pick([10, 25, 40], random)
  };
}

export async function runGA(generations = 5, pop = 10): Promise<Candidate[]> {
  const random = Math.random;
  let population: Candidate[] = Array.from({ length: pop }, () => ({ params: randomParams(random), score: 0 }));

  for (let generation = 0; generation < generations; generation += 1) {
    console.log(`GA gen ${generation}`);

    for (const candidate of population) {
      const state = await runSim({
        ticks: 40,
        tickDelayMs: 0,
        logger: SILENT_LOGGER,
        attackSignalProbability: deriveAttackProbability(candidate.params),
        random: createSeededRandom(seedFromParams(candidate.params, generation))
      });
      const fitness = scoreState(state, candidate.params);
      candidate.score = fitness.score;
      candidate.metrics = fitness.metrics;
    }

    population.sort((left, right) => right.score - left.score);
    console.log("Top candidate", population[0]);

    if (generation === generations - 1) {
      continue;
    }

    const keep = population.slice(0, Math.ceil(population.length / 2));
    const nextPopulation = [...keep.map((candidate) => ({ ...candidate, params: { ...candidate.params } }))];
    while (nextPopulation.length < pop) {
      const parent = keep[Math.floor(random() * keep.length)].params;
      nextPopulation.push({ params: mutateParams(parent, random), score: 0 });
    }

    population = nextPopulation;
  }

  return population.slice(0, 3);
}

function scoreState(state: AgentState, params: Params): { score: number; metrics: FitnessMetrics } {
  const signalsWithOffers = new Set(state.recentOffers.map((offer) => offer.signalId)).size;
  const signalsWithProposals = new Set(state.recentProposals.map((proposal) => proposal.signalId)).size;
  const signalCoverage = ratio(signalsWithOffers, state.recentSignals.length || 1);
  const proposalRate = ratio(signalsWithProposals, state.recentSignals.length || 1);
  const treasuryPenalty = Math.min(1, state.protocolTreasury / Math.max(1, params.bondSize * 10));
  const buyOffers = state.recentOffers.filter((offer) => offer.stance === "buy").length;
  const sellOffers = state.recentOffers.filter((offer) => offer.stance === "sell").length;
  const offerBalance = 1 - Math.min(1, Math.abs(buyOffers - sellOffers) / Math.max(1, state.recentOffers.length));

  const metrics: FitnessMetrics = {
    signalCoverage: round(signalCoverage),
    proposalRate: round(proposalRate),
    treasuryPenalty: round(treasuryPenalty),
    offerBalance: round(offerBalance)
  };

  const score = round(
    metrics.signalCoverage * 0.45 +
      metrics.proposalRate * 0.25 +
      metrics.offerBalance * 0.2 +
      (1 - metrics.treasuryPenalty) * 0.1
  );

  return { score, metrics };
}

function deriveAttackProbability(params: Params): number {
  const pressure = params.slashPct / 1000 + params.regenRate / 10 + params.bondSize / 100;
  return Math.min(0.65, Math.max(0.1, round(0.12 + pressure)));
}

function mutateParams(parent: Params, random: () => number): Params {
  return {
    bondSize: random() < 0.2 ? clampToPowersOfThree(parent.bondSize * (random() < 0.5 ? 1 / 3 : 3)) : parent.bondSize,
    kingTermHours: random() < 0.25 ? pick([6, 24, 72], random) : parent.kingTermHours,
    regenRate: random() < 0.3 ? clamp(round(parent.regenRate * (1 + (random() - 0.5))), 0.01, 2) : parent.regenRate,
    challengeWindowHours: random() < 0.25 ? pick([24, 48, 72], random) : parent.challengeWindowHours,
    slashPct: random() < 0.25 ? pick([10, 25, 40], random) : parent.slashPct
  };
}

function seedFromParams(params: Params, generation: number): number {
  return (
    params.bondSize * 31 +
    params.kingTermHours * 17 +
    Math.round(params.regenRate * 100) * 13 +
    params.challengeWindowHours * 7 +
    params.slashPct * 5 +
    generation
  );
}

function createSeededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

function pick<T>(items: T[], random: () => number): T {
  return items[Math.floor(random() * items.length)];
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function clampToPowersOfThree(value: number): number {
  return pick([1, 3, 9, 27], createSeededRandom(Math.round(value * 1000)));
}

function ratio(numerator: number, denominator: number): number {
  return numerator / denominator;
}

function round(value: number): number {
  return Number(value.toFixed(3));
}
