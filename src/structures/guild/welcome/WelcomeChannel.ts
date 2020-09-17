/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import type { WelcomeScreen } from "./WelcomeScreen";
import type { Guild } from "../Guild";
import type { APIGuildWelcomeScreenChannel } from "discord-api-types/default";
import type { GuildTextChannel } from "../../channel/guild/GuildTextChannel";

export class WelcomeChannel {
  /**
   * The welcome screen.
   */
  public readonly welcomeScreen: WelcomeScreen;

  /**
   * The ID of the channel this welcome channel belongs to.
   */
  public channelId: string;

  /**
   * The ID of the emoji used.
   */
  public emojiId: string | null;

  /**
   * The name of the emoji used.
   */
  public emojiName: string | null;

  /**
   * Creates a new instanceof WelcomeChannel.
   * @param welcomeScreen The welcome screen.
   * @param data The welcome channel data.
   */
  public constructor(
    welcomeScreen: WelcomeScreen,
    data: APIGuildWelcomeScreenChannel
  ) {
    this.welcomeScreen = welcomeScreen;

    this.channelId = data.channel_id;
    this.emojiId = data.emoji_id;
    this.emojiName = data.emoji_name;
  }

  /**
   * The guild this welcome channel belongs to.
   */
  public get guild(): Guild {
    return this.welcomeScreen.guild;
  }

  /**
   * The channel instance.
   */
  public get channel(): GuildTextChannel {
    return this.guild.channels.get(this.channelId) as GuildTextChannel;
  }
}
