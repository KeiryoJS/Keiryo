/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

export class DiscordAPIError extends Error {
  /**
   * @param {string} message The error message reported by discord.
   * @param {number} code The error code reported by discord.
   * @param {number} status The status code of the response.
   * @param {string} method The method of the request that erred.
   * @param {string} url The url of the request that erred.
   */
  constructor(message, code, status, method, url) {
    super(message);

    this.message = message;
    this.code = code;
    this.status = status;
    this.method = method;
    this.url = url;
  }

  /**
   * The name of the error.
   * @type {string}
   */
  get name() {
    return `${DiscordAPIError.name}[${this.code}]`;
  }
}
