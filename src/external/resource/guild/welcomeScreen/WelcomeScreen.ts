import { Collection } from "@neocord/utils";
import { resources } from "../../Resources";

import type { Guild } from "../Guild";
import type { APIGuildWelcomeScreen } from "discord-api-types";
import type { WelcomeChannel } from "./WelcomeChannel";

export class WelcomeScreen {

  /**
   * The description of the server.
   * @type {string | null}
   */
  public description!: string | null;

  /**
   * Configured welcome screen channels.
   * @type {Collection<string, WelcomeChannel>}
   */
  public welcomeChannels!: Collection<string, WelcomeChannel>;

  /**
   * The guild this welcome screen belongs to.
   *
   * @type {Guild}
   * @private
   */
  readonly #guild: Guild;

  /**
   * @param {Guild} guild The guild that this welcome screen belongs to.
   * @param {APIGuildWelcomeScreen} data The welcome screen data from the api.
   */
  public constructor(guild: Guild, data: APIGuildWelcomeScreen) {
    this.#guild = guild;
    this.welcomeChannels = new Collection();

    this._patch(data);
  }

  /**
   * The guild that this welcome screen belongs to.
   *
   * @type {Guild}
   */
  public get guild(): Guild {
    return this.#guild;
  }

  /**
   * Updates this instance with data from the api.
   * @param {APIGuildWelcomeScreen} data
   * @protected
   */
  protected _patch(data: APIGuildWelcomeScreen): this {
    this.description = data.description;

    for (const channel of data.welcome_channels) {
      const welcomeChannel = new (resources.get("WelcomeChannel"))(this, channel);
      this.welcomeChannels.set(channel.channel_id, welcomeChannel);
    }

    return this;
  }
}