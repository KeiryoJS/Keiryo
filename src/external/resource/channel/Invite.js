/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Resource } from "../../abstract/Resource";

export class Invite extends Resource {
  /**
   * @param {Client} client The client instance.
   * @param {Object} data The invite data.
   * @param {InvitableChannel} channel The channel that this invite points to.
   */
  constructor(client, data, channel) {
    super(client);

    /**
     * This invite's code (unique id).
     * @type {string}
     */
    this.code = data.code;

    /**
     * The channel this invite belongs to.
     * @type {InvitableChannel}
     */
    this.channel = channel;
  }

  /**
   * The identifier for this invite.
   * @return {string}
   */
  get id() {
    return this.code;
  }

  _patch(data) {
    if (Reflect.has(data, "created_at")) {
      /**
       * When this invite was created.
       * @type {number|null}
       */
      this.createdTimestamp = data.created_at
        ? Date.parse(data.created_at)
        : null;
    }

    if (Reflect.has(data, "max_age")) {
      /**
       * Duration (in seconds) after which the invite expires
       * @type {number|null}
       */
      this.maxAge = data.max_age ?? null;
    }

    if (Reflect.has(data, "max_uses")) {
      /**
       * Max number of times this invite can be used.
       * @type {number|null}
       */
      this.maxUses = data.max_uses ?? null;
    }

    if (Reflect.has(data, "temporary")) {
      /**
       * Whether this invite only grants temporary membership.
       * @type {boolean}
       */
      this.temporary = data.temporary ?? false;
    }

    if (Reflect.has(data, "uses")) {
      /**
       * Number of times this invite has been used.
       * @type {number}
       */
      this.uses = data.uses ?? 0;
    }

    if (Reflect.has(data, "inviter")) {
      /**
       * The user who created the invite.
       * @type {?User}
       */
      this.inviter = this.client.users.add(data.inviter);
    }

    if (Reflect.has(data, "target_user")) {
      /**
       * The target user for this invite.
       * @type {?User}
       */
      this.targetUser = this.client.users.add(data.target_user);
    }

    /**
     * Approximate count of total members.
     * @type {number | null}
     */
    this.approximateMemberCount = data.approximate_member_count ?? null;

    /**
     * Approximate count of online members (only present when target_user is set)
     * @type {number | null}
     */
    this.approximatePresenceCount = data.approximate_presence_count ?? null;

    /**
     * The type of user target for this invite.
     * @type {TargetUserType | null}
     */
    this.targetUserType = data.target_user_type ?? null;

    return this;
  }
}

/**
 * @typedef {TextChannel | VoiceChannel} InvitableChannel
 */
