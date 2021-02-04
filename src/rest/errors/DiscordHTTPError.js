/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

export class DiscordHTTPError extends Error {
  /**
   * @param {string} message The error message.
   * @param {number} status The status code of the response.
   * @param {string} route The route that erred.
   * @param {string} [method] The method of the request that erred.
   */
  constructor(message, status, method, route) {
    super(message);

    /**
     * The status code of the response.
     * @type {number}
     */
    this.status = status;

    /**
     * The route that errored.
     * @type {string}
     */
    this.route = route;

    if (method) {
      /**
       * The method of the request that erred.
       * @type {string}
       */
      this.method = method;
    }
  }

  get name() {
    return "DiscordHTTPError";
  }
}
