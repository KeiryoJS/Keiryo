/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { CompressionError } from "../../../errors";
import { Emitter } from "../../../utils";

export class Compression extends Emitter {
  static CHUNK_SIZE = 128 * 1024;

  constructor() {
    super();

    /**
     * Emitted whenever decompressed data is available.
     * @event Compression#data
     * @param {Buffer} buf The decompressed data.
     */

    /**
     * Emitted whenever the Compression handler encounters an error.
     * @event Compression#error
     * @param {Error} err The error
     */

    /**
     * Emitted for general debugging purposes.
     * @event Compression#debug
     * @param {string} message The debug message.
     */

    this._init();
  }

  /**
   * Creates a new Compression instance.
   * @param {CompressionPackage} pkg
   * @returns {Compression}
   */
  static create(pkg) {
    switch (pkg) {
      case "pako":
        try {
          require("pako");
        } catch (e) {
          throw new CompressionError("Module: 'pako' not found.");
        }

        return new (require("./Pako").Pako)();
      case "zlib":
        return new (require("./Zlib").Zlib)();
      case "zlib-sync":
        try {
          require("zlib-sync");
        } catch (e) {
          throw new CompressionError("Module: 'zlib-sync' not found.");
        }

        return new (require("./ZlibSync").ZlibSync)();
      default:
        throw new TypeError(`Invalid compression package: ${pkg}`);
    }
  }
}

/**
 * @typedef {"zlib" | "zlib-sync" | "pako"} CompressionPackage
 */

/**
 * @typedef {string | Buffer | ArrayBuffer | Buffer[]} RawData
 */
