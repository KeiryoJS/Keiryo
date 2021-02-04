/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

export class Resource {
  /**
   * The client instance.
   *
   * @type {Client}
   */
  client;

  /**
   * @param {Client} client The Client instance.
   */
  constructor(client) {
    Reflect.defineProperty(this, "client", {
      value: client,
      writable: false
    });
  }

  /**
   * Freezes this Resource.
   *
   * @returns {Readonly<Resource>}
   */
  _freeze() {
    return Object.freeze(this);
  }

  /**
   * Clones this Resource.
   *
   * @returns {this}
   */
  _clone() {
    return Object.assign(Object.create(this), this);
  }

  /**
   * Updates this Resource with data from the API/Gateway.
   *
   * @param {Object} data The data.
   *
   * @returns {Resource}
   */
  _patch(data) {
    return this;
  }
}