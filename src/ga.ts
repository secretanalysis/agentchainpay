// src/ga.ts
// Simple GA driver: mutate parameter vectors and run the sim to get scores (demo stub).
import { runSim } from "./simulator";

export type Params = {
  bondSize: number;
  kingTermHours: number;
  regenRate: number;
  challengeWindowHours: number;
  slashPct: number;
};

function randomParams(): Params {
  return {
    bondSize: Math.pow(3, Math.floor(Math.random() * 4)), // factors of 3 exploration
    kingTermHours: [6,24,72][Math.floor(Math.random()*3)],
    regenRate: [0.05,0.2,1.0][Math.floor(Math.random()*3)],
    challengeWindowHours: [24,48,72][Math.floor(Math.random()*3)],
    slashPct: [10,25,40][Math.floor(Math.random()*3)]
  };
}

export async function runGA(generations = 5, pop = 10) {
  let population = Array.from({length: pop}, () => ({ params: randomParams(), score: 0 }));
  for (let g = 0; g < generations; g++) {
    console.log(`GA gen ${g}`);
    for (let i = 0; i < population.length; i++) {
      // run short sim to score (demo uses arbitrary fitness)
      await runSim(40);
      population[i].score = Math.random(); // replace with real scoring derived from sim results
    }
    population.sort((a,b) => b.score - a.score);
    console.log("Top candidate", population[0]);
    // simple mutate: keep top half, replace bottom half with mutations of top
    const keep = population.slice(0, Math.ceil(population.length/2));
    const newPop = [...keep];
    while (newPop.length < pop) {
      const parent = keep[Math.floor(Math.random() * keep.length)].params;
      const child = { ...parent };
      // mutate randomly with factor ~3 jumps occasionally
      if (Math.random() < 0.2) child.bondSize = Math.max(1, child.bondSize * (Math.random() < 0.5 ? 1/3 : 3));
      if (Math.random() < 0.3) child.regenRate *= (1 + (Math.random()-0.5));
      newPop.push({ params: child, score: 0 });
    }
    population = newPop;
  }
  return population.slice(0,3);
}
