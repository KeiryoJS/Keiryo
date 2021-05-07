/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

export class DiscordAPIError extends Error {
  /**
   * @param {object} data The data sent by discord.
   * @param {number} code The error code reported by discord.
   * @param {number} status The status code of the response.
   * @param {string} method The method of the request that erred.
   * @param {string} route The route that errored.
   */
  constructor(data, status, method, route, code) {
    const flattened = DiscordAPIError.flattenErrors(data.errors ?? data).join("\n");
    super(data.message && flattened
      ? `${data.message}\n${flattened}`
      : data.message || flattened);

    /**
     * The error code reported by discord.
     * @type {number}
     */
    this.code = code;

    /**
     * The status code of the response.
     * @type {number}
     */
    this.status = status;

    /**
     * The method of the request that errored.
     * @type {string}
     */
    this.method = method;

    /**
     * The route that errored.
     * @type {string}
     */
    this.route = route;
  }

  /**
   * The name of the error.
   * @type {string}
   */
  get name() {
    return `${DiscordAPIError.name}[${this.code}]`;
  }


  /**
   * Flattens an errors object returned from the API into an array.
   * @see https://github.com/discordjs/discord.js/blob/master/src/rest/DiscordAPIError.js#L46-L65
   *
   * @param {Object} obj Discord errors object
   * @param {string} [key] Used internally to determine key names of nested fields
   *
   * @returns {string[]}
   */
  static flattenErrors(obj, key = "") {
    let messages = [];

    for (const [ k, v ] of Object.entries(obj)) {
      if (k === "message") {
        continue;
      }
      const newKey = key ? (isNaN(k) ? `${key}.${k}` : `${key}[${k}]`) : k;

      if (v._errors) {
        messages.push(`${newKey}: ${v._errors.map(e => e.message).join(" ")}`);
      } else if (v.code || v.message) {
        messages.push(`${v.code ? `${v.code}: ` : ""}${v.message}`.trim());
      } else if (typeof v === "string") {
        messages.push(v);
      } else {
        messages = messages.concat(this.flattenErrors(v, newKey));
      }
    }

    return messages;
  }
}
