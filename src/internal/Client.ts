import { ShardManager, ShardManagerOptions, SMEvent } from "@neocord/gateway";
import { Emitter, Timers } from "@neocord/utils";
import { API, APIEvent, APIOptions } from "@neocord/rest";
import { DataManager, DataOptions } from "./data/DataManager";
import {
  ChannelManager,
  DMChannelManager,
  GuildManager,
  InviteManager,
  UserManager,
} from "../managers";

import type { ClientUser } from "../structures/other/ClientUser";
import type { Message } from "../structures/message/Message";

export class Client extends Emitter {
  /**
   * All cached guilds for the current session.
   * @type {GuildManager}
   */
  public readonly guilds: GuildManager;

  /**
   * All cached users for the current session.
   * @type {UserManager}
   */
  public readonly users: UserManager;

  /**
   * All cached channels for the current session.
   * @type {ChannelManager}
   */
  public readonly channels: ChannelManager;

  /**
   * All cached DMs for the current session.
   * @type {DMChannelManager}
   */
  public readonly dms: DMChannelManager;

  /**
   * The manager for discord invites.
   * @type {InviteManager}
   */
  public readonly invites: InviteManager;

  /**
   * The current user.
   * @type {?ClientUser}
   */
  public user?: ClientUser;

  /**
   * The token of this client.
   * @type {?string}
   */
  public token?: string;

  /**
   * When the client last became ready.
   * @type {?number}
   */
  public readyAt?: number;

  /**
   * The internal sharding manager for this client.
   * @type {ShardManager}
   */
  private readonly _ws!: ShardManager;

  /**
   * An interface for the discord api and cdn.
   * @type {API}
   */
  private readonly _api!: API;

  /**
   * The data manager for this client.
   * @type {DataManager}
   * @private
   */
  private readonly _data!: DataManager;

  /**
   * Creates a new Client.
   * @param {ClientOptions} options The options.
   */
  public constructor(options: ClientOptions = {}) {
    super();

    Object.defineProperty(this, "_ws", {
      value: new ShardManager(options.ws),
      enumerable: false,
      configurable: false,
    });

    Object.defineProperty(this, "_api", {
      value: new API(options.rest),
      enumerable: false,
      configurable: false,
    });

    Object.defineProperty(this, "_data", {
      value: new DataManager(this, options.data),
      enumerable: false,
      configurable: false,
    });

    this.guilds = new GuildManager(this);
    this.users = new UserManager(this);
    this.channels = new ChannelManager(this);
    this.dms = new DMChannelManager(this);
    this.invites = new InviteManager(this);

    this._pass();
  }

  /**
   * The shard manager for this client.
   * @type {ShardManager}
   */
  public get ws(): ShardManager {
    return this._ws;
  }

  /**
   * The interface for the discord api and cdn.
   * @type {API}
   */
  public get api(): API {
    return this._api;
  }

  /**
   * The data manager for this client.
   * @type {DataManager}
   */
  public get data(): DataManager {
    return this._data;
  }

  /**
   * How long it has been since the client last became ready.
   * @type {?number}
   */
  public get uptime(): number | null {
    return this.readyAt ? Date.now() - this.readyAt : null;
  }

  /**
   * Connects the bot to the discord gateway.
   * @param {string} [token] The bot token.
   * @returns {Promise<Client>}
   */
  public async connect(token?: string): Promise<this> {
    if (!token) token = this.token;
    if (!token) throw new Error("Please provide a token.");

    Object.defineProperty(this, "token", { value: token, writable: true });
    this._ws.token = token;
    this._api.token = token;

    try {
      await this._data.init();
      await this._ws.connect();

      return this;
    } catch (e) {
      this.destroy();
      throw e;
    }
  }

  /**
   * Destroys this client.
   * @returns {void}
   */
  public destroy(): void {
    this._ws.destroy();
    Timers.clear();
    this.token = undefined;
  }

  /**
   * Listen for a client event.
   * @param {string} event The event to listen for.
   * @param {Function} listener The event listener.
   */
  public on<K extends keyof ClientEvents>(
    event: K,
    listener: ClientEvents[K]
  ): this {
    return super.on(event, listener);
  }

  /**
   * Listens for all events on the websocket and emits them on the client.
   * @private
   */
  private _pass(): void {
    this._ws.on(SMEvent.Ready, () => (this.readyAt = Date.now()));
    for (const evt of Object.values(SMEvent)) {
      this._ws.on(evt, (...args) => this.emit(evt, ...args));
    }

    for (const evt of Object.values(APIEvent))
      this._api.on(evt, (...args) => this.emit(evt, ...args));
  }
}

export type ClientEvents = {
  messageCreate: (message: Message) => void;
  messageUpdate: (old: Readonly<Message>, updated: Message) => void;
  debug: (message: string) => void;
  error: (error: any, message: string | undefined) => void;
} & Record<"ready" | string, (...args: any[]) => void>;

export interface ClientOptions {
  /**
   * Options for the sharding manager.
   */
  ws?: ShardManagerOptions;

  /**
   * Options for the REST manager.
   */
  rest?: APIOptions;

  /**
   * Options for data.
   */
  data?: DataOptions;
}
