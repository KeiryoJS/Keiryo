/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

export class Resource {
  /**
   * @param {Client} client The client.
   */
  constructor(client) {
    /**
     * The client.
     * @type {Client}
     */
    this.client = client;
  }

  /**
   * Clone this resource.
   * @return {this}
   */
  _clone() {
    return Object.assign(Object.create(this), this);
  }

  /**
   * Freeze this resource.
   * @returns {this}
   */
  _freeze() {
    return Object.freeze(this);
  }

  /**
   * Patch this resource.
   * @return {this}
   */
  _patch(data) {
    return this;
  }
}
