/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { MethodNotImplementedError } from "../../../common";

export class Serialization {
  constructor() {
    if (this.constructor === Serialization) {
      throw new Error("This class is abstract, therefore it cannot be instantiated.");
    }
  }

  /**
   * Creates a new serializer.
   * @param {EncodingType} type The encoding type.
   */
  static create(type) {
    switch (type) {
      case "etf":
        try {
          require("@devsnek/earl");
        } catch (e) {
          throw new Error("The \"devsnek/earl\" package must be installed to use ETF.\n"+e.stack);
        }

        const Etf = require("./EtfSerialization").EtfSerialization;
        return new Etf();
      case "json":
        const Json = require("./JsonSerialization").JsonSerialization;
        return new Json();
      default:
        throw new TypeError(`Unknown encoding type \"${type}\"`);
    }
  }

  /**
   * Used for encoding payloads that are being sent out.
   * @param {DiscordPayload} payload The payload being encoded.
   * @returns {EncodedData} The encoded payload.
   */
  encode(payload) {
    throw new MethodNotImplementedError();
  }

  /**
   * Used for decoding payloads that have been received.
   * @param {EncodedData} encoded The encoded data.
   * @returns {DiscordPayload} The decoded payload.
   */
  decode(encoded) {
    throw new MethodNotImplementedError();
  }
}

/**
 * @typedef {string | Buffer | Uint8Array} EncodedData
 * @typedef {"etf" | "json"} EncodingType
 */
