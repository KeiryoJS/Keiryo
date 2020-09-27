import { Duration, Timers } from "@neocord/utils";

import type { Janitor } from "./Janitor";
import type { Cache } from "../Cache";
import type { Base } from "../../../structures";

export class Job<O extends JobOptions = JobOptions> {
  /**
   * The name of this job.
   * @type {string}
   */
  public readonly name: string;

  /**
   * The interval in which this job runs.
   * @type {number}
   */
  public readonly interval: number;

  /**
   * The janitor instance.
   * @type {Janitor}
   */
  public readonly janitor: Janitor;

  /**
   * The caches this job is for.
   * @type {Set<Cache>}
   */
  public readonly caches: Set<Cache<Base>>;

  /**
   * The current shift of this job.
   * @type {?CurrentShift}
   */
  public shift?: CurrentShift;

  /**
   * The timeout of this job.
   * @type {NodeJS.Timeout}
   * @private
   */
  #timeout?: NodeJS.Timeout;

  /**
   * @param {Janitor} janitor The janitor instance.
   * @param {string} name The name of this job.
   * @param {JobOptions} options Options for the job.
   */
  public constructor(janitor: Janitor, name: string, options: O) {
    this.janitor = janitor;
    this.name = name;
    this.caches = new Set();
    this.interval =
      typeof options.interval === "string"
        ? Duration.parse(options.interval)
        : options.interval;

    this.do = this.do.bind(this);
  }

  /**
   * Initializes this job.
   * @returns {boolean}
   */
  public start(...args: unknown[]): void {
    if (this.interval <= 0) {
      throw new RangeError(
        `Job '${this.name}' has an interval of ${this.interval}`
      );
    }

    const work = () => {
      const shift: CurrentShift = {
        id: (this.shift?.id ?? 0) + 1,
        startedAt: Date.now(),
        promise: Promise.resolve(),
      };

      // eslint-disable-next-line no-async-promise-executor
      shift.promise = new Promise(async (res, rej) => {
        this.#timeout?.unref();
        try {
          await this.do(shift, ...args);

          this.#timeout?.refresh();
          res();
        } catch (e) {
          this.#timeout?.refresh();
          rej(e);
        }
      });

      this.shift = shift;
    };

    this.#timeout = Timers.setTimeout(() => work(), this.interval);
  }

  /**
   * Quits the job (waits for the current shift to end and
   */
  public async quit(): Promise<void> {
    if (this.shift) {
      await this.shift.promise;
      delete this.shift;
    }

    if (this.#timeout) {
      Timers.clearInterval(this.#timeout);
      this.#timeout = undefined;
    }
  }

  /**
   * Doe the job.
   * @returns {*}
   */
  public do(shift: CurrentShift, ...args: unknown[]): any {
    void shift;
    void args;
    throw new Error("Method not implemented.");
  }
}

export interface JobOptions {
  interval: string | number;
}

export interface CurrentShift {
  startedAt: number;
  id: number;
  promise: Promise<unknown>;
}
