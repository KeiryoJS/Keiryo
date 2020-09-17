/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { array, Collection } from "@neocord/utils";
import { URLSearchParams } from "url";
import { BaseManager, BaseResolvable } from "./BaseManager";
import { neo } from "../structures/Extender";

import type {
  APIGuildMember,
  APIUser,
  RESTGetAPIGuildMembersResult,
} from "discord-api-types";
import type { User } from "../structures/other/User";
import type { Member } from "../structures/guild/Member";
import type { Guild } from "../structures/guild/Guild";
import type { BanOptions } from "./BanManager";

export class MemberManager extends BaseManager<Member> {
  /**
   * The guild this member manager belongs to.
   * @type {Guild}
   */
  public readonly guild: Guild;

  /**
   * Creates a new instanceof MemberManager.
   * @param {Guild} guild The guild instance.
   */
  public constructor(guild: Guild) {
    super(guild.client, neo.get("Member"));

    this.guild = guild;
  }

  /**
   * The total amount of members that can be cached at one point in time.
   * @type {number}
   */
  public get limit(): number {
    // todo: fetch member limit from the client.
    return Infinity;
  }

  /**
   * Resolves something into a guild member {@link Member member}.
   * @param {MemberResolvable} data The data to resolve.
   * @returns {Member | null} The resolved ID or null if nothing was found.
   */
  public resolve(data: MemberResolvable): Member | null {
    let member = super.resolve(data);
    if (!member) {
      const user = this.client.users.resolve(data);
      if (user) member = super.resolve(user.id);
    }

    return member;
  }

  /**
   * Resolves something into an ID.
   * @param {MemberResolvable} data The data to resolve.
   * @returns {string | null} The resolved ID or null if nothing was found.
   */
  public resolveId(data: MemberResolvable): string | null {
    let member = super.resolveId(data);
    if (!member) {
      const user = this.client.users.resolveId(data);
      if (user) member = user;
    }

    return member;
  }

  /**
   * Kicks a member or user from the {@link Guild guild}.
   * @param {MemberResolvable} target The {@link Member member} or {@link User user} to kick.
   * @param {string} [reason] The reason for the audit log entry.
   * @returns {Member | null} The kicked {@link Member member}.
   */
  public async kick(
    target: MemberResolvable,
    reason?: string
  ): Promise<Readonly<Member> | null> {
    const member = this.resolve(target);
    if (member) {
      await this.client.api.delete(
        `/guilds/${this.guild.id}/members/${member.id}`,
        {
          reason,
        }
      );

      return Object.freeze(member);
    }

    return null;
  }

  /**
   * Bans a member or user from the {@link Guild guild}.
   * @param {MemberResolvable} target The {@link Memberm member} or {@link User user} to ban.
   * @param {BanOptions} [options] The ban options.
   * @returns {Member | null} The banned {@link Member member}.
   */
  public async ban(
    target: MemberResolvable,
    options?: BanOptions
  ): Promise<MemberResolvable | null> {
    await this.guild.bans.new(target, options);
    return target;
  }

  /**
   * Fetch a member from the discord api.
   * @param {string} id User ID of the member to fetch.
   * @param {boolean} [force] Whether to skip checking if the member is already cached.
   * @returns {Member} The fetched (or cached) member.
   */
  public fetch(id: string, force?: boolean): Promise<Member>;
  /**
   * Fetch 1-1000 members from the guild.
   * @param {FetchMembers} options Options to use when fetching.
   * @returns {Collection<string, Member>} The fetched members.
   */
  public fetch(options?: FetchMembers): Promise<Collection<string, Member>>;
  public async fetch(
    options: string | FetchMembers = {},
    force?: boolean
  ): Promise<Collection<string, Member> | Member> {
    if (typeof options === "string") {
      if (!force && this.has(options)) return this.get(options) as Member;

      const member = await this.client.api.get<APIGuildMember>(
        `/guilds/${this.guild.id}/${options}`
      );
      return this._add(member);
    }

    const col = new Collection<string, Member>();
    const members = await this.client.api.get<RESTGetAPIGuildMembersResult>(
      `/guilds/${this.guild.id}/members`,
      {
        // @ts-ignore
        query: options,
      }
    );

    for (const _member of members) {
      const member = this._add(_member);
      col.set(member.id, member);
    }

    return col;
  }

  /**
   * Get the number of members that would be removed in a 'non-dry' prune.
   * @param {DryPruneOptions} options The options for the 'dry' prune.
   * @param {string} [reason] The audit-log reason.
   * @returns {number} The number of members that would be removed in a 'non-dry' prune.
   */
  public prune(options: DryPruneOptions, reason?: string): Promise<number>;
  /**
   * Starts a member prune operation.
   * @param {PruneOptions} options Options for the prune operation.
   * @param {string} [reason] The audit-log reason.
   * @returns {number | null} The number or removed members, only null if the 'computePruneCount' option was omitted or set to false.
   */
  public prune(options: PruneOptions, reason?: string): Promise<number | null>;
  public async prune(
    options: DryPruneOptions | PruneOptions,
    reason?: string
  ): Promise<number | null> {
    const query = new URLSearchParams();

    // append the 'days' query parameter.
    if (options.days) {
      options.days = Math.abs(options.days);
      if (options.days < 1) options.days = 1;
      query.append("days", options.days.toString());
    }

    // append the 'include_roles' query parameter.
    if (options.includeRoles) {
      for (const role of array(options.includeRoles))
        query.append("include_roles", role);
    }

    // Check if this is the user wants a "dry" prune.
    if (options.dry) {
      const resp = await this.client.api.get(`/guilds/${this.guild.id}/prune`, {
        query,
        reason,
      });

      return resp.pruned;
    }

    // append the 'compute_prune_count' query parameter.
    if (options.computePruneCount) {
      query.append("compute_prune_count", options.computePruneCount.toString());
    }

    const resp = await this.client.api.post(`/guilds/${this.guild.id}/prune`, {
      query,
      reason,
    });

    return resp.pruned;
  }

  /**
   * Adds a new member to this manager.
   * @private
   */
  protected _add(data: APIGuildMember): Member {
    const existing = this.get((data.user as APIUser).id);
    if (existing) return existing["_patch"](data);
    return this._set(new this._item(this.guild, data));
  }
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
