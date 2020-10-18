import { APIChannel, ChannelType } from "discord-api-types";
import { GuildChannel } from "./GuildChannel";

import { TypingManager } from "../TypingManager";
import { MessagePool } from "../../../pool/message/MessagePool";
import { TextChannelPins } from "../../../pool/proxy/TextChannelPins";

import type { Client } from "../../../../client";
import type { Guild } from "../../guild/Guild";

export class TextChannel extends GuildChannel {
  public readonly type: ChannelType = ChannelType.GUILD_TEXT;

  /**
   * The typing helper for this channel.
   * @type {TypingManager}
   */
  public readonly typing: TypingManager;

  /**
   * The message manager for this channel.
   * @type {MessagePool}
   */
  public readonly messages: MessagePool;

  /**
   * The pinned message manager for this channel.
   * @type {TextChannelPins}
   */
  public readonly pins: TextChannelPins;

  /**}
   * @param {Client} client The client instance.
   * @param {APIChannel} data The channel data from discord.
   * @param {Guild} guild The guild instance.
   */
  public constructor(client: Client, data: APIChannel, guild: Guild) {
    super(client, data, guild);

    this.typing = new TypingManager(this);
    this.messages = new MessagePool(this);
    this.pins = new TextChannelPins(this);
  }
}