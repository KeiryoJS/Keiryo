/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

export class CompressionError extends Error {
  /**
   * @param {string} message The error message.
   */
  constructor(message) {
    super(message);

    this.name = "CompressionError";
  }
}
