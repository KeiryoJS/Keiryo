import { Duration, Timers } from "@neocord/utils";

export abstract class Job<O extends JobOptions = JobOptions> {
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
   * The current shift of this job.
   * @type {?CurrentShift}
   */
  public shift?: CurrentShift;

  /**
   * The options provided to this job.
   * @type {JobOptions}
   */
  protected _options: O;

  /**
   * The timeout of this job.
   * @type {NodeJS.Timeout}
   * @private
   */
  private _timeout?: NodeJS.Timeout;

  /**
   * @param {string} name The name of this job.
   * @param {JobOptions} options Options for the job.
   */
  public constructor(name: string, options: O) {
    this.name = name;
    this.interval =
      typeof options.interval === "string"
        ? Duration.parse(options.interval)
        : options.interval;
    this._options = options;
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
        this._timeout?.unref();
        try {
          await this.do(
            {
              startedAt: shift.startedAt,
              id: shift.id,
            },
            ...args
          );

          this._timeout?.refresh();
          res();
        } catch (e) {
          this._timeout?.refresh();
          rej(e);
        }
      });

      this.shift = shift;
    };

    this._timeout = Timers.setTimeout(() => work(), this.interval);
  }

  /**
   * Quits the job (waits for the current shift to end and
   */
  public async quit(): Promise<void> {
    if (this.shift) {
      await this.shift.promise;
      delete this.shift;
    }

    if (this._timeout) {
      Timers.clearInterval(this._timeout);
      delete this._timeout;
    }
  }

  /**
   * Doe the job.
   * @returns {number}
   */
  public abstract do(
    shift: Omit<CurrentShift, "promise">,
    ...args: unknown[]
  ): Promise<unknown>;
}

export interface JobOptions {
  interval: string | number;
}

export interface CurrentShift {
  startedAt: number;
  id: number;
  promise: Promise<unknown>;
}
