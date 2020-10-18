/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { ResourceProxy } from "../../abstract";

import type { TextBasedChannel } from "../../resource/channel/Channel";
import type { Message } from "../../resource/message/Message";

export class TextChannelPins extends ResourceProxy<Message> {

  /**
   * The text channel.
   *
   * @type {TextBasedChannel}
   * @private
   */
  readonly #channel: TextBasedChannel;

  /**
   * @param {TextBasedChannel} channel The channel.
   */
  public constructor(channel: TextBasedChannel) {
    super(channel.messages);

    this.#channel = channel;
  }

  /**
   * The text channel.
   *
   * @type {TextBasedChannel}
   */
  public get channel(): TextBasedChannel {
    return this.#channel;
  }
}