import type { GatewayEvent, ISMOptions, Shard, ShardManager } from "@neocord/gateway";
import type { BitField, BitFieldObject, Class, Collection, Emitter, Snowflake } from "@neocord/utils";
import type { API, APIOptions, ImageURLOptions } from "@neocord/rest";
import type { Readable } from "stream";
import type {
  APIChannel,
  APIGuild,
  APIGuildMember,
  APIGuildWelcomeScreen,
  APIGuildWelcomeScreenChannel,
  APIOverwrite,
  APIRole,
  APIRoleTags,
  APIUser,
  ChannelType,
  GatewayVoiceState,
  GuildExplicitContentFilter,
  GuildFeature,
  GuildPremiumTier,
  GuildSystemChannelFlags,
  GuildVerificationLevel,
  OverwriteType,
  UserFlags,
  UserPremiumType
} from "discord-api-types";

export class Client extends Emitter {
  /**
   * All cached guilds for the current user.
   */
  readonly guilds: GuildManager;
  /**
   * All cached users for the current session.
   */
  readonly users: UserManager;
  /**
   * The current user.
   */
  user?: ClientUser;
  /**
   * The token of this client.
   */
  token: string;

  /**
   * Creates a new Client.
   * @param options
   */
  constructor(options?: ClientOptions);

  /**
   * The internal sharding manager instance.
   */
  get ws(): ShardManager;

  /**
   * An interface for the discord api and cdn.
   */
  get api(): API;

  /**
   * Connects the bot to the discord gateway.
   */
  connect(token?: string): Promise<this>;

  /**
   * Destroys this client.
   */
  destroy(): void;
}

export interface ClientOptions {
  /**
   * Options for the sharding manager.
   */
  ws?: ISMOptions;
  /**
   * Options for the REST manager.
   */
  rest?: APIOptions;
  /**
   * Tracks how many times a certain event is received.
   */
  track?: GatewayEvent[] | "all" | boolean;
}

export enum Permission {
  CreateInstanceInvite = 1,
  KickMembers = 2,
  BanMembers = 4,
  Administrator = 8,
  ManageChannels = 16,
  ManageGuild = 32,
  AddReactions = 64,
  ViewAuditLog = 128,
  PrioritySpeaker = 256,
  Stream = 512,
  ViewChannel = 1024,
  SendMessages = 2048,
  SendTTSMessage = 4096,
  MangeMessages = 8192,
  EmbedLinks = 16384,
  AttachFiles = 32768,
  ReadMessageHistory = 65536,
  MentionEveryone = 131072,
  UseExternalEmojis = 262144,
  ViewGuildInsights = 524288,
  Connect = 1048576,
  Speak = 2097152,
  MuteMembers = 4194304,
  DeafenMembers = 8388608,
  MoveMembers = 16777216,
  UseVAD = 33554432,
  ChangeNickname = 67108864,
  ManageNicknames = 134217728,
  ManageRoles = 268435456,
  ManageWebhooks = 536870912,
  ManageEmojis = 1073741824
}

export class Permissions extends BitField<PermissionResolvable> {
  /**
   * All Permission Flags.
   */
  static FLAGS: typeof Permission;
  /**
   * The default permissions for a role.
   */
  static DEFAULT: number;

  /**
   * Checks whether the bitfield has a permission, or any of multiple permissions.
   * @param permission Permission(s) to check for
   * @param checkAdmin Whether to allow the administrator permission to override
   */
  any(permission: PermissionResolvable, checkAdmin?: boolean): boolean;

  /**
   * Checks whether the bitfield has a permission, or multiple permissions.
   * @param permission Permission(s) to check for
   * @param checkAdmin Whether to allow the administrator permission to override
   */
  has(permission: PermissionResolvable, checkAdmin?: boolean): boolean;
}

export type PermissionResolvable =
  keyof typeof Permission
  | Permission
  | number
  | BitFieldObject
  | ((keyof typeof Permission) | number | BitFieldObject)[];

export enum Cacheable {
  Guild = 1,
  Message = 2,
  Role = 4,
  Member = 8,
  Overwrite = 16,
  VoiceState = 32,
  Presence = 64,
  DMChannel = 128,
  GuildChannel = 256,
  GuildEmoji = 512,
  User = 1024,
  Invite = 2048,
  PinnedMessage = 4096
}

export class Cacheables extends BitField<CacheableResolvable> {
  /**
   * All cacheable structures.
   */
  static FLAGS: typeof Cacheable;
}

