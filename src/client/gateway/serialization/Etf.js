/*
 * Copyright (c) 2020 MeLike2D, All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Serialization } from "./Serialization";
import { SerializationError } from "../../../errors";

/**
 * @type {import("erlpack")}
 */
let erlpack;
try {
  erlpack = require("erlpack");
} catch {
  // no-op
}

export class Etf extends Serialization {
  /**
   * Encodes a payload into the etf format.
   * @param {DiscordPacket} payload The payload to encode.
   * @returns {Uint8Array}
   */
  encode(payload) {
    return erlpack.pack(payload);
  }

  /**
   * Decodes a (decompressed) websocket message into a JSON payload.
   * @param {RawData} raw The (decompressed) websocket message.
   * @returns {DiscordPacket}
   */
  decode(raw) {
    let data = null;

    if (raw instanceof Buffer) {
      data = raw;
    } else if (Array.isArray(raw)) {
      data = Buffer.concat(raw);
    } else if (raw instanceof ArrayBuffer) {
      data = Buffer.from(raw);
    }

    if (data) {
      return erlpack.unpack(data);
    }

    throw new SerializationError("Received invalid data.");
  }
}