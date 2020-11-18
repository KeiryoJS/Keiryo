/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

const EVENTS = Symbol("EmitterEvents");

export class Emitter {
  /**
   * All registered events.
   * @type {Record<string, Function[]>}
   */
  [EVENTS] = {};

  /**
   * Registers a listener for an event or multiple events.
   * @param {string | string[]} event The event(s).
   * @param {Function} listener The event listener.
   * @return {this}
   */
  on(event, listener) {
    Array.isArray(event)
      ? event.forEach(evt => this.addListener(evt, listener))
      : this.addListener(event, listener);

    return this;
  }

  /**
   * Removes a listener from multiple or a single event.
   * @param {string | string[]} event The event(s).
   * @param {Function} listener The listener to remove.
   * @return {boolean} Whether the listener was removed.
   */
  off(event, listener) {
    return Array.isArray(event)
      ? event.reduce((_, e) => this.removeListener(e, listener), true)
      : this.removeListener(event, listener);
  }

  /**
   * Adds a listener to this emitter then removes it when an event is emitted.
   * @param {string | string[]} event The event(s).
   * @param {Function} listener The listener.
   * @return {Emitter}
   */
  once(event, listener) {
    const _once = (event) => {
      const _listener = (...args) => {
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
   * @param {string} event The event.
   * @param {Function} listener The event listener.
   */
  addListener(event, listener) {
    let listeners = this.getListeners(event);
    listeners.push(listener);
    this[EVENTS][event] = listeners;
  }

  /**
   * Removes a listener from an event.
   * @param {string} event The event.
   * @param {Function} listener The listener to remove.
   * @return {boolean} Whether the listener was actually removed.
   */
  removeListener(event, listener) {
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
   * @param {...*} args The event data.
   * @return {number}
   */
  emit(event, ...args) {
    let listeners = Array.isArray(event)
      ? event.reduce((l, e) => [ ...this.getListeners(e), ...l ], [])
      : this.getListeners(event);

    if (!listeners?.length) {
      return 0;
    }

    let count = 0;
    for (const listener of listeners) {
      listener(...args);
      count++;
    }

    return count;
  }

  /**
   * Get all listeners for an event.
   * @param {string} event
   * @return {Function[]}
   */
  getListeners(event) {
    return this[EVENTS][event] ?? [];
  }

  /**
   * Get the total listener count of this emitter or of a single event.
   * @param {string} [event] The event.
   * @returns {number} The amount of listeners for the event or all listeners.
   */
  listenerCount(event) {
    if (event) {
      event = event.toString();
      return this[EVENTS][event]
        ? this[EVENTS][event].size
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
   * @param event
   * @return {boolean}
   */
  removeListeners(event) {
    if (event) {
      if (!this.listenerCount(event)) {
        return;
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
  }

  /**
   * Collect event emissions.
   * @param {string} event
   * @param {EventCollectorOptions} [options]
   */
  collect(event, options) {
    return new (require("./EventCollector").EventCollector)(this, event, options).collect();
  }

  /**
   * Runs a function everytime an event is emitted.
   * @param {string} [event] The event.
   * @param {Function | EventCollectorOptions} optionsOrCallback The collector options or the callback.
   * @param {Function} [callback] The callback.
   * @return {Promise<void>}
   */
  forEach(event, optionsOrCallback, callback) {
    if (typeof optionsOrCallback === "function") {
      callback = optionsOrCallback;
      optionsOrCallback = {};
    }

    return new Promise(res => {
      const collector = new (require("./EventCollector").EventCollector)(this, event, optionsOrCallback)
        .on("emission", (...args) => callback(...args));

      collector.collect().then(() => res());
    });
  }
}
