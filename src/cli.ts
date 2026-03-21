import { createAgentToken } from "./agentToken";
import { runGA } from "./ga";
import { PrimePowerRegistry } from "./primes";
import { runSim } from "./simulator";

type Command = "demo" | "sim" | "ga";

type CliOptions = {
  ticks: number;
  generations: number;
  pop: number;
};

async function main(): Promise<void> {
  const [command, ...flags] = process.argv.slice(2);
  const options = parseOptions(flags);

  switch (command as Command) {
    case "demo":
      runDemo();
      return;
    case "sim":
      await runSim(options.ticks);
      return;
    case "ga":
      console.log("Top GA candidates:", await runGA(options.generations, options.pop));
      return;
    default:
      printHelp();
      process.exitCode = 1;
  }
}

function runDemo(): void {
  const registry = new PrimePowerRegistry(["CREATE", "SETTLE", "DISPUTE", "CHALLENGE", "RELAYER"]);
  const product = registry.encodeCapabilities(["CREATE", "SETTLE"]);
  const signer = "deadc0de";
  const token = createAgentToken("did:tron:alpha-origin", product, 3600, signer);

  console.log("Commitment", token.commitment);
  console.log("Registered caps:", registry.listRegistered());
  console.log("In-memory checks: CREATE:", registry.hasCapability(product, "CREATE"));
}

function parseOptions(flags: string[]): CliOptions {
  const options: CliOptions = { ticks: 200, generations: 5, pop: 10 };

  for (const flag of flags) {
    const [name, rawValue] = flag.split("=");
    if (!rawValue) continue;
    const value = Number(rawValue);
    if (Number.isNaN(value)) continue;

    if (name === "--ticks") options.ticks = value;
    if (name === "--generations") options.generations = value;
    if (name === "--pop") options.pop = value;
  }

  return options;
}

function printHelp(): void {
  console.log(`Usage:
  npm run demo
  npm run sim-short
  npm run ga-short
  ts-node src/cli.ts demo
  ts-node src/cli.ts sim --ticks=200
  ts-node src/cli.ts ga --generations=5 --pop=10`);
}

void main();
