import type { Job } from "./Job";
import type { DiscordStructure } from "../../../util";
import type { Client } from "../../Client";

export class Janitor {
  /**
   * The engine this janitor belongs to.
   * @type {CachingManager}
   */
  public readonly client: Client;

  /**
   * The jobs that janitor has.
   * @type {Map<DiscordStructure | string, Job>}
   */
  public readonly jobs: Map<DiscordStructure | string, Job>;

  /**
   * @param {Client} client The engine this janitor belongs to.
   * @param {JanitorJobs} jobs The jobs that this janitor has.
   */
  public constructor(client: Client, jobs?: JanitorJobs) {
    this.client = client;
    this.jobs = new Map();

    if (jobs) {
      for (const [ s, j ] of Object.entries(jobs)) {
        if (this.jobs.has(s)) continue;

        try {
          // @ts-expect-error
          this.jobs.set(s, new j(this));
        } catch (e) {
          this.client.emit("error", e);
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
        job.start();
      } catch (e) {
        this.client.emit("error", e);
      }
    }
  }
}

export type JanitorJobs = Partial<Record<DiscordStructure | string, typeof Job>>;
