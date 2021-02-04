import { Collection, sleep } from "../../common";
import { ConnectQueue } from "./ConnectQueue";

import type { ShardManager } from "../ShardManager";
import type { Shard } from "../shard/Shard";

export class ConcurrentConnectQueue extends ConnectQueue {
  /**
   * The total number of identify requests that can be made at once.
   */
  readonly maxConcurrency: number;

  /**
   * The buckets.
   * @private
   */
  private _buckets = new Collection<number, Shard[]>();

  /**
   * @param manager The shard manager.
   * @param maxConcurrency The total number of identify requests that can be made at once.
   */
  constructor(manager: ShardManager, maxConcurrency: number) {
    super(manager);

    this.maxConcurrency = maxConcurrency;
  }

  /**
   * Adds a shard to their respective bucket.
   * @param shard The shard to add.
   */
  add(shard: Shard): any {
    const bucket = this._buckets.ensure(shard.id % this.maxConcurrency, []);
    if (~bucket.indexOf(shard)) {
      return;
    }

    bucket.push(shard);
  }

  /**
   * Connects all buckets.
   */
  async connect() {
    for (const [ id, bucket ] of this._buckets) {
      this._debug(`connecting bucket: ${id}`);
      this._buckets.delete(id);

      for (const shard of bucket) {
        await this._handleSessionLimit();
        shard.dispatch("CONNECT");
      }

      await sleep(5000);
    }
  }
}