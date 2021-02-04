/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Serialization } from "./Serialization";
import { SerializationError } from "../../../common";

let etf;
try {
  etf = require("@devsnek/earl");
} catch {
  // no-op
}

export class EtfSerialization extends Serialization {
  /**
   * Encodes a payload into the etf format.
   * @param {DiscordPayload} payload The payload to encode.
   * @returns {Uint8Array}
   */
  encode(payload) {
    return etf.pack(payload);
  }

  /**
   * Decodes a (decompressed) payload into a usable object.
   * @param {CompressedData} encoded The (decompressed) payload.
   * @returns {DiscordPayload}
   */
  decode(encoded) {
    let data = null;

    if (encoded instanceof Buffer) {
      data = encoded;
    } else if (Array.isArray(encoded)) {
      data = Buffer.concat(encoded);
    } else if (encoded instanceof ArrayBuffer) {
      data = Buffer.from(encoded);
    }

    if (data) {
      return etf.unpack(data);
    }

    throw new SerializationError("Received invalid data.");
  }
}
