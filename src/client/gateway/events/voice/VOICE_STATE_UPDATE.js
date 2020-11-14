/*
 * Copyright (c) 2020. MeLike2D & aesthetical All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Event } from "../Event";

export default class VOICE_STATE_UPDATE extends Event {
  async handle(packet) {
    /**
     * Emits the VOICE_STATE_UPDATE even
     * @prop {Object} packet
     */
    this.client.emit("VOICE_STATE_UPDATE", packet);
  }
}