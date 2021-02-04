/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { join } from "path";
import { Worker } from "worker_threads";

import { ShardManagerEvent, Status } from "../constants";

import type { ShardManager } from "../ShardManager";

export class Shard {
  /**
   * The path used when creating a worker thread.
   * @type {string}
   */
  static WORKER_PATH = join(__dirname, "Worker.js");

  /**
   * The ID of this shard.
   */
  readonly id: number;

  /**
   * The shard manager.
   */
  readonly manager: ShardManager;

  /**
   * The status of this shard.
   */
  status: Status;

  /**
   * The latency of this shard.
   */
  latency: number;

  /**
   * The worker thread.
   * @private
   */
  private _worker!: Worker;

  /**
   * @param manager The shard manager.
   * @param id The ID of this shard.
   */
  constructor(manager: ShardManager, id: number) {
    this.id = id;
    this.manager = manager;
    this.status = Status.IDLE;
    this.latency = 0;
  }

  /**
   * Dispatches a command to the gateway.
   * @param {DiscordPayload} payload The payload to send.
   */
  sendCommand(payload: DiscordPayload) {
    this.dispatch("DISPATCH_COMMAND", payload);
  }

  /**
   * Dispatches a message to the worker thread.
   * @param {WorkerShardMessageType} type The type of message to dispatch.
   * @param {any} data The message to post.
   */
  dispatch(type: WorkerShardMessageType, data?: any) {
    if (this._worker) {
      this._debug(`master -> worker "${type}"`);
      this._worker.postMessage({ type, data });
    }
  }

  /**
   * Starts the worker thread for this shard.
   * @returns {Shard}
   */
  init(token: string) {
    this._worker = new Worker(Shard.WORKER_PATH, {
      workerData: {
        id: this.id,
        gatewayUrl: this.manager.gatewayUrl,
        gatewayVersion: this.manager.options.gatewayVersion,

        decompressionMethod: this.manager.compression,
        encoding: this.manager.encoding,

        token,
        properties: this.manager.options.properties,
        intents: this.manager.intents.bitmask,
        totalShards: this.manager.shardCount
      }
    });

    this._worker.on("online", this._online.bind(this));
    this._worker.on("error", this._error.bind(this));
    this._worker.on("exit", this._exit.bind(this));
    this._worker.on("message", this._message.bind(this));

    return this;
  }

  /**
   * Called whenever the worker thread becomes online.
   * @private
   */
  _online() {
    this._debug(`worker thread online, thread id = ${this._worker.threadId}`);
  }

  /**
   * Called whenever the worker thread encounters an error.
   * @param error The encountered error.
   * @private
   */
  _error(error: Error) {
    this.manager.emit(ShardManagerEvent.SHARD_ERROR, error, this);
  }

  /**
   * Called whenever the worker thread exists.
   * @param code The exit code.
   * @private
   */
  _exit(code: number) {
    this._debug(`worker thread exited with code: ${code}`);
  }

  /**
   * Called whenever the worker thread sends a message.
   * @param message The received message.
   * @private
   */
  _message(message: WorkerShardMessage) {
    // this._debug(`worker -> master "${message.type}"`)
    switch (message.type) {
      case "DEBUG":
        this._debug(message.data);
        break;
      case "ERROR":
        this.manager.emit(ShardManagerEvent.SHARD_ERROR, message.data, this);
        break;
      case "RECEIVED_PAYLOAD":
        this.manager.handlePayload(message.data, this);
        break;
      case "UPDATE_LATENCY":
        this.latency = message.data;
        break;
      case "UPDATE_STATUS":
        if (message.data === Status.READY) {
          this.manager.shards.set(this.id, this);
          this.manager._checkShards();
        }

        this.status = message.data;
        break;
    }
  }

  /**
   * Used for debugging this shard..
   * @param message The debug message.
   * @private
   */
  _debug(message: string) {
    this.manager._debug(message, this.id);
  }
}

/**
 * @typedef {string} WorkerShardMessageType
 */
export type WorkerShardMessageType =
  "RECEIVED_PAYLOAD"
  | "DISPATCH_COMMAND"
  | "UPDATE_LATENCY"
  | "UPDATE_STATUS"
  | "DEBUG"
  | "ERROR"
  | "CONNECT"
  | "RECONNECT"

/**
 * @typedef {Object} WorkerShardMessage
 * @property {WorkerShardMessageType} type The message type.
 * @property {any} data The message data.
 */
export interface WorkerShardMessage {
  type: WorkerShardMessageType;
  data: any;
}

export interface DiscordPayload {
  op: number;
  d: any;
  s?: number | null;
  t?: string;
}
