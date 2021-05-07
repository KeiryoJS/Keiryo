/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { BitField, BitFieldObject } from "./BitField";
import { humanizeEnumKey } from "../Functions";

export enum Permission {
  CREATE_INSTANT_INVITE = 1 << 0,
  KICK_MEMBERS = 1 << 1,
  BAN_MEMBERS = 1 << 2,
  ADMINISTRATOR = 1 << 3,
  MANAGE_CHANNELS = 1 << 4,
  MANGE_GUILD = 1 << 5,
  ADD_REACTIONS = 1 << 6,
  VIEW_AUDIT_LOG = 1 << 7,
  PRIORITY_SPEAKER = 1 << 8,
  STREAM = 1 << 9,
  VIEW_CHANNEL = 1 << 10,
  SEND_MESSAGES = 1 << 11,
  SEND_TTS_MESSAGE = 1 << 12,
  MANAGE_MESSAGES = 1 << 13,
  EMBED_LINKS = 1 << 14,
  ATTACH_FILES = 1 << 15,
  READ_MESSAGE_HISTORY = 1 << 16,
  MENTION_EVERYONE = 1 << 17,
  USE_EXTERNAL_EMOJIS = 1 << 18,
  VIEW_GUILD_INSIGHTS = 1 << 19,
  CONNECT = 1 << 20,
  SPEAK = 1 << 21,
  MUTE_MEMBERS = 1 << 22,
  DEAFEN_MEMBERS = 1 << 23,
  MOVE_MEMBERS = 1 << 24,
  USE_VAD = 1 << 25,
  CHANGE_NICKNAME = 1 << 26,
  MANAGE_NICKNAMES = 1 << 27,
  MANGE_ROLES = 1 << 28,
  MANAGE_WEBHOOKS = 1 << 29,
  MANAGE_EMOJIS = 1 << 30,
  USE_SLASH_COMMANDS = 1 <<31,
  REQUEST_TO_SPEAK = 1 << 32,
  MANAGE_THREADS = 1 << 34,
  USE_PUBLIC_THREADS = 1 << 35,
  USE_PRIVATE_THREADS = 1 << 36
}

export class Permissions extends BitField<PermissionResolvable> {
  /**
   * All Permission Flags.
   *
   * @type {Permission}
   */
  public static FLAGS = Permission;

  /**
   * The default permissions for a role.
   *
   * @type {number}
   */
  public static DEFAULT = 104320577;

  /**
   * Permissions that can't be influenced by channel overwrites, even if explicitly set.
   *
   * @type {number}
   */
  public static GUILD_SCOPE_PERMISSIONS = 1275592878;

  /**
   * Makes a permission name more readable.
   *
   * @param {Permission} permission The permission.
   * @returns {boolean}
   */
  public static humanize(permission: Permission): string {
    if (permission === Permission.USE_VAD) return "Use Voice Activity";
    if (permission === Permission.SEND_TTS_MESSAGE) return "Send TTS Messages";
    return humanizeEnumKey(Permission[permission]);
  }

  /**
   * Checks whether the bitfield has a permission, or any of multiple permissions.
   *
   * @param {PermissionResolvable} permission Permission(s) to check for.
   * @param {boolean} [checkAdmin] Whether to allow the administrator permission to override.
   * @returns {boolean}
   */
  public any(permission: PermissionResolvable, checkAdmin = true): boolean {
    return (
      (checkAdmin && super.has(Permission.ADMINISTRATOR)) ||
      super.any(permission)
    );
  }

  /**
   * Checks whether the bitfield has a permission, or multiple permissions.
   *
   * @param {PermissionResolvable} permission Permission(s) to check for.
   * @param {boolean} [checkAdmin] Whether to allow the administrator permission to override.
   * @returns {number}
   */
  public has(permission: PermissionResolvable, checkAdmin = true): boolean {
    return (
      (checkAdmin && super.has(Permission.ADMINISTRATOR)) ||
      super.has(permission)
    );
  }
}

type PermissionBit =
  | Permission
  | keyof typeof Permission
  | number
  | BitFieldObject;

export type PermissionResolvable = PermissionBit | PermissionBit[];