export type CacheableResolvable =
  Cacheable
  | keyof Cacheable
  | number
  | BitFieldObject
  | ((keyof Cacheable) | number | BitFieldObject)[];

export abstract class ImageResolver {
  /**
   * Whether a buffer is of the jpeg format.
   * @param buffer
   */
  static isJpg(buffer: Buffer): boolean;

  /**
   * Whether a buffer is of the png format.
   * @param buffer
   */
  static isPng(buffer: Buffer): boolean;

  /**
   * Whether a buffer is of the webp format.
   * @param buffer
   */
  static isWebp(buffer: Buffer): boolean;

  /**
   * Whether a buffer is of the gif format
   * @param buffer
   */
  static isGif(buffer: Buffer): boolean;

  /**
   * Get the image format of a buffer.
   * @param buffer
   */
  static getImageFormat(buffer: Buffer): ImageFormats | null;

  /**
   * @param data
   */
  static resolveBase64(data: Buffer | string): string;

  /**
   * @param resource
   */
  static resolveFile(resource: ImageResolvable): Promise<Buffer>;

  /**
   * Resolve an image into a base64
   * @param data
   */
  static resolveImage(data: ImageResolvable): Promise<string>;
}

export type ImageResolvable = Buffer | Readable | string;

export enum ImageFormats {
  WEBP = "image/webp",
  GIF = "image/gif",
  PNG = "image/png",
  JPEG = "image/jpeg"
}

export function define(descriptor: Omit<PropertyDescriptor, "value" | "get" | "set">): PropertyDecorator;

export enum ClientEvent {
  GuildAvailable = "guildAvailable",
  GuildUnavailable = "guildUnavailable"
}

export class UserManager extends BaseManager<User> {
  /**
   * Creates a new instanceof UserManager.
   * @param {Client} client The client instance.
   */
  constructor(client: Client);

  /**
   * The total amount of users that can be cached at one time.
   * @returns {number}
   */
  get limit(): number;

  /**
   * Fetches a user from the discord api.
   * @param {string} userId The ID of the user to fetch.
   * @returns {Promise<User>} The fetched user.
   */
  fetch(userId: string): Promise<User>;
}

export class GuildManager extends BaseManager<Guild> {
  /**
   * Creates a new instanceof GuildManager.
   * @param {Client} client The client instance.
   */
  constructor(client: Client);

  /**
   * The total amount of guilds that can be cached at one time.
   * @returns {number}
   */
  get limit(): number;

  /**
   * Removes a guild from the current users guild list.
   * @param {BaseResolvable} guild The guild to remove.
   * @param {string} [reason] The reason to provide.
   * @returns {Guild | null} The guild that was removed.
   */
  remove(guild: BaseResolvable<Guild>, reason?: string): Promise<Guild | null>;

  /**
   * Fetches a guild from the discord api.
   * @param {string} guild The ID of the guild to fetch.
   * @returns {Promise<Guild>} The fetched guild.
   */
  fetch(guild: string): Promise<Guild>;
}

export class ClientUser extends User {
  /**
   * Set the username of the current user.
   * @param username The new username.
   */
  setUsername(username: string): Promise<this>;

  /**
   * Update the current users avatar.
   * @param avatar The avatar to update the current one with.
   */
  setAvatar(avatar: ImageResolvable | null): Promise<this>;

  /**
   * Updates the current user.
   * @param data The new username or avatar to update the current user with.
   */
  update(data?: ClientUserUpdate): Promise<this>;
}

export interface ClientUserUpdate {
  username?: string;
  avatar?: ImageResolvable | null;
}

export abstract class BaseManager<S extends Base> extends Collection<string, S> {
  /**
   * Creates a new instanceof BaseManager
   * @param {Client} client The client instance.
   * @param {Class} item The item this manager holds.
   * @param {Iterable} [iterable] Pre-defined entries.
   */
  protected constructor(client: Client, item: Class<S>, iterable?: Iterable<S>);

  /**
   * Defines the extensibility of this class.
   */
  static get [Symbol.species](): typeof Collection;

  /**
   * The client instance.
   * @type {Client}
   */
  get client(): Client;

  /**
   * How many items this manager can hold.
   */
  abstract get limit(): number;

  /**
   * Resolves something into a structure.
   * @param {string | Base} data The data to resolve.
   * @returns {Base | null} The resolved item or null if nothing was found.
   */
  resolve(data: BaseResolvable<S>): S | null;

  /**
   * Resolves something into an ID
   * @param {string | Base} data The data to resolve.
   * @returns {string} The resolved ID or null if nothing was found.
   */
  resolveId(data: BaseResolvable<S>): string | null;

