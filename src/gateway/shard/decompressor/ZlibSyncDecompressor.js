/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Decompressor } from "./Decompressor";
import { CompressionError } from "../../../common";

/**
 * @type {import("zlib-sync")}
 */
let zlib;
try {
  zlib = require("zlib-sync");
} catch {
  // no-op
}

export class ZlibSyncDecompressor extends Decompressor {
  _flush = zlib.Z_SYNC_FLUSH;

  /**
   * Adds data to the inflate.
   * @param {CompressedData} data The data to compress.
   */
  add(data) {
    if (data instanceof Buffer) {
      this._addBuffer(data);
      return;
    } else if (Array.isArray(data)) {
      this._debug("Received fragmented buffer message.");
      for (const buf of data) {
        this._addBuffer(buf);
      }

      return;
    } else if (data instanceof ArrayBuffer) {
      this._debug("Received array buffer message.");
      this._addBuffer(Buffer.from(data));
      return;
    }

    this._error(new CompressionError("Received invalid data."));
  }

  /**
   * Instantiates the Zlib Inflate.
   * @private
   */
  _init() {
    /**
     * The zlib sync inflate
     * @type {module:zlib-sync.Inflate}
     * @private
     */
    this._zlib = new zlib.Inflate({
      chunkSize: Decompressor.CHUNK_SIZE,
      to: ""
    });
  }

  /**
   * Adds a buffer to the inflate.
   * @param {Buffer} buf The buffer to add.
   * @private
   */
  _addBuffer(buf) {
    const len = buf.length;
    if (len >= 4 && buf.readUInt32BE(len - 4) === 0xFFFF) {
      this._zlib.push(buf, this._flush);
      if (this._zlib.err) {
        const msg = `${this._zlib.err}: ${this._zlib.msg}`;
        this._error(new CompressionError(msg));
        return;
      }

      if (this._zlib.result) {
        this._data(Buffer.from(this._zlib.result));
      }

      return;
    }

    this._zlib.push(buf, false);
  }
}