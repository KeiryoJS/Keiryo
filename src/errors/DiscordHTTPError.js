/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

export class DiscordHTTPError extends Error {
  /**
   * @param {string} message The error message.
   * @param {string} name The name of the error.
   * @param {number} status The status code of the response.
   * @param {string} method The method of the request that erred.
   * @param {string} url The url of the request that erred.
   */
  constructor(message, name, status, method, url) {
    super(message);

    this.name = name;
    this.status = status;
    this.method = method;
    this.url = url;
  }
}
