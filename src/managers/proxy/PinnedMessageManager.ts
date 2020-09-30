/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { ProxyManager } from "../ProxyManager";

import type { snowflake } from "@neocord/utils";
import type { Message } from "../../structures/message/Message";
import type { MessageResolvable } from "../index";
import type { TextBasedChannel } from "../../structures/channel/Channel";

export class PinnedMessageManager extends ProxyManager<Message> {
  /**
   * The channel that this manager belongs to.
   * @type {TextBasedChannel}
   */
  public readonly channel!: TextBasedChannel;

  /**
   * @param {TextBasedChannel} channel
   * @param {snowflake[]} [pinned]
   */
  public constructor(channel: TextBasedChannel, pinned?: snowflake[]) {
    super(channel.messages, pinned);

    Object.defineProperty(this, "channel", {
      value: channel,
      configurable: false,
      writable: false,
    });
  }

  /**
   * Unpins a message to the channel.
   * @param {MessageResolvable} message The message to unpin.
   * @param {string} [reason] Reason for unpinning the message.
   * @returns {Promise<Message>} The unpinned message.
   */
  public async remove(
    message: MessageResolvable,
    reason?: string
  ): Promise<Message | null> {
    const toPin = this.channel.messages.resolve(message);
    if (toPin) {
      await this.client.api.delete(
        `/channels/${this.channel.id}/pins/${toPin.id}`,
        {
          reason,
        }
      );

      this._delete(toPin.id);
    }

    return toPin;
  }

  /**
   * Pins a message to the channel.
   * @param {MessageResolvable} message The message to pin.
   * @param {string} [reason] Reason for pinning the message.
   * @returns {Promise<Message>} The pinned message.
   */
  public async add(
    message: MessageResolvable,
    reason?: string
  ): Promise<Message | null> {
    const toPin = this.channel.messages.resolve(message);
    if (toPin) {
      await this.client.api.put(
        `/channels/${this.channel.id}/pins/${toPin.id}`,
        {
          reason,
        }
      );

      this._set(toPin.id);
    }

    return toPin;
  }
}
