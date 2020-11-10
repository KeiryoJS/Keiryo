/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */


import { Compression } from "./Compression";
import { ZlibSync } from "./ZlibSync";
import { constants, createUnzip } from "zlib";

export class Zlib extends Compression {
  /**
   * Decompressed data chunks returned from the unzip.
   * @type {Buffer[]}
   */
  #chunks = [];

  /**
   * Temporary storage of compressed chunks while zlib is flushing.
   * @type {Buffer[]}
   */
  #incomingChunks = [];

  /**
   * Whether zlib is currently flushing.
   * @type {boolean}
   */
  #flushing = false;

  /**
   * Adds data to the zlib unzip.
   * @param {RawData} data The data to compress.
   */
  add(data) {
    return ZlibSync.prototype.add.call(this, data);
  }

  _init() {
    this._flush = this._flush.bind(this);
    this._zlib = createUnzip({
      flush: constants.Z_SYNC_FLUSH,
      chunkSize: Compression.CHUNK_SIZE
    })
      .on("data", (c) => this.#chunks.push(c))
      .on("error", (e) => this.emit("error", e));
  }

  /**
   * Adds a buffer to the unzip.
   * @param {Buffer} buf The buffer to add.
   * @private
   */
  _addBuffer(buf) {
    return this.#flushing
      ? this.#incomingChunks.push(buf)
      : this._write(buf);
  }

  /**
   * Called whenever zlib finishes flushing.
   * @private
   */
  _flush() {
    this.#flushing = false;
    if (!this.#chunks.length) {
      return;
    }

    let buf = this.#chunks[0];
    if (this.#chunks.length > 1) {
      buf = Buffer.concat(this.#chunks);
    }

    this.#chunks = [];
    while (this.#incomingChunks.length > 0) {
      const next = this.#incomingChunks.shift();
      if (next && this._write(next)) break;
    }

    this.emit("data", buf);
  }

  /**
   * Writes data to the zlib unzip and initiates flushing if all data has been received.
   * @param {Buffer} buf The buffer to add.
   * @private
   */
  _write(buf) {
    this._zlib.write(buf);

    const len = buf.length;
    if (len >= 4 && buf.readUInt32BE(len - 4) === 0xFFFF) {
      this.#flushing = true;
      this._zlib.flush(constants.Z_SYNC_FLUSH, this._flush);
      return true;
    }

    return false;
  }
}
