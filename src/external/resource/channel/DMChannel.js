/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Channel } from "./Channel";

export class DMChannel extends Channel {
  /**
   * @param {Client} client
   * @param {Object} data
   */
  constructor(client, data) {
    super(client, data);

    this.type = "dm";
    this._patch(data);
  }

  _patch(data) {
    /**
     * The recipient on the other end of the DM
     * @type {?User}
     */
    this.recipient = data.recipients
      ? this.client.users.add(data.recipients[0])
      : null;

    /**
     * The ID of the last message in the channel
     * @type {?string}
     */
    this.lastMessageID = data.last_message_id;

    /**
     * The timestamp when the last message was pinned
     * @type {?number}
     */
    this.lastPinTimestamp = data.last_pin_timestamp
      ? new Date(data.last_pin_timestamp).getTime()
      : null;
  }

  toString() {
    this.recipient.toString();
  }
}
