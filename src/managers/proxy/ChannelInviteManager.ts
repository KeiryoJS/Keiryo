import { ProxyManager } from "../ProxyManager";
import { exclude } from "../../util";

import type {
  APIExtendedInvite,
  RESTGetAPIChannelInvitesResult,
} from "discord-api-types";
import type { Invite } from "../../structures/other/Invite";
import type { UserResolvable } from "../UserManager";
import type { InviteResolvable } from "../InviteManager";
import type { GuildChannel } from "../../structures/channel/guild/GuildChannel";

export class ChannelInviteManager extends ProxyManager<Invite> {
  /**
   * The channel that this manager belongs to.
   * @type {Channel}
   * @private
   */
  private readonly _channel!: GuildChannel;

  /**
   * @param {Channel} channel The channel.
   * @param {string[]} [invites] Invites.
   */
  public constructor(channel: GuildChannel, invites?: string[]) {
    super(channel.client.invites, invites);

    Object.defineProperty(this, "_channel", {
      value: channel,
      writable: false,
      configurable: false,
    });
  }

  /**
   * The channel that this manager belongs to.
   * @type {Channel}
   */
  public get channel(): GuildChannel {
    return this._channel;
  }

  /**
   * Creates a new invite for this channel.
   * @param {AddChannelInvite} data
   * @returns {Promise<Invite>}
   */
  public async add(data: AddChannelInvite = {}): Promise<Invite> {
    const ep = `${this.channel.endpoint}/invites`;
    const invite = await this.client.api.post<APIExtendedInvite>(ep, {
      body: {
        ...exclude(data, "maxUses", "maxAge", "targetUser", "targetUserType"),
        max_uses: data.maxUses,
        max_age: data.maxAge,
        target_user:
          data.targetUser && this.client.users.resolveId(data.targetUser),
        target_user_type: data.targetUserType,
      },
    });

    this._set(invite.code);
    return this.client.invites["_add"](invite);
  }

  /**
   * Removes an invite.
   * @param {InviteResolvable} invite The invite to remoted.
   */
  public async remove(
    invite: InviteResolvable
  ): Promise<Readonly<Invite> | null> {
    return this.client.invites.remove(invite);
  }

  /**
   * Fetches all invites for the channel.
   * @returns {Promise<ChannelInviteManager>}
   */
  public async fetch(): Promise<ChannelInviteManager> {
    const invites = await this.client.api.get(
      `${this.channel.endpoint}/invites`
    );
    for (const invite of invites as RESTGetAPIChannelInvitesResult) {
      this._set(invite.code);
      this.client.invites["_add"](invite);
    }

    return this;
  }
}

export enum TargetUserType {
  Stream = 1,
}

export interface AddChannelInvite {
  /**
   * Duration of invite in seconds before expiry, or 0 for never.
   * @type {number}
   * @default 86400 (24 hours)
   */
  maxAge?: number;

  /**
   * Max number of uses or 0 for unlimited.
   * @type {?number}
   * @default 0
   */
  maxUses?: number;

  /**
   * Whether this invite only grants temporary membership
   * @type {?boolean}
   * @default false
   */
  temporary?: boolean;

  /**
   * If true, don't try to reuse a similar invite (useful for creating many unique one time use invites).
   * @type {?boolean}
   * @default false
   */
  unique?: boolean;

  /**
   * The target user for this invite.
   * @type {UserResolvable}
   */
  targetUser?: UserResolvable;

  /**
   * The type of target user for this invite.
   * @type {TargetUserType}
   */
  targetUserType?: TargetUserType;
}
