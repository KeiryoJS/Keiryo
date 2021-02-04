/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Decompressor } from "./Decompressor";
import { ZlibDecompressor } from "./ZlibDecompressor";
import { ZlibSyncDecompressor } from "./ZlibSyncDecompressor";
import { PakoDecompressor } from "./PakoDecompressor";

Decompressor.addHandler("zlib", {
  class: ZlibDecompressor,
  pkg: "zlib"
});

Decompressor.addHandler("zlibSync", {
  class: ZlibSyncDecompressor,
  pkg: "zlib-sync"
});

Decompressor.addHandler("pako", {
  class: PakoDecompressor,
  pkg: "pako"
});

export { Decompressor, ZlibDecompressor, ZlibSyncDecompressor, PakoDecompressor };
