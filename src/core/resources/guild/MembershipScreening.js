/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Resource } from "../Resource";

export class MembershipScreening extends Resource {
  /**
   * @param {Client} client The client instance.
   * @param {Object} data The membership screening data.
   * @param {Guild} guild The guild that this membership screening object belongs to.
   */
  constructor(client, data, guild) {
    super(client);

    /**
     * The guild that this membership screening object belongs to.
     *
     * @type {Guild}
     */
    this.guild = guild;

    this._patch(data);
  }

  /**
   * Date of when the fields were last updated.
   *
   * @type {Date}
   */
  get versionDate() {
    return new Date(this.versionTimestamp);
  }

  /**
   * Updates this membership screening object with data from Discord.
   *
   * @param {Object} data The membership screening data.
   *
   * @private
   */
  _patch(data) {
    /**
     * Timestamp of when the fields were last updated.
     *
     * @type {number} ISO8601 Timestamp
     */
    this.versionTimestamp = Date.parse(data.version);

    /**
     * The steps in the screening form

     * @type {MembershipScreeningField[]}
     */
    this.fields = data.form_fields.map(f => {
      const field = {
        type: f.field_type,
        label: f.label,
        required: f.required
      };

      if ("values" in f) {
        field.values = f.values;
      }

      return f;
    });

    if ("description" in data) {
      /**
       * The server description shown in the screening form.
       *
       * @type {?string}
       */
      this.description = data.description;
    }
  }
}

/**
 * @typedef {Object} MembershipScreeningField
 * @property {"TERMS"} type The type of field.
 * @property {string} label The title of the field.
 * @property {string[]} [values] The list of rules.
 * @property {boolean} required Whether the user has to fill out this field.
 */
