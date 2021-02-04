/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import type { Dictionary } from "../Functions";

export class Endpoint<P = Dictionary> {
  // Channel related
  static CHANNELS =                      new Endpoint("/channels");
  static CHANNEL =                       Endpoint.CHANNELS.extend<{ channel: string }>("/{channel}");

  static CHANNEL_WEBHOOKS =              Endpoint.CHANNEL.extend("/webhooks");

  static CHANNEL_FOLLOWERS =             Endpoint.CHANNEL.extend("/followers");
  static CHANNEL_TYPING =                Endpoint.CHANNEL.extend("/typing");
  static CHANNEL_RECIPIENTS =            Endpoint.CHANNEL.extend<{ user: string }>("/recipients/{user}");

  static CHANNEL_PINS =                  Endpoint.CHANNEL.extend("/pins");
  static CHANNEL_PIN =                   Endpoint.CHANNEL.extend<{ message: string }>("/pins/{message}");

  static CHANNEL_MESSAGES =              Endpoint.CHANNEL.extend("/messages");
  static CHANNEL_MESSAGE =               Endpoint.CHANNEL_MESSAGES.extend<{ message: string }>("/{message}");
  static CHANNEL_CROSSPOST =             Endpoint.CHANNEL_MESSAGE.extend("/crosspost");

  static CHANNEL_MESSAGE_REACTIONS =     Endpoint.CHANNEL_MESSAGE.extend("/reactions");
  static CHANNEL_MESSAGE_REACTION =      Endpoint.CHANNEL_MESSAGE_REACTIONS.extend<{ reaction: string }>("/{reaction}");
  static CHANNEL_MESSAGE_REACTION_USER = Endpoint.CHANNEL_MESSAGE_REACTION.extend<{ user: string }>("/{user}");

  static CHANNEL_BULK_DELETE =           Endpoint.CHANNEL_MESSAGES.extend("/bulk-delete");

  static CHANNEL_PERMISSIONS =           Endpoint.CHANNEL.extend("/permissions");
  static CHANNEL_PERMISSION =            Endpoint.CHANNEL_PERMISSIONS.extend<{ overwrite_id: string }>("/{overwrite_id}");

  static CHANNEL_INVITES =               Endpoint.CHANNEL.extend("/invites");
  static CHANNEL_INVITE =                Endpoint.CHANNEL_INVITES.extend<{ code: string }>("/{code}");

  // Guild related
  static GUILDS =                     new Endpoint("/guilds");
  static GUILD =                      Endpoint.GUILDS.extend<{ guild: string }>("/{guild}");

  static GUILD_CHANNELS =             Endpoint.GUILD.extend("/channels");
  static GUILD_CHANNEL =              Endpoint.GUILD_CHANNELS.extend<{ channel: string }>("/{channel}");

  static GUILD_EMOJIS =               Endpoint.GUILD.extend("/emojis")
  static GUILD_EMOJI =                Endpoint.GUILD_EMOJIS.extend<{ emoji: string }>("/{emoji}")

  static GUILD_MEMBERS =              Endpoint.GUILD.extend("/members");
  static GUILD_MEMBER =               Endpoint.GUILD_MEMBERS.extend<{ member: string }>("/{member}");
  static GUILD_MEMBER_NICK =          Endpoint.GUILD_MEMBER.extend("/nick")
  static GUILD_MEMBER_ROLE =          Endpoint.GUILD_MEMBER.extend<{ role: string }>("/roles/{role}")

  static GUILD_BANS =                 Endpoint.GUILD.extend("/bans")
  static GUILD_BAN =                  Endpoint.GUILD_BANS.extend<{ user: string }>("/{user}")

  static GUILD_ROLES =                Endpoint.GUILD.extend("/roles")
  static GUILD_ROLE =                 Endpoint.GUILD_ROLES.extend<{ role: string }>("/{role}")

  static GUILD_INTEGRATIONS =         Endpoint.GUILD.extend("/integrations");
  static GUILD_INTEGRATION =          Endpoint.GUILD_INTEGRATIONS.extend<{ integration: string }>("/{integration}");
  static GUILD_INTEGRATION_SYNC =     Endpoint.GUILD_INTEGRATION.extend("/sync");

  static GUILD_WIDGET =               Endpoint.GUILD.extend("/widget");
  static GUILD_WIDGET_JSON =          Endpoint.GUILD.extend("/widget.json");
  static GUILD_WIDGET_IMAGE =         Endpoint.GUILD.extend("/widget.png");

  static GUILD_MEMBERSHIP_SCREENING = Endpoint.GUILD.extend("/member-verification")
  static GUILD_VANITY_URL =           Endpoint.GUILD.extend("/vanity-url")
  static GUILD_PRUNE =                Endpoint.GUILD.extend("/prune");
  static GUILD_VOICE_REGIONS =        Endpoint.GUILD.extend("/regions");
  static GUILD_PREVIEW =              Endpoint.GUILD.extend("/preview");
  static GUILD_INVITES =              Endpoint.GUILD.extend("/invites");
  static GUILD_WEBHOOKS =             Endpoint.GUILD.extend("/webhooks");
  static GUILD_AUDIT_LOGS =           Endpoint.GUILD.extend("/audit-logs");

  // User related.
  static USER =             new Endpoint<{ user: string }>("/users/{user}");

  static USER_GUILDS =      Endpoint.USER.extend("/guilds");
  static USER_GUILD =       Endpoint.USER_GUILDS.extend<{ guild: string }>("/{guild}");

  static USER_DMS =         Endpoint.USER.extend("/channels");
  static USER_CONNECTIONS = Endpoint.USER.extend("/connections");

  // Webhook Related
  static WEBHOOK =         new Endpoint<{ webhook: string }>("/webhooks/{webhook}");
  static WEBHOOK_TOKEN =   Endpoint.WEBHOOK.extend<{ token: string }>("/{token}/");

  static WEBHOOK_MESSAGE = Endpoint.WEBHOOK_TOKEN.extend<{ message: string }>("/messages/{message}")

  static WEBHOOK_GITHUB =  Endpoint.WEBHOOK_TOKEN.extend("/github")
  static WEBHOOK_SLACK =   Endpoint.WEBHOOK_TOKEN.extend("/slack")

  // Random
  static GUILD_INVITE =  new Endpoint<{ code: string }>("/invites/{code]")
  static GATEWAY =       new Endpoint("/gateway/bot");
  static VOICE_REGIONS = new Endpoint("/voice/regions");
  static MESSAGE_LINK =  new Endpoint<{ guild: string, channel: string, message: string }>("/channels/{guild}/{channel}/{message}");

  /**
   * The endpoint template.
   *
   * @type {string}
   */
  readonly template: string;

  /**
   * @param {string} template The endpoint template.
   */
  constructor(template: string) {
    this.template = template;
  }

  /**
   * Extends this endpoint.
   *
   * @param {string} path
   */
  extend<EP>(path: string): Endpoint<EP & P> {
    path = path.replace(/^\//m, "");
    return new Endpoint(`${this.template.replace(/\/$/m, "")}/${path}`);
  }

  /**
   * Returns the usable endpoint.
   *
   * @param {Dictionary} parameters The parameters to use.
   *
   * @returns {string}
   */
  apply(parameters?: P): string {
    let endpoint = this.template.toLowerCase();
    if (parameters) {
      for (const [ k, v ] of Object.entries(parameters)) {
        endpoint = endpoint.replace(`{${k.toLowerCase()}}`, v.toString());
      }
    }

    return endpoint;
  }

  /**
   * The endpoint.
   */
  toString(): string {
    return `${this.template}`;
  }
}
