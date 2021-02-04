/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import type { Shard } from "../shard/Shard";
import type { ShardManager } from "../ShardManager";
import { sleep } from "../../common";

export abstract class ConnectQueue {
  /**
   * The shard manager.
   */
  readonly manager: ShardManager;

  /**
   * @param manager The shard manager.
   */
  protected constructor(manager: ShardManager) {
    this.manager = manager;
  }

  /**
   * Adds a shard to the connect queue.
   * @param shard The shard to add.
   */
  abstract add(shard: Shard): any;

  /**
   * Connects all shards within the queue.
   */
  abstract connect(): Promise<void>;

  /**
   * Handles the session start limit.
   * @private
   */
  protected async _handleSessionLimit() {
    const { session_start_limit: limit } = await this.manager.fetchGateway();

    if (!limit.remaining) {
      this._debug(`exceeded total identifies, sleeping for ${limit.reset_after}ms.`);
      await sleep(limit.reset_after);
    } else {
      this._debug(`${limit.remaining} remaining identifies.`);
    }
  }

  /**
   * Used for general debugging.
   * @param message The debug message.
   */
  protected _debug(message: string) {
    this.manager._debug(`connect-queue: ${message.trim()}`);
  }
}