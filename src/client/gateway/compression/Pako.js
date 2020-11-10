/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Compression } from "./Compression";
import { ZlibSync } from "./ZlibSync";

/**
 * @type {import("pako")}
 */
let pako;
try {
  pako = require("pako");
} catch {
  // no-op
}

export class Pako extends ZlibSync {
  _flush = 2;

  /**
   * Instantiates the Pako Inflate.
   * @private
   */
  _init() {
    this._zlib = new pako.Inflate({
      chunkSize: Compression.CHUNK_SIZE,
      to: ""
    });
  }
}
