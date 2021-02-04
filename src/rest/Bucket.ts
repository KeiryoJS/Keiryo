/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { AsyncQueue, sleep } from "../common";

import type { Response } from "node-fetch";

export class Bucket {
  /**
   * The global rate-limit promise.
   * @private
   */
  static GLOBAL_RATE_LIMIT: Promise<void> | null = null;

  /**
   * The route identifier.
   */
  readonly route: string;

  /**
   * The number of remaining requests that we can make.
   */
  remaining: number = 1;

  /**
   * The timestamp in which this rate-limit will reset.
   */
  resetTimestamp: number = -1;

  /**
   * The locking queue.
   */
  lock = new AsyncQueue();

  /**
   * @param route The route identifier.
   */
  constructor(route: string) {
    this.route = route;
  }


  /**
   * Used for getting the time offset of the discord api.
   *
   * @param serverDate The server date.
   *
   * @return {number}
   */
  static getAPIOffset(serverDate: string): number {
    return new Date(serverDate).getTime() - Date.now();
  }

  /**
   * Whether this bucket has been rate-limited.
   */
  get rateLimited(): boolean {
    return this.remaining < 0 && this.resetTimestamp > Date.now();
  }

  /**
   * The number of milliseconds until our rate-limit gets reset.
   */
  get untilReset() {
    return this.resetTimestamp < 0
      ? 0
      : this.resetTimestamp - Date.now();
  }

  /**
   * Basic information about this bucket.
   */
  get info() {
    return {
      remaining: this.remaining,
      resetTimestamp: this.resetTimestamp
    };
  }

  /**
   * Handles a node-fetch response.
   * @param {Response} res The node-fetch response.
   */
  async handle(res: Response) {
    const _serverDate = res.headers.get("date")!,
      _remaining = res.headers.get("x-ratelimit-remaining"),
      _reset = res.headers.get("x-ratelimit-reset"),
      _cf = res.headers.get("via");

    let _retryAfter = +res.headers.get("retry-after")!;
    if (_retryAfter && (typeof _cf !== "string" || !_cf.includes("1.1 google"))) {
      _retryAfter *= 1000;
    }

    this.remaining = +_remaining! ?? 1;
    this.resetTimestamp = _reset
      ? new Date(+_reset * 1000).getTime() - Bucket.getAPIOffset(_serverDate)
      : Date.now();

    // https://github.com/discord/discord-api-docs/issues/182
    if (this.route.includes("reactions")) {
      this.resetTimestamp = new Date(_serverDate).getTime() - Bucket.getAPIOffset(_serverDate) + 250;
    }

    if (res.headers.has("x-ratelimit-global")) {
      Bucket.GLOBAL_RATE_LIMIT = sleep(_retryAfter).then(() => {
        Bucket.GLOBAL_RATE_LIMIT = null;
      });

      await Bucket.GLOBAL_RATE_LIMIT;
    }
  }
}
