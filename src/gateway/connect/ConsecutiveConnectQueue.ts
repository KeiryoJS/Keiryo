import { ConnectQueue } from "./ConnectQueue";
import { sleep } from "../../common";

import type { Shard } from "../shard/Shard";

export class ConsecutiveConnectQueue extends ConnectQueue {
  /**
   * The shard queue.
   * @private
   */
  private _queue = new Set<Shard>();

  /**
   * Adds a shard to the connect queue.
   * @param shard The shard to queue up.
   */
  add(shard: Shard): any {
    if (this._queue.has(shard)) {
      return;
    }

    this._queue.add(shard);
  }

  /**
   * Connects all shards in the queue.
   */
  async connect(): Promise<void> {
    for (const shard of this._queue) {
      await this._handleSessionLimit();
      shard.dispatch("CONNECT");
      await sleep(5000);
    }
  }
}
