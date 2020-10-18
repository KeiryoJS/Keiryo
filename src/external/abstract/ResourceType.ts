/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

/**
 * Used for identifying different types of resources.
 */
export enum ResourceType {
  User,
  Channel,
  Message,
  Guild,
  GuildMember,
  VoiceState,
  Presence,
  Ban,
  Integration,
  Role,
  Relationship,
  PermissionOverwrite,
  GuildChannel,
  DMChannel
}

export const resourceTypes = Object.values(ResourceType) as ResourceType[];