  /**
   * Sets a value to this store.
   * @param {string} key The entry key.
   * @param {Base} value The entry value.
   * @returns {this}
   */
  set(key: string, value: S): this;

  /**
   * The json representation of this manager.
   */
  toJSON(): string[];

  /**
   * Sets an item to this manager.
   * @private
   */
  protected _set(entry: S): S;

  /**
   * Adds a new item to this manager.
   * @private
   */
  protected _add(data: Dictionary): S;
}

export type BaseResolvable<T extends Base> = T | string | {
  id: string;
};

export class User extends Base {
  /**
   * The ID of this user.
   */
  readonly id: string;
  /**
   * The user's avatar hash.
   */
  avatar: string | null;
  /**
   * Whether the user belongs to an OAuth2 application.
   */
  bot: boolean;
  /**
   * The user's 4-digit discord-tag.
   */
  discriminator: string;
  /**
   * The user's email.
   */
  email: string | null;
  /**
   * The flags on this user's account.
   */
  flags: UserFlags;
  /**
   * The public flags on this user's account.
   */
  publicFlags: UserFlags;
  /**
   * The type of Nitro subscription on this user's account.
   */
  premiumType: UserPremiumType;
  /**
   * The user's chosen language option.
   */
  locale: string;
  /**
   * The user's username, not unique across the platform.
   */
  username: string;
  /**
   * Whether the user has two factor enabled on their account.
   */
  mfaEnabled: boolean;
  /**
   * Whether the email on this account has been verified.
   */
  verified: boolean;
  /**
   * Whether the user is an Official Discord System user (part of the urgent message system).
   */
  system: boolean;

  /**
   * Creates a new instance of User.
   * @param client The client.
   * @param data The decoded user data.
   */
  constructor(client: Client, data: APIUser);

  /**
   * The date when this user was created.
   */
  get createdAt(): Date;

  /**
   * The timestamp when this user was created.
   */
  get createdTimestamp(): number;

  /**
   * The tag of this user.
   */
  get tag(): string;

  /**
   * The mention string for this user.
   */
  get mention(): string;

  /**
   * The default avatar url for this user.
   */
  get defaultAvatarUrl(): string;

  /**
   * The URL for this user's avatar.
   * @param options The options for the url.
   */
  avatarURL(options?: ImageURLOptions): string | null;

  /**
   * The display avatar url for this user.
   * @param options The options for the avatar.
   */
  displayAvatarURL(options?: ImageURLOptions): string;

  /**
   * Get the string representation of this user.
   */
  toString(): string;

  /**
   * Updates this user with data from the api.
   * @protected
   */
  protected _patch(data: APIUser): this;
}

export class Guild extends Base {
  /**
   * The ID of this guild.
   * @type {string}
   */
  readonly id: string;
  /**
   * The shard that this guild operates on.
   * @type {Shard}
   */
  readonly shard: Shard;
  /**
   * All cached roles for this guild.
   * @type {RoleManager}
   */
  readonly roles: RoleManager;
  /**
   * All cached voice states for this guild.
   * @type {VoiceStateManager}
   */
  readonly voiceStates: VoiceStateManager;
  /**
   * All cached channels for this guild.
   * @type {GuildChannelManager}
   */
  readonly channels: GuildChannelManager;
  /**
   * All cached members for this guild.
   * @type {MemberManager}
   */
  readonly members: MemberManager;
  /**
   * Whether this guild has been deleted from the cache.
   */
  deleted: boolean;
  /**
   * The name of this guild.
   */
  name: string;
  /**
   * The ID of the AFK Voice Channel.
   */
  afkChannelId: string | null;
  /**
   * AFK Timeout in seconds.
   */
  afkTimeout: number | null;
  /**
   * Approximate number of members in this guild.
   */
  approximateMemberCount: number | null;
  /**
   * Approximate number of non-offline members in this guild.
   */
  approximatePresenceCount: number | null;
  /**
   * The hash of the guild banner,
   */
  banner: string | null;
  /**
   * The description of this guild, if the guild is discoverable.
   */
  description: string | null;
  /**
   * The discovery splash hash, only for guilds that are discoverable.
   */
  discoverySplash: string | null;
  /**
   * The explicit content filter config.
   */
  contentFilter: GuildExplicitContentFilter;
  /**
   * Enabled guild features.
   */
  features: GuildFeature[];
  /**
   * Timestamp for when the client joined the guild.
   */
  joinedTimestamp: number | null;
  /**
   * Whether this guild is considered a large guild.
   */
  large: boolean;
  /**
   * The maximum number of members allowed in this guild.
   */
  maxMembers?: number;
  /**
   * The maximum number of presences for this guild.
   */
  maxPresences: number;
  /**
   * The maximum amount of users in a video channel
   */
  maxVideoChannelUsers: number | null;
  /**
   * Total number of members in this guild
   */
  memberCount: number | null;
  /**
   * The ID of the user who owns this guild.
   */
  ownerId: string;
  /**
   * The preferred locale of a guild with the PUBLIC feature, defaults to "en-US".
   */
  preferredLocale: string;
  /**
   * The number of boosts this guild currently has.
   */
  boostCount: number;
  /**
   * The current boost tier of this guild.
   */
  boostTier: GuildPremiumTier;
  /**
   * The ID of the channel where admins/moderators of guilds with the PUBLIC feature will receives notices from Discord.
   */
  updatesChannelId: string | null;
  /**
   * The voice region of this guild.
   */
  region: string;
  /**
   * The ID of the channel where guilds with the PUBLIC feature can display rules and/or guidelines.
   */
  rulesChannelId: string | null;
  /**
   * System channel flags.
   */
  systemChannelFlags: GuildSystemChannelFlags;
  /**
   * The id of the channel where guild notices such as welcome messages and boost events are posted.
   */
  systemChannelId: string | null;
  /**
   * The vanity invite code for this server.
   */
  vanityURLCode: string | null;
  /**
   * Verification level required for this guild.
   */
  verificationLevel: GuildVerificationLevel;
  /**
   * The icon hash.
   */
  icon: string | null;
  /**
   * The welcome screen, only for community servers.
   */
  welcomeScreen?: WelcomeScreen;
  /**
   * Whether this guild is unavailable or not.
   */
  unavailable: boolean;

