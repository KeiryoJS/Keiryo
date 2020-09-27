/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Base } from "../Base";

import type {
  APIExtendedInvite,
  APIInvite,
  InviteTargetUserType,
} from "discord-api-types";
import type { Guild } from "../guild/Guild";
import type { User } from "./User";
import type { GuildChannel } from "../channel/guild/GuildChannel";

export class Invite extends Base {
  /**
   * The "ID" of this invite. (the code of the invite)
   * @type {string}
   */
  public readonly id: string;

  /**
   * The channel this invite belongs to.
   * @type {Channel}
   */
  public readonly channel: GuildChannel;

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
  public constructor(
    channel: GuildChannel,
    data: APIExtendedInvite,
    guild?: Guild
  ) {
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

  /**
   * Deletes this invite.
   * @returns {Promise<Readonly<Invite>>}
   */
  public delete(): Promise<Readonly<Invite>> {
    return this.channel.invites.remove(this) as Promise<Readonly<Invite>>;
  }

  /**
   * Updates this invite with data from discord.
   * @param {APIExtendedInvite} data
   * @protected
   */
  protected _patch(data: APIInvite | APIExtendedInvite): this {
    if ("created_at" in data) {
      this.createdTimestamp = data.created_at
        ? Date.parse(data.created_at)
        : null;
    }

    if ("max_age" in data) this.maxAge = data.max_age ?? null;
    if ("max_uses" in data) this.maxUses = data.max_uses ?? null;
    if ("temporary" in data) this.temporary = data.temporary ?? false;
    if ("uses" in data) this.uses = data.uses ?? 0;

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
