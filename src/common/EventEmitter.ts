/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

const EVENTS = Symbol("EmitterEvents");

export class EventEmitter {
  /**
   * All registered events.
   *
   * @type {Record<string, Function[]>}
   */
  [EVENTS]: Record<string, Function[]> = {};

  /**
   * Registers a listener for an event or multiple events.
   *
   * @param {string | string[]} event The event(s).
   * @param {Function} listener The event listener.
   *
   * @return {EventEmitter}
   */
  on(event: string | string[], listener: Function) {
    Array.isArray(event)
      ? event.forEach(evt => this.addListener(evt, listener))
      : this.addListener(event, listener);

    return this;
  }

  /**
   * Removes a listener from multiple or a single event.
   *
   * @param {string | string[]} event The event(s).
   * @param {Function} listener The listener to remove.
   *
   * @return {boolean} Whether the listener was removed.
   */
  off(event: string | string[], listener: Function): boolean {
    return Array.isArray(event)
      ? event.reduce<boolean>((_, e) => this.removeListener(e, listener), true)
      : this.removeListener(event, listener);
  }

  /**
   * Adds a listener to this emitter then removes it when an event is emitted.
   *
   * @param {string | string[]} event The event(s).
   * @param {Function} listener The listener.
   *
   * @return {EventEmitter}
   */
  once(event: string | string[], listener: Function): EventEmitter {
    const _once = (event: string) => {
      const _listener = (...args: any[]) => {
        listener(...args);
        this.removeListener(event, _listener);
      };

      this.addListener(event, _listener);
    };

    Array.isArray(event)
      ? event.forEach(evt => _once(evt))
      : _once(event);

    return this;
  }

  /**
   * Adds a listener to the provided event.
   *
   * @param {string} event The event.
   * @param {Function} listener The event listener.
   */
  addListener(event: string, listener: Function) {
    let listeners = this.getListeners(event);
    listeners.push(listener);
    this[EVENTS][event] = listeners;
  }

  /**
   * Removes a listener from an event.
   *
   * @param {string} event The event.
   * @param {Function} listener The listener to remove.
   *
   * @return {boolean} Whether the listener was actually removed.
   */
  removeListener(event: string, listener: Function): boolean {
    const listeners = this[EVENTS][event];
    if (!listeners?.length) {
      return false;
    }

    const i = listeners.findIndex(f => f === listener);
    if (i === -1) {
      return false;
    }

    listeners.splice(i, 1);
    if (!listener.length) {
      delete this[EVENTS][event];
    }

    return true;
  }

  /**
   * Emits an event.
   * @param {string | string[]} event The event to emit.
   * @param {...any} args The event data.
   * @return {number}
   */
  emit(event: string | string[], ...args: any[]) {
    let listeners = Array.isArray(event)
      ? event.reduce((l, e) => [ ...this.getListeners(e), ...l ], [] as Function[])
      : this.getListeners(event);

    if (!listeners?.length) {
      return 0;
    }

    let count = 0;
    for (const listener of listeners) {
      try {
        listener(...args);
        count++;
      } catch (e) {
        if (this.listenerCount("error")) {
          this.emit("error", `Error while emitting event ${event}\n${e}`);
        } else {
          throw e;
        }
      }
    }

    return count;
  }

  /**
   * Get all listeners for an event.
   * @param {string} event
   * @return {Function[]}
   */
  getListeners(event: string): Function[] {
    return this[EVENTS][event] ?? [];
  }

  /**
   * Get the total listener count of this emitter or of a single event.
   * @param {string} [event] The event.
   * @returns {number} The amount of listeners for the event or all listeners.
   */
  listenerCount(event: string): number {
    if (event) {
      event = event.toString();
      return this[EVENTS][event]
        ? this[EVENTS][event].length
        : 0;
    }

    let count = 0;
    for (const l of Object.values(this[EVENTS])) {
      count += l.length;
    }

    return count;
  }

  /**
   * Removes all listeners from the
   * @param {string} event Name of the event to clear.
   * @return {boolean}
   */
  removeListeners(event: string): boolean {
    if (event) {
      if (!this.listenerCount(event)) {
        return false;
      }

      const listeners = this[EVENTS][event];
      for (const listener of listeners) {
        this.removeListener(event, listener);
      }

      return delete this[EVENTS][event];
    }

    for (const evt of Object.keys(this[EVENTS])) {
      this.removeListeners(evt);
    }

    return true;
  }
}
