/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Base } from "../Base";
import { DiscordStructure } from "../../util";

import type {
  GatewayActivity,
  GatewayPresenceClientStatus,
  GatewayPresenceUpdate,
  PresenceUpdateStatus,
} from "discord-api-types";
import type { Client } from "../../internal";
import type { Guild } from "./Guild";
import type { Member } from "./Member";

export class Presence extends Base {
  public readonly structureType = DiscordStructure.Presence;

  /**
   * The id of the member this presence corresponds to.
   * @type {string}
   */
  public readonly id: string;

  /**
   * The guild instance.
   * @type {Guild}
   */
  public readonly guild: Guild;

  /**
   * The member's status.
   * @type {PresenceUpdateStatus}
   */
  public status!: PresenceUpdateStatus;

  /**
   * The member's platform-dependant status.
   * @type {GatewayPresenceClientStatus}
   */
  public clientStatus!: GatewayPresenceClientStatus;

  /**
   * The member's current activities.
   * @type {Array<GatewayActivity>}
   */
  public activities!: GatewayActivity[];

  /**
   * Creates a new instanceof Presence.
   * @param {Client} client The client instance.
   * @param {GatewayPresenceUpdate} data The presence update.
   * @param {Guild} [guild] The guild instance.
   */
  public constructor(
    client: Client,
    data: GatewayPresenceUpdate,
    guild?: Guild
  ) {
    super(client);

    this.id = data.user.id;
    this.guild = guild ?? (client.guilds.get(data.guild_id as string) as Guild);

    this._patch(data);
  }

  /**
   * The guild member that this presence belongs to.
   * @type {Member}
   */
  public get member(): Member {
    return this.guild.members.get(this.id) as Member;
  }

  /**
   * Updates this presence with from the gateway.
   * @param {GatewayPresenceUpdate} data
   * @protected
   */
  protected _patch(data: GatewayPresenceUpdate): this {
    this.status = data.status as PresenceUpdateStatus;
    this.clientStatus = data.client_status as GatewayPresenceClientStatus;
    this.activities = data.activities ?? [];

    return this;
  }
}
