import type { APIGuildWelcomeScreenChannel } from "discord-api-types";
import type { TextBasedChannel } from "../../channel/Channel";
import type { WelcomeScreen } from "./WelcomeScreen";
import type { Guild } from "../Guild";

export class WelcomeChannel {
  /**
   * The ID of the channel this welcome channel belongs to.
   *
   * @type {string}
   */
  public channelId: string;

  /**
   * The ID of the emoji used.
   *
   * @type {string | null}
   */
  public emojiId: string | null;

  /**
   * The name of the emoji used.
   *
   * @type {string | null}
   */
  public emojiName: string | null;

  /**
   * The welcome screen.
   *
   * @type {WelcomeScreen}
   * @private
   */
  readonly #welcomeScreen: WelcomeScreen;

  /**
   * @param {WelcomeScreen} welcomeScreen The welcome screen.
   * @param {APIGuildWelcomeScreenChannel} data The welcome channel data.
   */
  public constructor(welcomeScreen: WelcomeScreen, data: APIGuildWelcomeScreenChannel) {
    this.channelId = data.channel_id;
    this.emojiId = data.emoji_id;
    this.emojiName = data.emoji_name;

    this.#welcomeScreen = welcomeScreen;
  }

  /**
   * The guild this welcome channel belongs to.
   *
   * @type {Guild}
   */
  public get guild(): Guild {
    return this.#welcomeScreen.guild;
  }

  /**
   * The channel instance.
   *
   * @type {TextChannel}
   */
  public get channel(): TextBasedChannel {
    return this.guild.channels.get(this.channelId) as TextBasedChannel;
  }
}