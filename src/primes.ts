// src/primes.ts
// PrimePowerRegistry uses exponent 3 for each capability: product = ∏ p^3
// WARNING: product factorization is easy; do NOT persist raw product publicly.

export type Capability = string;

const BASE_PRIMES: bigint[] = [
  3n, 5n, 7n, 11n, 13n, 17n, 19n, 23n, 29n, 31n, 37n, 41n, 43n, 47n, 53n, 59n, 61n, 67n, 71n, 73n
];

export class PrimePowerRegistry {
  private capToPrime = new Map<Capability, bigint>();
  private primeToCap = new Map<bigint, Capability>();
  private nextIndex = 0;

  constructor(initial?: Capability[]) {
    if (initial) {
      for (const capability of initial) {
        this.register(capability);
      }
    }
  }

  register(cap: Capability): bigint {
    const existing = this.capToPrime.get(cap);
    if (existing) {
      return existing;
    }

    const prime = this.getNextPrime();
    this.capToPrime.set(cap, prime);
    this.primeToCap.set(prime, cap);
    return prime;
  }

  lookupPrime(cap: Capability): bigint | undefined {
    return this.capToPrime.get(cap);
  }

  lookupCapability(prime: bigint): Capability | undefined {
    return this.primeToCap.get(prime);
  }

  encodeCapabilities(caps: Capability[]): bigint {
    let product = 1n;
    for (const capability of uniqueCapabilities(caps)) {
      const prime = this.register(capability);
      product *= prime ** 3n;
    }
    return product;
  }

  decodeCapabilities(product: bigint): Capability[] {
    const capabilities: Capability[] = [];
    for (const [capability, prime] of this.capToPrime.entries()) {
      if (product % (prime ** 3n) === 0n) {
        capabilities.push(capability);
      }
    }
    return capabilities;
  }

  // In-memory check only. Do not expose rawProduct externally.
  hasCapability(product: bigint, cap: Capability): boolean {
    const prime = this.lookupPrime(cap);
    if (!prime) {
      return false;
    }

    return product % (prime ** 3n) === 0n;
  }

  listRegistered(): Capability[] {
    return Array.from(this.capToPrime.keys());
  }

  private getNextPrime(): bigint {
    if (this.nextIndex < BASE_PRIMES.length) {
      return BASE_PRIMES[this.nextIndex++];
    }

    // naive generator for demo; replace with deterministic large primes in prod.
    let candidate = BASE_PRIMES[BASE_PRIMES.length - 1] + BigInt(this.nextIndex * 2 + 1);
    while (!isPrime(candidate)) {
      candidate += 2n;
    }
    this.nextIndex += 1;
    return candidate;
  }
}

function uniqueCapabilities(caps: Capability[]): Capability[] {
  return Array.from(new Set(caps));
}

function isPrime(value: bigint): boolean {
  if (value < 2n) {
    return false;
  }
  if (value % 2n === 0n) {
    return value === 2n;
  }

  const limit = sqrtBigInt(value);
  for (let candidate = 3n; candidate <= limit; candidate += 2n) {
    if (value % candidate === 0n) {
      return false;
    }
  }
  return true;
}

function sqrtBigInt(value: bigint): bigint {
  if (value < 2n) {
    return value;
  }

  let x0 = value;
  let x1 = (value >> 1n) + 1n;
  while (x1 < x0) {
    x0 = x1;
    x1 = ((value / x1) + x1) >> 1n;
  }
  return x0;
}
