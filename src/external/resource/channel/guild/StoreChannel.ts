import { ChannelType } from "discord-api-types";
import { GuildChannel } from "./GuildChannel";

export class StoreChannel extends GuildChannel {
  public readonly type = ChannelType.GUILD_STORE
}