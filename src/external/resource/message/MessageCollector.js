import { EventEmitter } from "events";

import { Client } from "../../../client/Client";
import { Message } from "./Message";

export class MessageCollector extends EventEmitter {
  /**
   * Creates a new instance of a message collector
   * @param {Client} client
   * @param {Message} message
   * @param {((msg: Message) => boolean)} filter
   * @param {MessageCollectorOptions} options
   *
   */
  constructor(client, message, filter, options) {
    super();

    options.limit = options.limit ?? 1;

    this.options = options;
    this.client = client;
    this.message = message;
    this.filter = filter;

    this.messages = new Map();

    this.onMessage = this.onMessage.bind(this);

    client.on("messageCreate", this.onMessage);

    const timeout = setTimeout(
      () => this.emit("finished", this.messages),
      options.time
    );

    this.once("finished", () => {
      clearTimeout(timeout);
      client.removeListener("messageCreate", this.onMessage);
    });
  }

  /**
   * When the message event is emitted
   * @param {Message} message
   */
  onMessage(message) {
    if (
      this.message.channelID !== message.channelID ||
      message.id === this.message.id ||
      message.author.bot
    ) {
      return;
    }

    if (this.filter(message)) {
      this.messages.set(message.id, message);

      if (this.messages.size >= this.options.limit) {
        return this.emit("finished", this.messages);
      }
    }
  }
}

/**
 * @typedef {Object} MessageCollectorOptions
 * @prop {number} [limit] The amount of messages to collect
 * @prop {number} time The amount of time to collect messages for
 */
