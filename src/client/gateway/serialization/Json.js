/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Serialization } from "./Serialization";
import { SerializationError } from "../../../errors";

export class Json extends Serialization {
  /**
   * Encodes a payload into a JSON string.
   * @param {DiscordPacket} payload The payload to encode.
   * @return {string}
   */
  encode(payload) {
    return JSON.stringify(payload);
  }

  /**
   * Decodes a (decompressed) websocket message.
   * @param {RawData} raw (The decompressed) websocket message.
   * @returns {DiscordPacket}
   */
  decode(raw) {
    try {
      if (typeof raw === "string" || raw instanceof Buffer || raw instanceof ArrayBuffer) {
        return JSON.parse(raw.toString());
      }

      if (Array.isArray(raw)) {
        const data = Buffer.concat(raw);
        return JSON.parse(data.toString());
      }

      throw new TypeError("Received invalid data.");
    } catch (e) {
      throw new SerializationError(e.message);
    }
  }
}