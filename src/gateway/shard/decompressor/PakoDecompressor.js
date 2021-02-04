/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { ZlibSyncDecompressor } from "./ZlibSyncDecompressor";
import { Decompressor } from "./Decompressor";

let pako;
try {
  pako = require("pako");
} catch {
  // noop
}

export class PakoDecompressor extends ZlibSyncDecompressor {
  /**
   * Instantiates the Pako Inflate.
   * @private
   */
  _init() {
    this._zlib = new pako.Inflate({
      chunkSize: Decompressor.CHUNK_SIZE,
      to: ""
    });
  }
}