  /**
   * Creates a new instance of Guild.
   * @param client
   * @param data
   */
  constructor(client: Client, data: APIGuild);

  /**
   * The client as a member of this guild.
   */
  get me(): Member;

  /**
   * The date when this guild was created.
   */
  get createdAt(): Date;

  /**
   * Timestamp of when this guild was created.
   */
  get createdTimestamp(): number;

  /**
   * The snowflake data.
   */
  get snowflake(): Snowflake;

  /**
   * Updates this guild with data from the api.
   * @protected
   */
  protected _patch(data: APIGuild): this;
}

export abstract class Base {
  /**
   * The client instance.
   */
  readonly client: Client;
  /**
   * The ID of this instance.
   */
  abstract readonly id: string;

  /**
   * Creates a new instance of Base.
   * @param client The client instance.
   */
  protected constructor(client: Client);

  /**
   * Clones this instance.
   */
  clone(): this;

  /**
   * Get the JSON representation of this instance.4
   */
  toJSON(): Dictionary;

  /**
   * @protected
   */
  protected _patch(...data: unknown[]): this;
}

export class RoleManager extends BaseManager<Role> {
  /**
   * The guild this role manager belongs to.
   * @type {Guild}
   */
  readonly guild: Guild;

  /**
   * Creates a new instanceof RoleManager.
   * @param {Guild} guild The guild this role manager belongs to.
   */
  constructor(guild: Guild);

  /**
   * The total amount roles that can be cached at one time.
   * @returns {number}
   */
  get limit(): number;

  /**
   * The highest role based on position in this store.
   * @type {Role | null}
   */
  get highest(): Role | null;

  /**
   * Add a role to this store.
   * @param {RoleAddOptions} data The role data.
   * @param {string} [reason] The reason for adding this role..
   */
  new(data: RoleAddOptions, reason?: string): Promise<Role>;

  /**
   * Removes a role from the role list.
   * @param {BaseResolvable} role The role to remove.
   * @param {string} [reason] The reason for removing the role.
   */
  remove(role: BaseResolvable<Role>, reason?: string): Promise<Role | null>;

  /**
   * Fetches a role from the discord api.
   * @param {string} role The ID of the role to fetch.
   * @returns {Role} The fetched role.
   */
  fetch(role: string): Promise<Role>;
  /**
   * Fetches all roles for the guild.
   * @returns {RoleManager}
   */
  fetch(): Promise<RoleManager>;
}

export interface RoleAddOptions {
  name?: string;
  permissions?: PermissionResolvable | number;
  color?: string | number;
  hoisted?: boolean;
  mentionable?: boolean;
}

export class GuildChannelManager extends BaseManager<GuildChannel> {
  /**
   * The guild this channel cache belongs to.
   * @type {Guild}
   */
  readonly guild: Guild;

