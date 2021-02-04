/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

const INTERVALS = Symbol.for("TimerIntervals");
const TIMEOUTS = Symbol.for("TimerTimeouts");

export class Timers {
  /**
   * Current intervals.
   * @type {Set<NodeJS.Timeout>}
   */
  static [INTERVALS] = new Set();

  /**
   * Current timeouts.
   * @type {Set<NodeJS.Timeout>}
   */
  static [TIMEOUTS] = new Set();

  /**
   * Clears all of the current intervals and timeouts.
   */
  static clear() {
    for (const i of Timers[INTERVALS]) {
      void this.clearInterval(i);
    }
    for (const i of Timers[TIMEOUTS]) {
      void this.clearTimeout(i);
    }
  }

  /**
   * Sets a timeout.
   * @param {Function} func The function to execute.
   * @param {number} delay Time to wait before executing.
   * @param {...*} args The arguments for the function.
   * @return {NodeJS.Timeout}
   */
  static setTimeout(func, delay, ...args) {
    const timeout = setTimeout(() => {
      func(...args);
      Timers[TIMEOUTS].delete(timeout);
    }, delay);

    Timers[TIMEOUTS].add(timeout);
    return timeout;
  }

  /**
   * Clears a timeout.
   * @param {NodeJS.Timeout} timeout The timeout to clear.
   */
  static clearTimeout(timeout) {
    clearTimeout(timeout);
    Timers[INTERVALS].delete(timeout);
  }

  /**
   * Sets an interval.
   * @param {Function} func The function to execute.
   * @param {number} delay The time to wait between each execution.
   * @param {...*} args The arguments for the function.
   *
   * @return {NodeJS.Timeout}
   */
  static setInterval(func, delay, ...args) {
    const interval = setInterval(func, delay, ...args);
    Timers[INTERVALS].add(interval);
    return interval;
  }

  /**
   * Clears an interval.
   * @param {NodeJS.Timeout} interval The interval to clear.
   */
  static clearInterval(interval) {
    clearInterval(interval);
    Timers[INTERVALS].delete(interval);
  }
}
