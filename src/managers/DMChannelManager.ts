/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { BaseManager, BaseResolvable } from "./BaseManager";
import { neo } from "../structures/Extender";
import { Channel } from "../structures/channel/Channel";
import { DiscordStructure } from "../util";

import type { APIChannel } from "discord-api-types";
import type { DMChannel } from "../structures/channel/DMChannel";
import type { Client } from "../lib";
import type { UserResolvable } from "./UserManager";

export class DMChannelManager extends BaseManager<DMChannel> {
  /**
   * Creates a new instanceof DMChannelManager.
   * @param {Client} client The client instance.
   */
  public constructor(client: Client) {
    super(client, neo.get("DMChannel"));
  }

  /**
   * The total amount of dm channels that can be cached at one point in time.
   * @type {number}
   */
  public limit(): number {
    return this.client.data.limits.get(DiscordStructure.DMChannel) ?? Infinity;
  }

  /**
   * Closes a DM channel.
   * @param {DMResolvable} channel The DM to close.
   * @returns {DMChannel} The closed DM channel.
   */
  public async close(channel: DMResolvable): Promise<DMChannel> {
    const _channel = await this.client.api.delete<APIChannel>(
      `/channels/${this.resolveId(channel)}`
    );
    return Channel.create(this.client, _channel) as DMChannel;
  }

  /**
   * Creates a new DM between the current user and someone else.
   * @param {BaseResolvable} user The user.
   * @returns {DMChannel} The new dm channel.
   */
  public async new(user: UserResolvable): Promise<DMChannel> {
    const channel = await this.client.api.post<APIChannel>(
      "/users/@me/channels",
      {
        body: {
          recipient_id: this.resolveId(user),
        },
      }
    );

    return this.client.dms["_add"](channel);
  }

  /**
   * Adds a new DM channel to this manager.
   * @param {APIChannel} data
   * @protected
   */
  protected _add(data: APIChannel): DMChannel {
    const existing = this.get(data.id);
    if (existing && existing.type === data.type)
      return existing["_patch"](data);
    return this._set(new this._item(this.client, data));
  }
}

export type DMResolvable = BaseResolvable<DMChannel>;
