declare const process: {
  argv: string[];
  env: Record<string, string | undefined>;
  exit(code?: number): never;
  exitCode?: number;
};

declare const Buffer: {
  from(input: string, encoding?: string): unknown;
};

declare function setTimeout(handler: (...args: unknown[]) => void, timeout?: number): unknown;

declare module "events" {
  class EventEmitter {
    on(event: string, listener: (...args: any[]) => void): this;
    emit(event: string, ...args: any[]): boolean;
  }

  export { EventEmitter };
  export default EventEmitter;
}

declare module "crypto" {
  const crypto: any;
  export = crypto;
}

declare module "fs" {
  const fs: any;
  export = fs;
}

declare module "tronweb" {
  const TronWeb: any;
  export default TronWeb;
}
