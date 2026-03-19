// deploy/tronDeploy.ts
// TronWeb deploy skeleton for Shasta/testnet. DO NOT commit private keys.
// Use multisig / timelock for mainnet.

import TronWeb from "tronweb";
import fs from "fs";
const fullNode = "https://api.shasta.trongrid.io";
const solidityNode = "https://api.shasta.trongrid.io";
const eventServer = "https://api.shasta.trongrid.io";
const privateKey = process.env.TRON_PRIVATE_KEY || ""; // DO NOT set in repo
const tronWeb = new (TronWeb as any)(fullNode, solidityNode, eventServer, privateKey);

async function deployContract(binPath: string, abiPath: string, ctorParams: any[] = []) {
  const bin = fs.readFileSync(binPath).toString();
  const abi = JSON.parse(fs.readFileSync(abiPath).toString());
  const contract = await tronWeb.contract().new({
    abi,
    bytecode: bin,
    feeLimit: 1_000_000_000,
    callValue: 0,
    parameters: ctorParams
  });
  console.log("deployed at", contract.address);
  return contract;
}

(async () => {
  if (!process.env.GOV) {
    console.error("set GOV env variable (governor address)");
    process.exit(1);
  }
  // Example: compile via external solc/TronBox to get .bin/.abi files
  // deploy KingDPoSTron with GOV and kingTermSeconds (e.g., 86400)
  // await deployContract("./contracts/KingDPoSTron.bin", "./contracts/KingDPoSTron.abi", [process.env.GOV, 86400]);
})();
