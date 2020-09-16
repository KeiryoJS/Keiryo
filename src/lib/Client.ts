import { GatewayEvent, ISMEvent, ISMOptions, ShardManager } from "@neocord/gateway";
import { Emitter, Timers } from "@neocord/utils";
import { API, APIEvent, APIOptions } from "@neocord/rest";
import { Handlers } from "./handler/Helper";

import { UserManager } from "../managers/UserManager";
import { GuildManager } from "../managers/GuildManager";

import type { ClientUser } from "../structures/other/ClientUser";

export class Client extends Emitter {
  /**
   * All cached guilds for the current user.
   */
  public readonly guilds: GuildManager;

  /**
   * All cached users for the current session.
   */
  public readonly users: UserManager;

  /**
   * The current user.
   */
  public user?: ClientUser

  /**
   * The token of this client.
   */
  public token!: string;

  /**
   * The internal sharding manager for this client.
   */
  private readonly _ws!: ShardManager;

  /**
   * The caching manager.
   * @private
   */
  // private readonly _caching!: CachingManager;

  /**
   * An interface for the discord api and cdn.
   */
  private readonly _api!: API;

  /**
   * Handles the received packets on all shards.
   * @private
   */
  private readonly _handlers!: Handlers;

  /**
   * Creates a new Client.
   * @param options
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

    Object.defineProperty(this, "_handlers", {
      value: new Handlers(this),
      enumerable: false,
      configurable: false,
    });

    // Object.defineProperty(this, "_caching", {
    //   value: new CachingManager(this, options.caching),
    //   enumerable: false,
    //   configurable: false,
    // });

    this.guilds = new GuildManager(this);
    this.users = new UserManager(this);

    this._pass();
  }

  /**
   * The internal sharding manager instance.
   */
  public get ws(): ShardManager {
    return this._ws;
  }

  /**
   * An interface for the discord api and cdn.
   */
  public get api(): API {
    return this._api;
  }

  /**
   * The caching manager for this client.
   */
  // public get caching(): CachingManager {
  //   return this._caching;
  // }

  /**
   * Connects the bot to the discord gateway.
   */
  public async connect(token: string = this.token): Promise<this> {
    if (!token) throw new Error("Please provide a token.");

    Object.defineProperty(this, "token", { value: token });
    this._ws.token = token;
    this._api.token = token;

    try {
      await this._handlers.init();
      await this._ws.connect();
      return this;
    } catch (e) {
      this.destroy();
      throw e;
    }
  }

  /**
   * Destroys this client.
   */
  public destroy(): void {
    this._ws.destroy();
    Timers.clear();
  }

  /**
   * Listens for all events on the websocket and emits them on the client.
   * @private
   */
  private _pass(): void {
    for (const evt of Object.values(ISMEvent))
      this._ws.on(evt, (...args) => this.emit(evt, ...args));

    for (const evt of Object.values(APIEvent))
      this._api.on(evt, (...args) => this.emit(evt, ...args));
  }
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
   * Options for caching.
   */
  // caching?: CachingOptions;

  /**
   * Tracks how many times a certain event is received.
   */
  track?: GatewayEvent[] | "all" | boolean;
}
