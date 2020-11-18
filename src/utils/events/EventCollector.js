/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Timers } from "@neocord/utils";
import { Emitter } from "./Emitter";

export class EventCollector extends Emitter {
  /**
   * @param {Emitter} emitter The emitter to use for collection.
   * @param {string} event The event to collect.
   * @param {EventCollectorOptions} [options] The options.
   */
  constructor(emitter, event, options = {}) {
    super();

    /**
     * The emitter to use for collection.
     * @type {Emitter}
     */
    this.emitter = emitter;

    /**
     * The amount of time allowed between each emission.
     * @type {number}
     */
    this.idle = options.idle;

    /**
     * The total amount of time until the collector stops.
     * @type {number}
     */
    this.time = options.time ?? 15000;

    /**
     * The number of emissions to accept.
     * @type {number}
     */
    this.limit = options.limit ?? 1;

    /**
     * The event to collect.
     * @type {string}
     */
    this.event = event;

    /**
     * All of received emissions.
     * @type {*[]}
     * @protected
     */
    this._received = [];
    this._receive = this._receive.bind(this);
  }

  /**
   * Starts the collection process.
   */
  collect() {
    /**
     * Emitted whenever the collection cycle has started.
     * @event EventCollector#start
     */
    this.emit("start");

    return new Promise(res => {
      this.emitter.on(this.event, this._receive);

      /**
       * The end method.
       * @type {Function}
       * @protected
       */
      this._end = res;

      /**
       * The collection timeout.
       * @type {NodeJS.Timeout}
       * @protected
       */
      this._collection = Timers.setTimeout(() => this.end(), this.time);
    });
  }

  /**
   * Ends the collection cycle.
   * @param {boolean} [cleanup=true] Whether to cleanup the collector.
   */
  end(cleanup = true) {
    if (cleanup) {
      this._cleanup();
      this._removeExcess();
    }

    this._end(this._received);

    /**
     * Emitted whenever the collection cycle has ended.
     * @event EventCollector#start
     * @param {*[]} data The event data that was collected.
     */
    this.emit("end", this._received);
  }

  /**
   * Handles an emission.
   * @param {...*} args The event data.
   * @protected
   */
  _receive(...args) {
    /**
     * Emitted whenever something is collected.
     * @event EventCollector#emission
     * @param {...*} data The event data.
     */
    this.emit("emission", ...args);

    this._received.push(args);
    if (this._checkLimit()) {
      return;
    }

    this._checkIdle();
  }

  /**
   * Checks the emission limit.
   * @return {boolean}
   * @protected
   */
  _checkLimit() {
    if (this._received.length >= this.limit) {
      this.end()
      return true;
    }

    return false;
  }

  /**
   * Checks the idle timeout.
   * @protected
   */
  _checkIdle() {
    if (this.idle) {
      this._cleanup({ idle: true });

      /**
       * The idle timeout.
       * @type {NodeJS.Timeout}
       * @protected
       */
      this._idle = Timers.setTimeout(() => this.end(), this.idle);
    }
  }

  /**
   * Removes any excess emissions that may have been received.
   * @return {boolean} Whether any excess emissions were present.
   * @protected
   */
  _removeExcess() {
    if (this._received.length > this.limit) {
      while (this._received.length > this.limit) {
        this._received.pop();
      }

      return true;
    }

    return false;
  }

  /**
   * Cleans up the collector.
   * @param {Object} props The properties to clean up.
   * @protected
   */
  _cleanup(props = { idle: true, collection: true, listener: true }) {
    if (props.idle && this._idle) {
      Timers.clearTimeout(this._idle);
      delete this._idle;
    }

    if (props.collection && this._collection) {
      Timers.clearTimeout(this._collection);
      delete this._collection;
    }

    if (props.listener) {
      this.emitter.removeListener(this.event, this._receive);
    }
  }
}

/**
 * @typedef {Object} EventCollectorOptions
 * @prop {number} [limit] The number of emissions to accept.
 * @prop {number} [idle] The amount of time allowed between each emission.
 * @prop {number} [time] The total amount of time until the collector stops.
 */
