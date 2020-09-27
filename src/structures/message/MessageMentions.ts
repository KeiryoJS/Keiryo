/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Collection } from "@neocord/utils";

import type {
  APIChannelMention,
  APIGuildMember,
  APIUser,
  ChannelType,
} from "discord-api-types";
import type { Message } from "./Message";
import type { User } from "../other/User";
import type { Role } from "../guild/Role";
import type { Member } from "../guild/Member";
import type { GuildChannel } from "../channel/guild/GuildChannel";

const channelsPattern = /<@#(\d{17,19})>/;

export class MessageMentions {
  /**
   * The {@link Message} these mentions belong to.
   * @type {Message}
   */
  public readonly message: Message;

  /**
   * Any {@link User users} that mentioned.
   * Order is as received from the API, not as they appear in the message.
   * @type {Collection<string, User>}
   */
  public users: Collection<string, User>;

  /**
   * Any {@link Role roles} that were mentioned.
   * Order is as received from the API, not as they appear in the message.
   * @type {Collection<string, Role>}
   */
  public roles: Collection<string, Role>;

  /**
   * A collection of crossposted channels.
   * Order is as received from the API, not as they appear in the message.
   * @type {Collection<string, CrosspostedChannel>}
   */
  public crosspostedChannels: Collection<string, CrosspostedChannel>;

  /**
   * Whether `@everyone` or `@here` were mentioned
   * @type {boolean}
   */
  public everyone: boolean;

  /**
   * @param {Message} message
   * @param {MentionedUser[]} users
   * @param {boolean} everyone
   * @param {string[]} roles
   * @param {APIChannelMention} crossposted
   */
  public constructor(
    message: Message,
    users: MentionedUser[],
    everyone: boolean,
    roles: string[],
    crossposted?: APIChannelMention[]
  ) {
    this.message = message;

    this.users = new Collection();
    this.roles = new Collection();
    this.crosspostedChannels = new Collection();
    this.everyone = everyone;

    if (users) {
      for (const mention of users) {
        if (mention.member && message.guild) {
          message.guild.members["_add"](
            Object.assign(mention.member, {
              user: mention,
            }),
            message.guild
          );
        }

        const user = message.client.users["_add"](mention);
        this.users.set(user.id, user);
      }
    }

    if (roles) {
      for (const mention of roles) {
        const role = message.guild?.roles.get(mention);
        if (role) this.roles.set(role.id, role);
      }
    }

    if (crossposted) {
      for (const d of crossposted) {
        this.crosspostedChannels.set(d.id, {
          channelId: d.id,
          guildId: d.guild_id,
          type: d.type,
          name: d.name,
        });
      }
    }
  }

  /**
   * Cached members for {@link MessageMentions#members}
   * @private
   */
  private _members?: Collection<string, Member>;

  /**
   * Any {@link Member members} that were mentioned.
   * @type {Collection<string, Member>}
   */
  public get members(): Collection<string, Member> {
    if (this._members) return this._members;
    if (!this.message.guild) return new Collection();
    this._members = new Collection();

    let matches = null;
    while ((matches = channelsPattern.exec(this.message.content)) !== null) {
      const member = this.message.guild.members.get(matches[1]);
      if (member) this._members.set(member.id, member);
    }

    return this._members;
  }

  /**
   * Cached channels for {@link MessageMentions#channels}
   * @private
   */
  private _channels?: Collection<string, GuildChannel>;

  /**
   * Any {@link GuildChannel channels} that were mentioned.
   * @type {Collection<string, GuildChannel>}
   */
  public get channels(): Collection<string, GuildChannel> {
    if (this._channels) return this._channels;
    this._channels = new Collection();

    let matches = null;
    while ((matches = channelsPattern.exec(this.message.content)) !== null) {
      const channel = this.message.client.channels.get<GuildChannel>(
        matches[1]
      );
      if (channel) this._channels.set(channel.id, channel);
    }

    return this._channels;
  }
}

export type MentionedUser = APIUser & { member?: Omit<APIGuildMember, "user"> };

export interface CrosspostedChannel {
  /**
   * The ID of the mentioned channel.
   */
  channelId: string;

  /**
   * The type of of the channel.
   */
  type: ChannelType;

  /**
   * The name of the channel.
   */
  name: string;

  /**
   * The ID of the guild that has the channel.
   */
  guildId: string;
}
