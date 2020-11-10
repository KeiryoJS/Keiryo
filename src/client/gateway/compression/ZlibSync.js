/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Compression } from "./Compression";
import { CompressionError } from "../../../errors";

/**
 * @type {import("zlib-sync")}
 */
let zlib;
try {
  zlib = require("zlib-sync");
} catch {
  // no-op
}


export class ZlibSync extends Compression {
  _flush = zlib.Z_SYNC_FLUSH;

  /**
   * Adds data to the inflate.
   * @param {RawData} data The data to compress.
   */
  add(data) {
    if (data instanceof Buffer) {
      this._addBuffer(data);
      return;
    } else if (Array.isArray(data)) {
      this.emit("debug", "Received fragmented buffer message.");
      for (const buf of data) {
        this._addBuffer(buf);
      }

      return;
    } else if (data instanceof ArrayBuffer) {
      this.emit("debug", "Received array buffer message.");
      this._addBuffer(Buffer.from(data));
      return;
    }

    this.emit("error", new CompressionError("Received invalid data."));
  }

  /**
   * Instantiates the Zlib Inflate.
   * @private
   */
  _init() {
    this._zlib = new zlib.Inflate({
      chunkSize: Compression.CHUNK_SIZE,
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
        this.emit("error", new CompressionError(msg));
        return;
      }

      if (this._zlib.result) {
        this.emit("data", Buffer.from(this._zlib.result));
      }

      return;
    }

    this._zlib.push(buf);
  }
}