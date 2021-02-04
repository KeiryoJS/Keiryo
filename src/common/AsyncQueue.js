/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

export class AsyncQueue {
  constructor() {
    /**
     * The promises in this queue.
     * @type {DeferredPromise[]}
     * @private
     */
    this._lock = [];
  }

  /**
   * The remaining promises that are in the queue.
   * @type {number}
   */
  get remaining() {
    return this._lock.length;
  }

  /**
   * Waits for the last promise to resolve and queues a new one.
   * @returns {Promise<void>}
   */
  wait() {
    const next = this.remaining
      ? this._lock[this.remaining - 1].promise
      : Promise.resolve();

    this.enqueue();
    return next;
  }

  /**
   * Enqueues a new promise.
   */
  enqueue() {
    let resolve;
    const promise = new Promise((res) => {
      resolve = res;
    });

    this._lock.push({ promise, resolve });
  }

  /**
   * Frees the queue's lock so the next promise can resolve.
   * @returns {void}
   */
  next() {
    const next = this._lock.shift();
    if (typeof next !== "undefined") {
      next.resolve();
    }
  }
}