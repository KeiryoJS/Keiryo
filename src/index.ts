export * from "./internal";
export * from "./managers";
export * from "./structures";
export * from "./util";

export * from "./structures/channel/guild/CategoryChannel";
export * from "./structures/channel/guild/GuildChannel";
export * from "./structures/channel/guild/NewsChannel";
export * from "./structures/channel/guild/StoreChannel";
export * from "./structures/channel/guild/TextChannel";
export * from "./structures/channel/guild/VoiceChannel";

export * from "./structures/channel/Channel";
export * from "./structures/channel/DMChannel";
export * from "./structures/channel/Typing";

export * from "./structures/guild/emoji/Base";
export * from "./structures/guild/emoji/GuildEmoji";
export * from "./structures/guild/emoji/GuildPreviewEmoji";

export * from "./structures/guild/welcome/WelcomeChannel";
export * from "./structures/guild/welcome/WelcomeScreen";

export * from "./structures/guild/Ban";
export * from "./structures/guild/Guild";
export * from "./structures/guild/Member";
export * from "./structures/guild/PermissionOverwrite";
export * from "./structures/guild/Presence";
export * from "./structures/guild/Role";
export * from "./structures/guild/VoiceState";

export * from "./structures/message/Message";
export * from "./structures/message/MessageAttachment";
export * from "./structures/message/MessageMentions";

export * from "./structures/other/ClientUser";
export * from "./structures/other/Embed";
export * from "./structures/other/Emoji";
export * from "./structures/other/Invite";
export * from "./structures/other/User";
export * from "./structures/other/VoiceRegion";

declare global {
  interface Object {
    entries<O extends Record<PropertyKey, unknown>, K extends keyof O>(
      obj: O
    ): ArrayLike<[K, O[K]]>;

    keys<O extends Record<PropertyKey, unknown>, K extends keyof O>(
      obj: O
    ): K[];
  }
}
