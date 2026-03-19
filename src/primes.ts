// src/primes.ts
// PrimePowerRegistry uses exponent 3 for each capability: product = ∏ p^3
// WARNING: product factorization is easy; do NOT persist raw product publicly.

export type Capability = string;

const BASE_PRIMES: bigint[] = [
  3n,5n,7n,11n,13n,17n,19n,23n,29n,31n,37n,41n,43n,47n,53n,59n,61n,67n,71n,73n
];

export class PrimePowerRegistry {
  private capToPrime = new Map<Capability, bigint>();
  private primeToCap = new Map<bigint, Capability>();
  private nextIndex = 0;

  constructor(initial?: Capability[]) {
    if (initial) for (const c of initial) this.register(c);
  }

  register(cap: Capability): bigint {
    if (this.capToPrime.has(cap)) return this.capToPrime.get(cap)!;
    const p = this.getNextPrime();
    this.capToPrime.set(cap, p);
    this.primeToCap.set(p, cap);
    return p;
  }

  lookupPrime(cap: Capability): bigint | undefined { return this.capToPrime.get(cap); }
  lookupCapability(p: bigint): Capability | undefined { return this.primeToCap.get(p); }

  encodeCapabilities(caps: Capability[]): bigint {
    let prod = 1n;
    for (const c of caps) {
      const p = this.register(c);
      prod *= (p ** 3n);
    }
    return prod;
  }

  // In-memory check only. Do not expose rawProduct externally.
  hasCapability(product: bigint, cap: Capability): boolean {
    const p = this.lookupPrime(cap);
    if (!p) return false;
    const factor = p ** 3n;
    return product % factor === 0n;
  }

  listRegistered(): Capability[] {
    return Array.from(this.capToPrime.keys());
  }

  private getNextPrime(): bigint {
    if (this.nextIndex < BASE_PRIMES.length) {
      return BASE_PRIMES[this.nextIndex++];
    }
    // naive generator for demo; replace with deterministic large primes in prod.
    let candidate = BASE_PRIMES[BASE_PRIMES.length - 1] + BigInt(this.nextIndex*2+1);
    while (!isPrime(candidate)) candidate += 2n;
    this.nextIndex++;
    return candidate;
  }
}

function isPrime(n: bigint): boolean {
  if (n < 2n) return false;
  if (n % 2n === 0n) return n === 2n;
  const lim = BigInt(Math.floor(Math.sqrt(Number(n))));
  for (let i = 3n; i <= lim; i += 2n) if (n % i === 0n) return false;
  return true;
}
