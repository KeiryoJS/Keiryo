/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { array, Collection } from "@neocord/utils";
import { URLSearchParams } from "url";
import { ResourceLike, ResourcePool, ResourceType } from "../../abstract";
import { resources } from "../../resource/Resources";
import { makeSafeQuery } from "../../../utils";

import type { RESTGetAPIGuildMembersResult } from "discord-api-types";
import type { GuildMember } from "../../resource/guild/member/GuildMember";
import type { Guild } from "../../resource/guild/Guild";
import type { User } from "../../resource/user/User";
import type { BanOptions } from "./GuildBanPool";

export class GuildMemberPool extends ResourcePool<GuildMember> {
  /**
   * The guild that this member pool belongs to.
   *
   * @type {Guild}
   * @private
   */
  readonly #guild: Guild;

  /**
   * @param {Guild} guild The guild instance.
   */
  public constructor(guild: Guild) {
    super(guild.client, {
      class: resources.get("GuildMember"),
      resource: ResourceType.GuildMember
    });

    this.#guild = guild;
  }

  /**
   * The guild that this member pool belongs to.
   *
   * @type {Guild}
   */
  public get guild(): Guild {
    return this.#guild;
  }

  /**
   * Resolves something into a guild member {@link Member member}.
   * @param {MemberLike} item The data to resolve.
   *
   * @returns {Member | null} The resolved ID or null if nothing was found.
   */
  public resolve(item: MemberLike): GuildMember | null {
    let member = super.resolve(item);
    if (!member) {
      const user = this.client.users.resolve(item);
      if (user) member = super.resolve(user.id);
    }

    return member;
  }

  /**
   * Resolves something into an ID.
   * @param {MemberLike} data The data to resolve.
   *
   * @returns {string | null} The resolved ID or null if nothing was found.
   */
  public resolveId(data: MemberLike): string | null {
    let member = super.resolveId(data);
    if (!member) {
      const user = this.client.users.resolveId(data);
      if (user) member = user;
    }

    return member;
  }

  /**
   * Kicks a user from the {@link Guild}.
   * @param {MemberLike} member The {@link Member} or {@link User} to kick.
   * @param {string} [reason] The reason for kicking this {@link Member} or {@link User}.
   *
   * @returns {MemberLike} The kicked member.
   */
  public async kick(member: MemberLike, reason?: string): Promise<GuildMember | string> {
    const id = this.resolveId(member);
    if (!id) {
      throw new Error("Can't resolve an id.");
    }

    const ep = this.guild._ep(`/members/${id}`);
    return this.client.rest.delete(ep, { reason })
      .then(() => this.resolve(member) ?? id);
  }

  /**
   * Kicks a member or user from the {@link Guild}.
   * @param {MemberLike} member The {@link Member}/{@link User} to ban.
   * @param {BanOptions} [options] The ban options.
   *
   * @returns {Promise<MemberLike>} The banned {@link Member} or {@link User}.
   */
  public async ban<ML extends MemberLike>(member: ML, options?: BanOptions): Promise<ML> {
    await this.guild.bans.add(member, options);
    return member;
  }

  /**
   * Fetch a member from the discord api.
   * @param {string} id User ID of the member to fetch.
   * @param {boolean} [force] Whether to skip checking if the member is already cached.
   * @returns {Member} The fetched (or cached) member.
   */
  public fetch(id: string, force?: boolean): Promise<GuildMember>;

  /**
   * Fetch 1-1000 members from the guild.
   * @param {FetchMembers} options Options to use when fetching.
   * @returns {Collection<string, Member>} The fetched members.
   */
  public fetch(options?: FetchMembers): Promise<Collection<string, GuildMember>>;

  /**
   * Fetch members from the guild.
   * @param {FetchMembers} options Options to use when fetching.
   * @param {boolean} [force] Whether to skip checking if the member is already cached.
   *
   * @returns {Collection<string, Member>} The fetched members.
   */
  public async fetch(
    options: string | FetchMembers = {},
    force?: boolean
  ): Promise<Collection<string, GuildMember> | GuildMember> {
    if (typeof options === "string") {
      if (!force) {
        const cached = this.cache.get(options);
        if (cached) return cached;
      }

      const member = await this.client.rest.get(`/guilds/${this.guild.id}/${options}`);
      return this._add(member, this.guild);
    }

    const col = new Collection<string, GuildMember>();
    const members = await this.client.rest.get(`/guilds/${this.guild.id}/members`, {
      query: makeSafeQuery(options)
    });

    for (const _member of members as RESTGetAPIGuildMembersResult) {
      const member = this._add(_member, this.guild);
      col.set(member.id, member);
    }

    return col;
  }


  /**
   * Get the number of members that would be removed in a 'non-dry' prune.
   * @param {DryPruneOptions} options The options for the 'dry' prune.
   * @param {string} [reason] The audit-log reason.
   * @returns {Promise<number>} The number of members that would be removed in a 'non-dry' prune.
   */
  public prune(options: DryPruneOptions, reason?: string): Promise<number>;

  /**
   * Starts a member prune operation.
   * @param {PruneOptions} options Options for the prune operation.
   * @param {string} [reason] The audit-log reason.
   * @returns {Promise<number | null>} The number or removed members, only null if the 'computePruneCount' option was omitted or set to false.
   */
  public prune(options: PruneOptions, reason?: string): Promise<number | null>;

  /**
   * Start a (dry) member prune operation.
   * @param {PruneOptions} options Options for the prune operation.
   * @param {string} [reason] The audit-log reason.
   *
   * @returns {Promise<number | null>} The number or removed members, only null if the 'computePruneCount' option was omitted or set to false.
   */
  public async prune(
    options: DryPruneOptions | PruneOptions,
    reason?: string
  ): Promise<number | null> {
    const query = new URLSearchParams();

    // (0) append the 'days' query parameter.
    if (options.days) {
      options.days = Math.abs(options.days);
      if (options.days < 1) {
        options.days = 1;
      }

      query.append("days", options.days.toString());
    }

    // (1) append the 'include_roles' query parameter.
    if (options.includeRoles) {
      for (const role of array(options.includeRoles)) {
        query.append("include_roles", role);
      }
    }

    // (2) Check if this is the user wants a "dry" prune.
    if (options.dry) {
      const resp = await this.client.rest.get(`/guilds/${this.guild.id}/prune`, {
        query,
        reason
      });

      return resp.pruned;
    }

    // (3) append the 'compute_prune_count' query parameter.
    if (options.computePruneCount) {
      query.append("compute_prune_count", options.computePruneCount.toString());
    }

    const resp = await this.client.rest.post(`/guilds/${this.guild.id}/prune`, {
      query,
      reason
    });

    return resp.pruned;
  }

  /**
   * Creates a new guild member,
   * @param {Dictionary} data The member data.
   * @param {...args} args The arguments to pass.
   *
   * @protected
   */
  protected _create(data: Dictionary, ...args: any[]): GuildMember {
    return super._create(data, this.guild, ...args);
  }
}

export type MemberLike = ResourceLike<User | GuildMember>;

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
