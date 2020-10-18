/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Payload, Shard, ShardManager, ShardManagerOptions } from "@neocord/gateway";
import { API, APIOptions } from "@neocord/rest";
import { Emitter, Listener, Timers } from "@neocord/utils";
import { DataHandler, DataOptions } from "./internal/DataHandler";

import { UserPool } from "../external/pool/UserPool";
import { GuildPool } from "../external/pool/guild/GuildPool";
import { RelationshipPool } from "../external/pool/RelationshipPool";
import { ClientUser } from "../external/resource/user/ClientUser";
import { DMChannelPool } from "../external/pool/DMChannelPool";
import { ChannelPool } from "../external/pool/ChannelPool";

import type { APIUser } from "discord-api-types";
import type { CacheManager } from "./internal/caching/CacheManager";
import type { Ban } from "../external/resource/guild/member/Ban";
import type { Guild } from "../external/resource/guild/Guild";
import type { GuildMember } from "../external/resource/guild/member/GuildMember";
import type { Presence } from "../external/resource/guild/member/Presence";
import type { VoiceState } from "../external/resource/guild/member/VoiceState";
import type { User } from "../external/resource/user/User";
import type { Role } from "../external/resource/guild/member/Role";
import type { Channel, TextBasedChannel } from "../external/resource/channel/Channel";
import type { Typing } from "../external/resource/misc/Typing";
import type { Message } from "../external/resource/message/Message";
import type { Invite } from "../external/resource/channel/Invite";

export class Client extends Emitter {
  /**
   * The user pool.
   *
   * @type {UserPool}
   */
  public readonly users: UserPool;

  /**
   * The guild pool.
   *
   * @type {GuildPool}
   */
  public readonly guilds: GuildPool;

  /**
   * The cached channels for this client.
   */
  public readonly channels: ChannelPool;

  /**
   * The relationships for this user.
   * Should only be used with a user account.
   *
   * @type {GuildPool}
   */
  public readonly relationships: RelationshipPool;

  /**
   * The DMs for the current user.
   *
   * @type {DMChannelPool}
   */
  public readonly dms: DMChannelPool;

  /**
   * The current user that the client is logged in as.
   *
   * @type {ClientUser}
   */
  public user?: ClientUser;

  /**
   * The token to use.
   *
   * @type {string}
   * @private
   */
  #token?: string;

  /**
   * The REST manager for communicating with Discords API.
   *
   * @type {API}
   * @private
   */
  readonly #rest: API;

  /**
   * The shard manager for internal sharding.
   *
   * @type {ShardManager}
   * @private
   */
  readonly #ws: ShardManager;

  /**
   * The cache manager for resource caching.
   *
   * @type {CacheManager}
   * @private
   */
  readonly #data: DataHandler;

  /**
   * @param {ClientOptions} options The options for this instance.
   */
  public constructor(options: ClientOptions = {}) {
    super();

    if (options.token) {
      this.#token = options.token;
    }

    this.#rest = new API(options.rest);
    this.#ws = new ShardManager(options.ws);
    this.#data = new DataHandler(this, options.data);

    this.users = new UserPool(this);
    this.guilds = new GuildPool(this);
    this.relationships = new RelationshipPool(this);
    this.dms = new DMChannelPool(this);
    this.channels = new ChannelPool(this);
  }

  /**
   * The REST manager for communicating with Discords API.
   *
   * @type {API}
   */
  public get rest(): API {
    return this.#rest;
  }

  /**
   * The shard manager for internal sharding.
   *
   * @type {ShardManager}
   */
  public get ws(): ShardManager {
    return this.#ws;
  }

  /**
   * The cache manager for resource caching.
   *
   * @type {CacheManager}
   */
  public get caching(): CacheManager {
    return this.#data.caching;
  }

  /**
   * Handles data from discord.
   *
   * @type {DataHandler}
   */
  public get data(): DataHandler {
    return this.#data;
  }

  /**
   * Fetches the current user from discord.
   *
   * @returns {Promise<ClientUser>}
   */
  public async getSelf(): Promise<ClientUser> {
    const self = await this.rest.get<APIUser>("/users/@me");
    return this.user = new ClientUser(this, self);
  }

  /**
   * Connects the client to discord.
   * @param {string} token The token to use.
   *
   * @returns {Promise<Client>}
   */
  public async connect(token?: string): Promise<this> {
    token = token ?? this.#token;
    if (!token) {
      throw new Error("Please provide a token.");
    }

    this.#token = token;
    this.#ws.token = token;
    this.#rest.token = token;

    try {
      await this.#ws.connect();
      await this.#data.init();

      return this;
    } catch (e) {
      this.destroy();
      throw e;
    }
  }

  /**
   * Listen for a client event.
   *
   * @param {string} event The event to listen for.
   * @param {Function} listener The event listener.
   */
  public on<K extends keyof ClientEvents>(
    event: K,
    listener: (...args: ClientEvents[K]) => void
  ): this {
    return super.addListener(event, listener as Listener);
  }


  /**
   * Destroys this client.
   *
   * @returns {void}
   */
  public destroy(): void {
    this.#ws.destroy();
    Timers.clear();
    this.#token = undefined;
  }
}

export type ClientEvents = {
  messageCreate: [ Message ]
  messageUpdate: [ Readonly<Message>, Message ];
  messageDelete: [ Readonly<Message> ];
  messageDeleteBulk: [ ({ id: string } | Readonly<Message>)[], TextBasedChannel ];

  typingStart: [ TextBasedChannel, Typing ]
  channelCreate: [ Channel ];
  channelDelete: [ Readonly<Channel> ];
  channelUpdate: [ Readonly<Channel>, Channel ];
  channelPinsUpdate: [ TextBasedChannel, Date | null ];

  inviteDelete: [ Readonly<Invite> ];
  inviteCreate: [ Invite ];

  roleCreate: [ Role ];
  roleDelete: [ Readonly<Role> ];
  roleUpdate: [ Readonly<Role>, Role ];

  guildCreate: [ Guild ];
  guildDelete: [ Readonly<Guild> ];
  guildUpdate: [ Readonly<Guild>, Guild ];
  guildMemberAdd: [ GuildMember ];
  guildMemberRemove: [ Readonly<GuildMember> ];
  guildMemberUpdate: [ Readonly<GuildMember>, GuildMember ];
  guildMembersChunk: [ Guild, GuildMembersChunk ];
  guildBanAdd: [ Ban ];
  guildBanRemove: [ Readonly<Ban> ];
  guildEmojisUpdate: [];
  guildIntegrationsUpdate: [ Guild ];

  raw: [ Payload, Shard ]
  ready: [];
  debug: [ string ];
  error: [ any, string | undefined ];
  warn: [ string | any ];
  rateLimited: [ { limit: number, method: string, url: string, } ];

  shardResumed: [ Shard, number ];
  shardError: [ Shard, any ];
  shardDisconnect: [ Shard ];
  shardReconnecting: [ Shard, import("ws").CloseEvent ];
  shardReady: [ Shard, Set<string> ];

  userUpdate: [ User ];
  presenceUpdate: [ Readonly<Presence>, Presence ];
  voiceStateUpdate: [ VoiceState ];
};

interface ClientOptions {
  token?: string;
  rest?: APIOptions;
  ws?: ShardManagerOptions;
  data?: DataOptions;
}
