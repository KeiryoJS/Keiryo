/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Serialization } from "./Serialization";
import { SerializationError } from "../../../common";

export class JsonSerialization extends Serialization {
  /**
   * Encodes a payload into a JSON string.
   * @param {DiscordPayload} payload The payload to encode.
   * @returns {EncodedData}
   */
  encode(payload) {
    return JSON.stringify(payload);
  }

  /**
   * Decodes a (decompressed) payload that has been received.
   * @param {string | Buffer | Buffer[]} encoded The (decompressed) payload.
   * @returns {DiscordPayload}
   */
  decode(encoded) {
    try {
      if (typeof encoded === "string" || encoded instanceof Buffer || encoded instanceof ArrayBuffer) {
        return JSON.parse(encoded.toString());
      }

      if (Array.isArray(encoded)) {
        const data = Buffer.concat(encoded);
        return JSON.parse(data.toString());
      }
    } catch (e) {
      throw new SerializationError(e.message);
    }

    throw new TypeError("Received invalid data.");
  }
}