/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Base } from "../Base";

import type {
  APIExtendedInvite,
  InviteTargetUserType,
} from "discord-api-types/default";
import type { Guild } from "../guild/Guild";
import type { Channel } from "../channel/Channel";
import type { User } from "./User";

export class Invite extends Base {
  /**
   * The "ID" of this invite. (the code of the invite)
   */
  public readonly id: string;

  /**
   * The channel this invite belongs to.
   */
  public readonly channel: Channel;

  /**
   * The guild the channel belongs to. If the channel is in a guild.
   */
  public readonly guild: Guild | null;

  /**
   * Duration (in seconds) after which the invite expires
   */
  public maxAge!: number | null;

  /**
   * Max number of times this invite can be used
   */
  public maxUses!: number | null;

  /**
   * Whether this invite only grants temporary membership
   */
  public temporary!: boolean;

  /**
   * When this invite was created.
   */
  public createdTimestamp!: number | null;

  /**
   * Number of times this invite has been used.
   */
  public uses!: number;

  /**
   * Approximate count of total members
   */
  public approximateMemberCount!: number | null;

  /**
   * Approximate count of online members (only present when target_user is set)
   */
  public approximatePresenceCount!: number | null;

  /**
   * The user who created the invite
   */
  public inviter!: User | null;

  /**
   * The target user for this invite
   */
  public targetUser!: User | null;

  /**
   * The type of user target for this invite
   */
  public targetUserType!: InviteTargetUserType | null;

  /**
   * Creates a new instanceof Invite.
   * @param channel The channel this invite belongs to.
   * @param data The data returned from the API.
   * @param guild
   */
  public constructor(channel: Channel, data: APIExtendedInvite, guild?: Guild) {
    super(channel.client);

    this.id = data.code;
    this.channel = channel;
    this.guild = guild ?? null;
  }

  /**
   * The invite code.
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
