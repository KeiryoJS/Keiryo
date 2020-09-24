import type { MemoryEngine } from "../MemoryEngine";
import type { Job } from "./Job";
import type { DiscordStructure } from "../../../util";

export class Janitor {
  /**
   * The engine this janitor belongs to.
   * @type {MemoryEngine}
   */
  public readonly engine: MemoryEngine;

  /**
   * The jobs that janitor has.
   * @type {Map<DiscordStructure, Job>}
   */
  public readonly jobs: Map<DiscordStructure, Job>;

  /**
   * @param {MemoryEngine} engine The engine this janitor belongs to.
   * @param {JanitorJobs} jobs The jobs that this janitor has.
   */
  public constructor(engine: MemoryEngine, jobs?: JanitorJobs) {
    this.engine = engine;
    this.jobs = new Map();

    if (jobs) {
      if (jobs instanceof Map) this.jobs = jobs;
      else {
        for (const [s, j] of Object.entries(jobs)) {
          // @ts-expect-error
          this.jobs.set(s, j);
        }
      }
    }
  }

  /**
   * Starts the janitor.
   */
  public start(): void {
    for (const job of this.jobs.values()) {
      try {
        job.start(this.engine);
      } catch (e) {
        this.engine.emit("error", e);
      }
    }
  }
}

export type JanitorJobs =
  | Map<DiscordStructure, Job>
  | Partial<Record<DiscordStructure, Job>>;