  /**
   * Creates a new instanceof GuildChannelCache
   * @param {Guild} guild The guild instance.
   */
  constructor(guild: Guild);

  /**
   * The amount of guild channels that can be cached at one point in time.
   * @type {number}
   */
  get limit(): number;

  /**
   * Get a guild channel.
   * @param {string} id ID of the channel to get.
   * @returns {GuildChannel} The guild channel
   */
  get<T extends GuildChannel = GuildChannel>(id: string): T | undefined;

  /**
   * Removes a channel from the guild.
   * @param {GuildChannel} channel The channel to remove.
   * @returns {GuildChannel | null} The removed channel.
   */
  remove<T extends GuildChannel = GuildChannel>(channel: BaseResolvable<T>): Promise<T | null>;

  /**
   * Fetches a guild channel from the discord api.
   * @param {string} channelId ID of the channel to fetch.
   * @returns {GuildChannel} The fetched channel.
   */
  fetch<T extends GuildChannel = GuildChannel>(channelId: string): Promise<T>;
  /**
   * Fetches all channels in the guild.
   * @returns {GuildChannelCache} The guild channel cache.
   */
  fetch(): Promise<GuildChannelManager>;

  /**
   * Adds a new item to this manager.
   * @private
   */
  protected _add(data: APIChannel): GuildChannel;
}

export class VoiceStateManager extends BaseManager<VoiceState> {
  /**
   * The guild instance.
   * @type {Guild}
   */
  readonly guild: Guild;

  /**
   * Creates a new instanceof VoiceStateManager.
   * @param {Guild} guild The guild instance.
   */
  constructor(guild: Guild);

  /**
   * The amount of voice states that can be cached at one time.
   * @type {number}
   */
  get limit(): number;
}

export class MemberManager extends BaseManager<Member> {
  /**
   * The guild this member manager belongs to.
   * @type {Guild}
   */
  readonly guild: Guild;

  /**
   * Creates a new instanceof MemberManager.
   * @param {Guild} guild The guild instance.
   */
  constructor(guild: Guild);

  /**
   * The total amount of members that can be cached at one point in time.
   * @type {number}
   */
  get limit(): number;

  /**
   * Resolves something into a guild member {@see Member}.
   * @param {MemberResolvable} data The data to resolve {@see MemberResolvable}.
   * @returns {Member | null} The resolved ID or null if nothing was found.
   */
  resolve(data: MemberResolvable): Member | null;

  /**
   * Resolves something into an ID.
   * @param {MemberResolvable} data The data to resolve - {@see MemberResolvable}.
   * @returns {string | null} The resolved ID or null if nothing was found.
   */
  resolveId(data: MemberResolvable): string | null;

  /**
   * Kicks a member or user from the {@see Guild}.
   * @param {MemberResolvable} target The {@see Member} or {@see User} to kick.
   * @param {string} [reason] The reason for the audit log entry.
   * @returns {Member | null} The kicked {@see Member}.
   */
  kick(target: MemberResolvable, reason?: string): Promise<Readonly<Member> | null>;

  /**
   * Bans a member or user from the {@see Guild}.
   * @param {MemberResolvable} target The {@see Member} or {@see User} to ban.
   * @param {string} [reason] The audit-log reason.
   * @returns {Member | null} The banned {@see Member}.
   */
  ban(target: MemberResolvable, reason?: string): Promise<Readonly<Member> | null>;

  /**
   * Fetch a member from the discord api.
   * @param {string} id User ID of the member to fetch.
   * @param {boolean} [force] Whether to skip checking if the member is already cached.
   * @returns {Member} The fetched (or cached) member.
   */
  fetch(id: string, force?: boolean): Promise<Member>;
  /**
   * Fetch 1-1000 members from the guild.
   * @param {FetchMembers} options Options to use when fetching.
   * @returns {Collection<string, Member>} The fetched members.
   */
  fetch(options?: FetchMembers): Promise<Collection<string, Member>>;

  /**
   * Get the number of members that would be removed in a 'non-dry' prune.
   * @param {DryPruneOptions} options The options for the 'dry' prune.
   * @param {string} [reason] The audit-log reason.
   * @returns {number} The number of members that would be removed in a 'non-dry' prune.
   */
  prune(options: DryPruneOptions, reason?: string): Promise<number>;
  /**
   * Starts a member prune operation.
   * @param {PruneOptions} options Options for the prune operation.
   * @param {string} [reason] The audit-log reason.
   * @returns {number | null} The number or removed members, only null if the 'computePruneCount' option was omitted or set to false.
   */
  prune(options: PruneOptions, reason?: string): Promise<number | null>;
}

