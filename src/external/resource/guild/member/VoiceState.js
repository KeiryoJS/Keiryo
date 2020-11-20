/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Resource } from "../../../abstract/Resource";

export class VoiceState extends Resource {
  /**
   * @param {Client} client The client instance.
   * @param {Object} data The voice state data.
   */
  constructor(client, data) {
    super(client);
  }

}