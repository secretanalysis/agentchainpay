// src/agent.ts
import EventEmitter from "eventemitter3";

export type Action = { type: string, meta?: any };

export abstract class Agent {
  id: string;
  did: string;
  eventBus: EventEmitter;
  constructor(id: string, did: string, eventBus: EventEmitter) {
    this.id = id;
    this.did = did;
    this.eventBus = eventBus;
  }
  abstract step(state: any): Promise<void>;
}