export type MemberResolvable = BaseResolvable<User | Member>;

export interface FetchMembers {
  /**
   * Max number of members to fetch (1-1000)
   */
  limit?: number;
  /**
   * The highest user id in the previous page
   */
  after?: string;
}

export interface DryPruneOptions {
  /**
   * If set to true:
   * Returns the number ('pruned' property) of members that would be removed in a "non-dry" prune operation.
   */
  dry: true;
  /**
   * Number of days to count prune for (1 or more)
   */
  days?: number;
  /**
   * Role(s) to include
   */
  includeRoles?: string | string[];
}

export interface PruneOptions extends Omit<DryPruneOptions, "dry"> {
  /**
   * Whether 'pruned' is returned, discouraged for large guilds.
   */
  computePruneCount?: boolean;
  /**
   * Requests a prune operation.
   */
  dry?: false;
}

export class WelcomeScreen {
  /**
   * The guild this welcome screen belongs to.
   */
  readonly guild: Guild;
  /**
   * The description of the server.
   */
  description: string | null;
  /**
   * Configured welcome screen channels.
   */
  welcomeChannels: WelcomeChannel[];

  /**
   * Creates a new instanceof WelcomeScreen.
   * @param guild The guild that this welcome screen belongs to.
   * @param data
   */
  constructor(guild: Guild, data: APIGuildWelcomeScreen);

  /**
   * Updates this instance with data from the api.
   * @protected
   */
  protected _patch(data: APIGuildWelcomeScreen): this;
}

export class Member extends Base {
  /**
   * The ID of this member.
   */
  readonly id: string;
  /**
   * The guild this member belongs to.
   */
  readonly guild: Guild;
  /**
   * This users guild nickname.
   */
  nickname: string | null;
  /**
   * When the user joined the guild.
   */
  joinedTimestamp: number;
  /**
   * When the user started boosting the guild.
   */
  boostedTimestamp: number | null;
  /**
   * Whether the user is muted in voice channels
   */
  deaf: boolean;
  /**
   * Whether the user is deafened in voice channels
   */
  mute: boolean;

  /**
   * @param guild
   * @param data
   */
  constructor(guild: Guild, data: APIGuildMember);

  /**
   * The user that this guild member represents.
   */
  get user(): User;

  /**
   * The displayed name for this guild member.
   */
  get displayName(): string;

  /**
   * The voice state of this member.
   */
  get voice(): VoiceState | null;

  /**
   * The mention string for this member.
   */
  get mention(): string;

  /**
   * The string representation of this member.
   */
  toString(): string;

  /**
   * Updates this guild member from the discord gateway/api.
   * @protected
   */
  protected _patch(data: APIGuildMember): this;
}

export class Role extends Base {
  /**
   * The ID of this role.
   */
  readonly id: string;
  /**
   * The guild this role belongs to.
   */
  readonly guild: Guild;
  /**
   * The color that this role has.
   */
  color: number;
  /**
   * If this role is pinned in the user listing
   */
  hoisted: boolean;
  /**
   * Whether this role is managed by an integration
   */
  managed: boolean;
  /**
   * Whether this role is mentionable
   */
  mentionable: boolean;
  /**
   * The name of this role.
   */
  name: string;
  /**
   * The permissions of this role.
   */
  permissions: Permissions;
  /**
   * The position of this role
   */
  position: number;
  /**
   * Tags for this role.
   */
  tags: APIRoleTags | null;

  /**
   * Creates a new instanceof Role.
   * @param guild The guild that this role belongs to.
   * @param data
   */
  constructor(guild: Guild, data: APIRole);

  /**
   * Whether or not this role is @everyone
   */
  get everyone(): boolean;

  /**
   * The mention string of this role.
   */
  get mention(): string;

  /**
   * The string representation of this role.
   */
  toString(): string;

  /**
   * Updates this role with data from the api.
   * @protected
   */
  protected _patch(data: APIRole): this;
}

export abstract class GuildChannel extends Channel {
  /**
   * The guild that this channel belongs to.
   * @type {Guild}
   */
  readonly guild: Guild;
  /**
   * The name of this channel.
   * @type {string}
   */
  name: string;
  /**
   * The sorting position of this channel.
   * @type {number}
   */
  position: number;
  /**
   * The ID of the parent category.
   * @type {string}
   */
  parentId: string | null;
  /**
   * Whether this channel is deleted.
   * @type {boolean}
   */
  deleted: boolean;

