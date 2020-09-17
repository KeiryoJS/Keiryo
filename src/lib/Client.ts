import {
  GatewayEvent,
  ISMEvent,
  ISMOptions,
  ShardManager,
} from "@neocord/gateway";
import { Emitter, Timers } from "@neocord/utils";
import { API, APIEvent, APIOptions } from "@neocord/rest";
import { Handlers } from "./handler/Helper";
import {
  ChannelManager,
  DMChannelManager,
  GuildManager,
  UserManager,
} from "../managers";

import type { ClientUser } from "../structures/other/ClientUser";
import type { Message } from "../structures/message/Message";

export class Client extends Emitter {
  /**
   * All cached guilds for the current session.
   */
  public readonly guilds: GuildManager;

  /**
   * All cached users for the current session.
   */
  public readonly users: UserManager;

  /**
   * All cached channels for the current session.
   */
  public readonly channels: ChannelManager;

  /**
   * All cached DMs for the current session.
   */
  public readonly dms: DMChannelManager;

  /**
   * The current user.
   */
  public user?: ClientUser;

  /**
   * The token of this client.
   */
  public token!: string;

  /**
   * The internal sharding manager for this client.
   */
  private readonly _ws!: ShardManager;

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

    this.guilds = new GuildManager(this);
    this.users = new UserManager(this);
    this.channels = new ChannelManager(this);
    this.dms = new DMChannelManager(this);

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
    for (const evt of Object.values(ISMEvent))
      this._ws.on(evt, (...args) => this.emit(evt, ...args));

    for (const evt of Object.values(APIEvent))
      this._api.on(evt, (...args) => this.emit(evt, ...args));
  }
}

export type ClientEvents = {
  messageCreate: (message: Message) => void;
  debug: (message: string) => void;
} & Record<"ready", () => void>;

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
