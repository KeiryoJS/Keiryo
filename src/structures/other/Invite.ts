/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Base } from "../Base";
import { DiscordStructure } from "../../util";

import type {
  APIExtendedInvite,
  InviteTargetUserType,
} from "discord-api-types/default";
import type { Guild } from "../guild/Guild";
import type { Channel } from "../channel/Channel";
import type { User } from "./User";

export class Invite extends Base {
  public readonly structureType = DiscordStructure.Invite;

  /**
   * The "ID" of this invite. (the code of the invite)
   * @type {string}
   */
  public readonly id: string;

  /**
   * The channel this invite belongs to.
   * @type {Channel}
   */
  public readonly channel: Channel;

  /**
   * The guild the channel belongs to. If the channel is in a guild.
   * @type {Guild | null}
   */
  public readonly guild: Guild | null;

  /**
   * Duration (in seconds) after which the invite expires
   * @type {number | null}
   */
  public maxAge!: number | null;

  /**
   * Max number of times this invite can be used
   * @type {number | null}
   */
  public maxUses!: number | null;

  /**
   * Whether this invite only grants temporary membership
   * @type {boolean | null}
   */
  public temporary!: boolean;

  /**
   * When this invite was created.
   * @type {number | null}
   */
  public createdTimestamp!: number | null;

  /**
   * Number of times this invite has been used.
   * @type {number}
   */
  public uses!: number;

  /**
   * Approximate count of total members
   * @type {number | null}
   */
  public approximateMemberCount!: number | null;

  /**
   * Approximate count of online members (only present when target_user is set)
   * @type {number | null}
   */
  public approximatePresenceCount!: number | null;

  /**
   * The user who created the invite
   * @type {User | null}
   */
  public inviter!: User | null;

  /**
   * The target user for this invite
   * @type {User | null}
   */
  public targetUser!: User | null;

  /**
   * The type of user target for this invite
   * @type {InviteTargetUserType | null}
   */
  public targetUserType!: InviteTargetUserType | null;

  /**
   * Creates a new instanceof Invite.
   * @param {Channel} channel The channel this invite belongs to.
   * @param {APIExtendedInvite} data The data returned from the API.
   * @param {Guild} [guild]
   */
  public constructor(channel: Channel, data: APIExtendedInvite, guild?: Guild) {
    super(channel.client);

    this.id = data.code;
    this.channel = channel;
    this.guild = guild ?? null;
  }

  /**
   * The invite code.
   * @type {string}
   */
  public get code(): string {
    return this.id;
  }

  protected _patch(data: APIExtendedInvite): this {
    this.createdTimestamp = data.created_at
      ? Date.parse(data.created_at)
      : null;
    this.maxAge = data.max_age ?? null;
    this.maxUses = data.max_uses ?? null;
    this.temporary = data.temporary ?? false;
    this.uses = data.uses ?? 0;
    this.approximateMemberCount = data.approximate_member_count ?? null;
    this.approximatePresenceCount = data.approximate_presence_count ?? null;
    this.inviter = data.inviter
      ? this.client.users.get(data.inviter.id) ?? null
      : null;
    this.targetUser = data.target_user
      ? this.client.users.get(data.target_user.id) ?? null
      : null;
    this.targetUserType = data.target_user_type ?? null;

    return this;
  }
}