  /**
   * Creates a new instanceof GuildChannel.
   * @param {Client} client The client instance.
   * @param {APIChannel} data The data returned from the api.
   * @param {Guild} [guild] The guild instance.
   */
  constructor(client: Client, data: APIChannel, guild?: Guild);

  get parent(): CategoryChannel | null;

  /**
   * Modifies this channel.
   * @param data The channel modify options.
   * @param reason The reason for updating this channel.
   */
  modify(data: ModifyGuildChannel, reason?: string): Promise<this>;

  /**
   * Updates this guild channel with data from the API.
   * @protected
   */
  protected _patch(data: APIChannel): this;
}

export interface ModifyGuildChannel extends Dictionary {
  name?: string;
  position?: number | null;
  permissionOverwrites?: (PermissionOverwrite | APIOverwrite)[] | null;
  parent?: CategoryChannel | string;
}

export class VoiceState extends Base {
  /**
   * The ID of the user the voice state is for.
   */
  readonly id: string;
  /**
   * The guild this voice state is apart of.
   */
  readonly guild: Guild;
  /**
   * ID of the channel the user is in.
   */
  channelId: string | null;
  /**
   * The voice state's session id.
   */
  sessionId: string;
  /**
   * Whether this user is deafened by the server.
   */
  deafened: boolean;
  /**
   * Whether this user is muted by the server.
   */
  muted: boolean;
  /**
   * Whether this user is locally deafened.
   */
  selfDeafened: boolean;
  /**
   * Whether this user is locally muted.
   */
  selfMuted: boolean;
  /**
   * Whether this user is streaming using "Go Live"
   */
  selfStream: boolean;
  /**
   * Whether this user's camera is enabled.
   */
  selfVideo: boolean;
  /**
   * Whether this user is muted by the current user.
   */
  suppressed: boolean;

  /**
   * Creates a new instanceof VoiceState.
   * @param client The client instance.
   * @param data The voice state data.
   * @param guild The guild.
   */
  constructor(client: Client, data: GatewayVoiceState, guild: Guild);

  /**
   * The channel that the user is in.
   * @type {VoiceChannel | null}
   */
  get channel(): VoiceChannel | null;

  /**
   * The member this voice state belongs to.
   * @type {Member}
   */
  get member(): Member;

  /**
   * Updates this voice state with data from the discord gateway/api.
   * @protected
   */
  protected _patch(data: GatewayVoiceState): this;
}

export class WelcomeChannel {
  /**
   * The welcome screen.
   */
  readonly welcomeScreen: WelcomeScreen;
  /**
   * The ID of the channel this welcome channel belongs to.
   */
  channelId: string;
  /**
   * The ID of the emoji used.
   */
  emojiId: string | null;
  /**
   * The name of the emoji used.
   */
  emojiName: string | null;

  /**
   * Creates a new instanceof WelcomeChannel.
   * @param welcomeScreen The welcome screen.
   * @param data The welcome channel data.
   */
  constructor(welcomeScreen: WelcomeScreen, data: APIGuildWelcomeScreenChannel);

  /**
   * The guild this welcome channel belongs to.
   */
  get guild(): Guild;

  /**
   * The channel instance.
   */
  get channel(): GuildTextChannel;
}

export abstract class Channel extends Base {
  /**
   * The ID of this channel.
   */
  readonly id: string;
  /**
   * The typeof channel this is.
   */
  abstract readonly type: ChannelType;

  /**
   * Creates a new instanceof Channel.
   * @param client The client instance.
   * @param data The data from the api.
   */
  constructor(client: Client, data: APIChannel);

  /**
   * Creates a new channel.
   * @param  {Client} client The client instance.
   * @param data
   * @param args
   */
  static create<T extends Channel>(client: Client, data: APIChannel, ...args: any[]): T | null;
}

export class PermissionOverwrite extends Base {
  /**
   * The role or user ID.
   * @type {string}
   */
  readonly id: string;
  /**
   * The guild channel that this permission overwrite belongs to.
   * @type {GuildChannel}
   */
  readonly channel: GuildChannel;
  /**
   * Either "role" or "member"
   * @type {OverwriteType}
   */
  readonly type: OverwriteType;
  deny: Permissions;
  allow: Permissions;

  /**
   * Creates a new instanceof PermissionOverwrite.
   * @param {Client} client The client instance.
   * @param {APIOverwrite} data The overwrite data from discord.
   * @param {GuildChannel} channel The guild channel that this permission overwrite belongs to.
   */
  constructor(client: Client, data: APIOverwrite, channel: GuildChannel);

