/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import WebSocket from "ws";

import { Decompressor } from "./decompressor";
import { Serialization } from "./serialization";

import { SessionManager } from "./SessionManager";
import { Heartbeater } from "./Heartbeater";

import { GatewayCloseCode, GatewayOp, Status } from "../constants";
import { Bucket } from "../../common";

export class WorkerShard {
  /**
   * @param {MessagePort} parentPort The parent port.
   * @param {WorkerShardOptions} options The worker shard data.
   */
  constructor(parentPort, options) {
    /**
     * The parent port.
     * @type {MessagePort}
     * @readonly
     */
    this._parentPort = parentPort;

    /**
     * The options given to this worker by the main thread.
     * @type {WorkerShardOptions}
     * @readonly
     */
    this._options = options;

    /**
     * The serialization helper for this worker-shard.
     * @type {Serialization}
     * @readonly
     */
    this._serialization = Serialization.create(options.encoding);

    /**
     * The payload queue.
     * @type {{ prioritized: boolean, payload: DiscordPayload }[]}
     * @private
     */
    this._queue = [];

    /**
     * The payload queue.
     * @type {Bucket}
     */
    this._bucket = new Bucket(120, 6e4, { reservedTokens: 5 });

    /**
     * The presence bucket... because discord wants to make status changes less frequent.
     * @type {Bucket}
     */
    this._presenceBucket = new Bucket(5, 6e4);

    /**
     * The session manager for this worker-shard.
     * @type {SessionManager}
     * @readonly
     */
    this._session = new SessionManager(this);

    /**
     * The heart-beater for this worker-shard.
     * @type {Heartbeater}
     * @readonly
     */
    this._heartbeater = new Heartbeater(this);

    if (options.decompressionMethod) {
      /**
       * The decompressor for this worker shard.
       * @type {Decompressor}
       * @readonly
       */
      this._decompressor = Decompressor.create(options.decompressionMethod, {
        debug: data => this.dispatch("DEBUG", data),
        error: data => this.dispatch("ERROR", data),
        data: decompressed => this._onPayload(decompressed)
      });
    }

    parentPort.onmessage = this._dispatched.bind(this);
  }

  /**
   * The ID of this shard.
   * @returns {number}
   */
  get id() {
    return +this._options.id;
  }

  /**
   * Whether the websocket is connected.
   * @returns {boolean}
   */
  get connected() {
    return !!this._ws && this._ws.readyState === WebSocket.OPEN;
  }

  /**
   * Connects to the discord gateway websocket.
   */
  connect() {
    const q = new URLSearchParams({
      v: this._options.gatewayVersion,
      encoding: this._options.encoding
    });

    if (this._decompressor) {
      q.append("compress", "zlib-stream");
    }

    /**
     * The websocket connection.
     * @type {WebSocket}
     * @private
     */
    this._ws = new WebSocket(`${this._options.gatewayUrl}/?${q}`);

    this._ws.onopen = this._onOpen.bind(this);
    this._ws.onclose = this._onClose.bind(this);
    this._ws.onerror = this._onError.bind(this);
    this._ws.onmessage = this._onMessage.bind(this);
  }

  /**
   * Send a payload to the gateway.
   */
  sendPayload(payload, prioritized) {
    if (this.connected) {
      const presence = payload.op === GatewayOp.PRESENCE_UPDATE,
        send = () => {
          if (presence) {
            return;
          }

          this._ws.send(this._serialization.encode(payload));
        };

      if (presence) {
        this._presenceBucket.queue(send, prioritized);
      }

      return this._bucket.queue(send, prioritized);
    }

    this._queue.push({ payload, prioritized });
  }

  /**
   * Dispatches a message to the main thread.
   * @param {WorkerShardMessageType} type The type of message we are dispatching.
   * @param {any} data The data to dispatch.
   */
  dispatch(type, data) {
    this._parentPort.postMessage({ type, data });
  }

  /**
   * Called whenever the websocket opens.
   * @private
   */
  _onOpen() {
    this._debug("websocket connection opened.");
    while (this._queue.length) {
      const next = this._queue.shift();
      if (next) {
        this.sendPayload(next.payload, next.prioritized);
      }
    }
  }

