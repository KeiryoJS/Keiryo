/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Resource } from "../../../abstract/Resource";
import { UncachedResourceError } from "../../../../utils";
import { ResourceType } from "../../../abstract";

import type {
  GatewayActivity,
  GatewayPresenceClientStatus,
  GatewayPresenceUpdate,
  PresenceUpdateStatus
} from "discord-api-types";
import type { Client } from "../../../../client";
import type { Guild } from "../Guild";
import type { GuildMember } from "./GuildMember";

export class Presence extends Resource {
  /**
   * The ID of the guild member this presence belongs to.
   *
   * @type {string}
   */
  public readonly id: string;

  /**
   * The member's status.
   *
   * @type {PresenceUpdateStatus}
   */
  public status!: PresenceUpdateStatus;

  /**
   * The member's platform-dependant status.
   *
   * @type {GatewayPresenceClientStatus}
   */
  public clientStatus!: GatewayPresenceClientStatus;

  /**
   * The member's current activities.
   *
   * @type {Array<GatewayActivity>}
   */
  public activities!: GatewayActivity[];

  /**
   * The guild that this presence is in.
   *
   * @type {string}
   */
  public guildId: string;

  /**
   * @param {Client} client The client instance.
   * @param {GatewayPresenceUpdate} data The gateway presence update.
   */
  public constructor(client: Client, data: GatewayPresenceUpdate) {
    super(client);

    this.id = data.user.id;
    this.guildId = data.guild_id as string;

    this._patch(data);
  }

  /**
   * The guild that this presence is in.
   *
   * @type {Guild}
   */
  public get guild(): Guild {
    const guild = this.client.guilds.cache.get(this.guildId);
    if (!guild) {
      throw new UncachedResourceError(ResourceType.Guild, `ID: ${this.guildId}`);
    }

    return guild;
  }

  /**
   * The guild member that this presence belongs to.
   *
   * @type {Member}
   */
  public get member(): GuildMember {
    const member = this.guild.members.cache.get(this.id);
    if (!member) {
      throw new UncachedResourceError(ResourceType.GuildMember, `ID: ${this.id}`);
    }

    return member;
  }

  /**
   * Updates this presence with from the gateway.
   * @param {GatewayPresenceUpdate} data
   *
   * @protected
   */
  protected _patch(data: GatewayPresenceUpdate): this {
    this.status = data.status as PresenceUpdateStatus;
    this.clientStatus = data.client_status as GatewayPresenceClientStatus;
    this.activities = data.activities ?? [];

    return this;
  }
}