  /**
   * Resolves an overwrite into an object.
   * @param {PermissionOverwrite | APIOverwrite} overwrite The permission overwrite instance.
   * @param {Guild} guild The guild instance.
   * @returns {APIOverwrite} The resolved overwrite.
   */
  static resolve(overwrite: PermissionOverwrite | APIOverwrite, guild: Guild): APIOverwrite;

  /**
   * Updates this permission overwrite with data from discord.
   * @protected
   */
  protected _patch(data: APIOverwrite): this;
}

export class CategoryChannel extends GuildChannel {
  /**
   * The type of channel this is.
   * @type {ChannelType.GUILD_CATEGORY}
   */
  readonly type = ChannelType.GUILD_CATEGORY;

  /**
   * All channels that are a child of this category.
   * @returns {Collection<string, GuildChannel>}
   */
  get children(): Collection<string, GuildChannel>;
}

export class VoiceChannel extends GuildChannel {
  readonly type = ChannelType.GUILD_VOICE;
  /**
   * The bitrate (in bits) of the voice channel; 8000 to 96000 (128000 for VIP servers).
   * @type {number}
   */
  bitrate: number;
  /**
   * The user limit of the voice channel; 0 refers to no limit, 1 to 99 refers to a user limit.
   * @type {number}
   */
  userLimit: number;

  /**
   * Whether the current user can delete this voice channel.
   */
  get deletable(): boolean;
}

export abstract class GuildTextChannel extends GuildChannel {
  /**
   * The typing handler for this guild text channel.
   * @type {Typing}
   */
  readonly typing: Typing;
  /**
   * Whether this channel is not safe for work.
   * @type {boolean}
   */
  nsfw: boolean;
  /**
   * ID of the last message sent in this channel.
   * @type {string}
   */
  lastMessageId: string | null;
  /**
   * Timestamp of the last pinned message.
   * @type {string}
   */
  lastPinTimestamp: string | null;
  /**
   * The channel topic.
   * @type {string}
   */
  topic: string | null;

  /**
   * Creates a new instanceof GuildTextChannel
   * @param {Client} client The client instance.
   * @param {APIChannel} data The channel data from the discord gateway/api.
   * @param {Guild} guild The guild instance.
   */
  constructor(client: Client, data: APIChannel, guild: Guild);

  /**
   * If the current user can send messages in this channel.
   * @returns {boolean}
   */
  get postable(): boolean;

  /**
   * If the current user can embed links in this channel.
   * @returns {boolean}
   */
  get embeddable(): boolean;

  /**
   * If the current user can view this channel.
   * @returns {boolean}
   */
  get viewable(): boolean;

  /**
   * Updates this channel with data from Discord.
   * @protected
   */
  protected _patch(data: APIChannel): this;
}

export interface ModifyGuildTextChannel extends ModifyGuildChannel {
  type?: ChannelType.GUILD_TEXT | ChannelType.GUILD_NEWS;
  topic?: string | null;
  nsfw?: boolean;
  parent?: string | CategoryChannel;
}

export class Typing {
  /**
   * The client instance.
   */
  readonly client: Client;
  /**
   * The channel instance.
   */
  readonly channel: CanTypeIn;

  /**
   * Creates a new instanceof Typing.
   * @param {Client} client The client instance.
   * @param {CanTypeIn} channel The channel instance.
   */
  constructor(channel: CanTypeIn);

  /**
   * Increases the interval count and starts typing if not already.
   * @param {number} [count=1] How much to increase the interval count.
   * @returns {Promise<Typing>} This instanceof Typing.
   */
  start(count?: number): Promise<this>;

  /**
   * Decreases the interval count and stops typing if the count is 0 or lower.
   * @param {number} [count=1] How much to decrease the interval count.
   * @returns {Typing} This instanceof Typing.
   */
  stop(count?: number): this;

  /**
   * Forces the typing count to 0 and stops typing.
   * @returns {Typing} This instanceof Typing.
   */
  forceStop(): this;

  /**
   * Starts the typing interval if not already started.
   * @returns {Promise<void>} Nothing...
   */
  protected _start(): Promise<void>;

  /**
   * Stops the typing interval if not already stopped.
   * @returns {void} Nothing...
   */
  protected _stop(): void;

  /**
   * Triggers the typing indicator in the channel.
   * @returns {Promise<void>} Nothing...
   */
  protected _send(): Promise<void>;
}

type CanTypeIn = GuildTextChannel | DMChannel;
export {};

export class DMChannel extends Channel {
  type: ChannelType;
}

