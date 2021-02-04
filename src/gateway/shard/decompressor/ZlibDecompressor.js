/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */


import { Decompressor } from "./Decompressor";
import { ZlibSyncDecompressor } from "./ZlibSyncDecompressor";
import { constants, createUnzip } from "zlib";

export class ZlibDecompressor extends Decompressor {
  /**
   * Decompressed data chunks returned from the unzip.
   *
   * @type {Buffer[]}
   */
  _chunks = [];

  /**
   * Temporary storage of compressed chunks while zlib is flushing.
   *
   * @type {Buffer[]}
   */
  _incomingChunks = [];

  /**
   * Whether zlib is currently flushing.
   *
   * @type {boolean}
   */
  _flushing = false;

  /**
   * Adds data to the zlib unzip.
   *
   * @param {CompressedData} data The data to compress.
   */
  add(data) {
    return Reflect.apply(ZlibSyncDecompressor.prototype.add, this, [ data ]);
  }

  _init() {
    this._flush = this._flush.bind(this);
    this._zlib = createUnzip({
      flush: constants.Z_SYNC_FLUSH,
      chunkSize: Decompressor.CHUNK_SIZE
    })
      .on("data", (c) => this._chunks.push(c))
      .on("error", (e) => this._error(e));
  }

  /**
   * Adds a buffer to the unzip.
   * @param {Buffer} buf The buffer to add.
   * @private
   */
  _addBuffer(buf) {
    this._flushing
      ? this._incomingChunks.push(buf)
      : this._write(buf);
  }

  /**
   * Called whenever zlib finishes flushing.
   * @private
   */
  _flush() {
    this._flushing = false;
    if (!this._chunks.length) {
      return;
    }

    let buf = this._chunks[0];
    if (this._chunks.length > 1) {
      buf = Buffer.concat(this._chunks);
    }

    this._chunks = [];
    while (this._incomingChunks.length > 0) {
      const next = this._incomingChunks.shift();
      if (next && this._write(next)) {
        break;
      }
    }

    this._data(buf);
  }

  /**
   * Writes data to the zlib unzip and initiates flushing if all data has been received.
   *
   * @param {Buffer} buf The buffer to add.
   *
   * @private
   */
  _write(buf) {
    this._zlib.write(buf);

    const len = buf.length;
    if (len >= 4 && buf.readUInt32BE(len - 4) === 0xFFFF) {
      this._flushing = true;
      this._zlib.flush(constants.Z_SYNC_FLUSH, this._flush);
      return true;
    }

    return false;
  }
}
