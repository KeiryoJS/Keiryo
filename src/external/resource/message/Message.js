/*
 * Copyright (c) 2020. MeLike2D & aesthetical All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Resource } from "../../abstract/Resource";
import { MessageFlags } from "@neocord/utils";

import { User } from "../user/User";
import { Member } from "../member/Member";

import { resources } from "../Resources";

export class Message extends Resource {
  /**
   * Creates a new instance of a Discord Message.
   * @param {Client} client
   * @param {Object} data
   */
  constructor(client, data) {
    super(client);

    /**
     * The ID of the message
     * @type {string}
     */
    this.id = data.id;
    this._patch(data);
  }

  /**
   * Update this message
   * @param {Object} data
   */
  _patch(data) {
    /**
     * The message nonce
     * @type {string}
     */
    this.nonce = data.nonce;

    /**
     * The content of the message
     * @type {string | null}
     */
    this.content = data.content;

    /**
     * The embeds if any
     * @type {Object[]}
     */
    this.embeds = data.embeds ?? [];

    /**
     * The files attached to the message
     * @type {Object[]}
     */
    this.attachments = data.attachments ?? [];

    /**
     * The message mentions
     * @type {Mentions}
     */
    this.mentions = {
      /**
       * If the message includes @here or @everyone
       * @type {boolean}
       */
      everyone: data.mention_everyone ?? false,

      /**
       * Every role mention in the message
       * @type {string[]}
       */
      roles: data.mention_roles ?? [],

      /**
       * All of the other mentions
       * @type {string[]}
       */
      other: data.mentions ?? [],
    };

    /**
     * If the message is a text to speech message
     * @type {boolean}
     */
    this.tts = data.tts ?? false;

    /**
     * If the message has been pinned to the channel.
     * @type {boolean}
     */
    this.pinned = data.pinned ?? false;

    /**
     * When the message was created
     * @type {number}
     */
    this.sentAt = new Date(data.timestamp).getTime();

    /**
     * When and if the message was edited
     * @type {number | null}
     */
    this.editedAt = data.edited_timestamp
      ? new Date(data.edited_timestamp).getTime()
      : null;

    /**
     * The author that sent the message
     * @type {User}
     */
    this.author = new (resources.get("User"))(this.client, data.author);

    if (Reflect.has(data, "member")) {
      /**
       * The member who sent the message
       * @type {Member}
       */
      this.member = new (resources.get("Member"))(this.client, {
        ...data.member,
        user: this.author,
      });
    }

    /**
     * The type of message
     * @type {number}
     */
    this.type = data.type;

    /**
     * The flags of the message
     * @type {MessageFlags}
     */
    this.flags = new MessageFlags(data.flags ?? 0);
  }
}

/**
 * @typedef {Object} Mentions
 * @prop {boolean} [everyone=false]
 * @prop {string[]} [roles=[]]
 * @prop {string[]} [other=[]]
 */
