/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { SerializationError } from "../../../errors";

export class Serialization {
  /**
   * Creates a new serialization handler.
   * @param {SerializationType} type The serialization type.
   */
  static create(type) {
    switch (type) {
      case "etf":
        try {
          require("etf.js");
        } catch {
          throw new SerializationError("Module: 'etf.js' not found.");
        }

        return new (require("./Etf").Etf)();
      case "json":
        return new (require("./Json").Json)();
      default:
        throw new TypeError(`Invalid serialization type: ${type}`);
    }
  }
}

/**
 * @typedef {"json" | "etf"} SerializationType
 */
