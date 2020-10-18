/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { ResourceLike, ResourcePool, ResourceType } from "../abstract";
import { resources } from "../resource/Resources";
import { Channel } from "../resource/channel/Channel";

import type { DMChannel } from "../resource/channel/DMChannel";
import type { Client } from "../../client";
import type { UserLike } from "./UserPool";
import type { APIChannel } from "discord-api-types";

export class DMChannelPool extends ResourcePool<DMChannel> {
  /**
   * @param {Client} client The client instance.
   */
  public constructor(client: Client) {
    super(client, {
      resource: ResourceType.DMChannel,
      class: resources.get("DMChannel")
    });
  }

  /**
   * Creates a new DM between the current user and someone else.
   * @param {UserLike} user The user to create a DM with.
   *
   * @returns {Promise<DMChannel>} The new DM channel.
   */
  public async create(user: UserLike): Promise<DMChannel> {
    const channel = await this.client.rest.post("/users/@me/channels", {
      body: { recipient_id: this.resolveId(user) }
    });

    return this._add(channel as APIChannel);
  }

  /**
   * Closes a DM Channel between someone.
   * @param channel
   */
  public async close(channel: DMLike): Promise<Readonly<DMChannel>> {
    const data = await this.client.rest.delete(`/channels/${this.resolveId(channel)}`);
    return Channel.create(this.client, data as APIChannel)?._freeze() as DMChannel;
  }

  /**
   * Adds a new DM channel to this manager.
   * @param {APIChannel} data
   *
   * @protected
   */
  protected _add(data: APIChannel): DMChannel {
    const existing = this.cache.get(data.id);
    if (existing && existing.type === data.type) {
      return existing["_patch"](data);
    }

    return this._create(data);
  }
}

export type DMLike = ResourceLike<DMChannel>;