  /**
   * Called whenever the websocket connection closes.
   * @param {WebSocket.CloseEvent} event The close event.
   * @private
   */
  _onClose(event) {
    const reason = (event.reason || GatewayCloseCode[event.code]) ?? "unknown";

    this.dispatch("DEBUG", `ws closed, code = ${event.code}, clean = ${event.wasClean}, reason = ${reason}`);
    this.dispatch("UPDATE_STATUS", Status.DISCONNECTED);

    if (this._seq !== -1) {
      /**
       * The last sequence before the websocket closed.
       * @type {number}
       */
      this._closingSeq = this._seq;
    }

    this._seq = -1;
    this._heartbeater.reset();
    this._ws = null;
  }

  /**
   * Called whenever the websocket encounters an error.
   * @param {WebSocket.ErrorEvent} event
   * @private
   */
  _onError(event) {
    const error = event.error ? event.error : event.message;
    if (error) {
      this.dispatch("ERROR", error);
    }
  }

  /**
   * Called whenever the websocket receives a message.
   * @param {WebSocket.MessageEvent} event
   * @private
   */
  _onMessage({ data }) {
    return this._decompressor
      ? this._decompressor.add(data)
      : this._onPayload(data);
  }

  /**
   * Handles decompressed data.
   * @param {EncodedData} data The decompressed data.
   * @private
   */
  _onPayload(data) {
    let payload;
    try {
      payload = this._serialization.decode(data);
      this.dispatch("RECEIVED_PAYLOAD", payload);
    } catch (e) {
      this.dispatch("ERROR", e);
      return;
    }

    if (payload.s !== null) {
      if (this._seq !== -1 && payload.s > this._seq + 1) {
        this.dispatch("DEBUG", `nonconsecutive sequence, ${this._seq} => ${payload.s}`);
      }

      this._seq = payload.s;
    }

    switch (payload.t) {
      case "READY":
        // Declare session id.
        this._session.id = payload.d.id;

        // Update Status.
        this.dispatch("UPDATE_STATUS", Status.READY);

        // Ready Heartbeat.
        this._heartbeater.acked = true;
        this._heartbeater.new`ready`;

        break;
      case "RESUMED":
        // Update Status.
        this.dispatch("UPDATE_STATUS", Status.READY);

        // Resumed Heartbeat.
        this._heartbeater.acked = true;
        this._heartbeater.new`resumed`;

        break;
    }

    switch (payload.op) {
      case GatewayOp.HELLO:
        this._heartbeater.delay = payload.d.heartbeat_interval;
        this._session.identify()

        break;
      case GatewayOp.RECONNECT:
        // queue reconnect.

        break;
      case GatewayOp.INVALID_SESSION:
        this._debug(`invalid session, resumable = ${payload.d}`);
        if (payload.d) {
          this._session.resume();
          break;
        }

        this._seq = -1;
        this._session.reset();

        this.dispatch("UPDATE_STATUS", Status.RECONNECTING);

        break;
      case GatewayOp.HEARTBEAT:
        this._heartbeater.new("requested");

        break;
      case GatewayOp.HEARTBEAT_ACK:
        this._heartbeater.ack();

        break;
    }
  }

  /**
   * Called whenever the main thread dispatches a message to this worker thread.
   * @param {WorkerShardMessage} data The dispatched message.
   * @private
   */
  _dispatched({ data }) {
    switch (data.type) {
      case "CONNECT":
        this.connect();
        break
    }
  }

  /**
   * Used for general debugging purposes.
   * @param {string} message The debug message.
   * @private
   */
  _debug(message) {
    return this.dispatch("DEBUG", message);
  }
}

/**
 * @typedef {Object} DiscordProperties
 * @property {string} $device The library name.
 * @property {string} $browser The library name.
 * @property {string} $os The OS.
 */

/**
 * @typedef {Object} WorkerShardOptions
 * @property {string} gatewayUrl
 * @property {GatewayVersion} gatewayVersion The encoding to use.
 * @property {DecompressionMethod} decompressionMethod The compression to use.
 * @property {EncodingType} encoding The encoding to use.
 * @property {string} token The token to use when identifying.
 * @property {number} intents The intents to use.
 * @property {DiscordProperties} properties The properties to use when identifying.
 * @property {number} totalShards The total number of shards.
 */
