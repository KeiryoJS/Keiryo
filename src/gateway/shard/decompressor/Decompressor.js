/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { MethodNotImplementedError } from "../../../common";

export class Decompressor {
  /**
   * The default zlib chunk_size.
   *
   * @type {number}
   */
  static CHUNK_SIZE = 128 * 1024;

  /**
   * The decompression handlers.
   *
   * @type {Map<string, DecompressionHandler>}
   */
  static HANDLERS = new Map();

  /**
   *
   * @param {DecompressionEvents} events The event handlers to use.
   */
  constructor({ error, debug, data }) {
    if (this.constructor === Decompressor) {
      throw new Error("This is an abstract class, therefore it cannot be instantiated.");
    }

    if (!error || !data) {
      throw new Error("You must provide a error and data event handler.");
    }

    /**
     * Called whenever an error occurs.
     *
     * @type {Function}
     *
     * @private
     */
    this._error = error;

    /**
     * Called for general debugging purposes.
     *
     * @type {Function}
     *
     * @private
     */
    this._debug = debug;

    /**
     * Called whenever
     *
     * @type {Function}
     *
     * @private
     */
    this._data = data;

    this._init();
  }

  /**
   * Get a compression handler.
   *
   * @param {string} name The name of the compression handler.
   *
   * @returns {DecompressionHandler}
   */
  static getHandler(name) {
    const handler = Decompressor.HANDLERS.get(name);
    if (!handler) {
      const handlers = Decompressor.HANDLERS.keys().join("\", \"");
      throw new TypeError(`The compression handler "${name}" doesn't exist. Available Handlers: "${handlers}"`);
    }

    try {
      require(handler.pkg);
    } catch {
      throw new Error(`Please install the "${handler.pkg}" package for this handler to work.`);
    }

    return handler;
  }

  /**
   * Adds a new compression handler, or overwrites an existing one.
   *
   * @param {string} name The name of this compression handler.
   * @param {DecompressionHandler} handler The compression handler to add.
   */
  static addHandler(name, handler) {
    name = name.toLowerCase();
    if (!(handler.class.prototype instanceof Decompressor)) {
      throw new TypeError("Provided class does not extend this class.");
    }

    Decompressor.HANDLERS.set(name, handler);
  }

  /**
   * Creates a new Compression instance for the provided type.
   * @param {DecompressionMethod} name The type.
   * @param {DecompressionEvents} events The event handlers.
   * @returns {Decompressor}
   */
  static create(name, events) {
    const { class: Handler } = this.getHandler(name);
    return new Handler(events);
  }

  /**
   * Queue a buffer to be decompressed.
   * You must transform the compressed data into a buffer.
   *
   * @param {CompressedData} buffer The buffer to add.
   */
  add(buffer) {
    throw new MethodNotImplementedError();
  }

  /**
   * Used for initializing this Compression Handler.
   *
   * @private
   */
  _init() {
    throw new MethodNotImplementedError();
  }
}

/**
 * @typedef {"zlib-sync" | "zlib" | string} DecompressionMethod
 */

/**
 * @typedef {string | Buffer | ArrayBuffer | Buffer[]} CompressedData
 */

/**
 * @typedef {Object} DecompressionEvents
 * @prop {Function} error Called whenever an error has occurred.
 * @prop {Function} data Called whenever decompressed data is available.
 * @prop {Function} [debug] Used for general debugging purposes.
 */

/**
 * @typedef {Object} DecompressionHandler
 * @prop {typeof Decompressor} class The class to instantiate when creating this compression handler..
 * @prop {string} pkg The name of the package this compression handler uses. Used for verifying that it's installed.
 */
