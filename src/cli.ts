// src/cli.ts
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { createAgentToken } from "./agentToken";
import { PrimePowerRegistry } from "./primes";
import { runSim } from "./simulator";
import { runGA } from "./ga";

// Simple CLI wrapper for demo actions
const argv = yargs(hideBin(process.argv))
  .command("demo", "run demo token flow", {}, async () => {
    const reg = new PrimePowerRegistry(["CREATE","SETTLE","DISPUTE","CHALLENGE","RELAYER"]);
    const product = reg.encodeCapabilities(["CREATE","SETTLE"]);
    const signer = "deadc0de"; // placeholder hex -> replace with key material / HSM reference
    const token = createAgentToken("did:tron:alpha-origin", product, 3600, signer);
    console.log("Commitment", token.commitment);
    console.log("Registered caps:", reg.listRegistered());
    console.log("In-memory checks: CREATE:", reg.hasCapability(product, "CREATE"));
  })
  .command("sim", "run simulator", (y) => y.option("ticks",{ type: "number", default: 200 }), async (args) => {
    await runSim(args.ticks);
  })
  .command("ga", "run GA", (y) => y.options({ generations: { type: "number", default: 5 }, pop: { type: "number", default: 10 }}), async (args) => {
    const top = await runGA(args.generations, args.pop);
    console.log("Top GA candidates:", top);
  })
  .demandCommand(1)
  .help()
  .argv;
