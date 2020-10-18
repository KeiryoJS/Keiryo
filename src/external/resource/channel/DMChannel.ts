import { APIChannel, ChannelType } from "discord-api-types";
import { Channel } from "./Channel";
import { resources } from "../Resources";

import type { Client } from "../../../client";
import type { TypingManager } from "./TypingManager";

export class DMChannel extends Channel {
  public readonly type = ChannelType.DM;

  /**
   * The typing manager.
   *
   * @type {?TypingManager}
   * @private
   */
  #typing?: TypingManager;

  /**
   * @param {Client}client
   * @param {APIChannel} data
   */
  public constructor(client: Client, data: APIChannel) {
    super(client, data);
  }

  /**
   * The typing manager.
   *
   * @type {TypingManager}
   */
  public get typing(): TypingManager {
    if (!this.#typing) {
      this.#typing = new (resources.get("TypingManager"))(this);
    }

    return this.#typing;
  }

}
