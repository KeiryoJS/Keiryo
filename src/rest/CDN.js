/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { IMAGE_FORMATS, IMAGE_SIZES } from "./constants";

export class CDN {
  /**
   * @param {string} url The URL to use.
   */
  constructor(url) {
    /**
     * The URL of the discord cdn.
     * @type {string}
     */
    this.url = url.replace(/\/*$/m, "");
  }

  /**
   * Generates an app asset URL for a client's asset.
   * @param {string} clientId The client ID that has the asset.
   * @param {string} assetHash The hash provided by Discord for this asset.
   * @param {ImageURLOptions} [options={}] Optional options for the asset.
   *
   * @returns {string} The app asset url.
   */
  appAsset(clientId, assetHash, options) {
    return this.makeURL(`/app-assets/${clientId}/${assetHash}`, options);
  }


  /**
   * Generates an app icon URL for a client's icon.
   * @param {string} clientId The client ID that has the icon.
   * @param {string} iconHash The hash provided by Discord for this icon.
   * @param {ImageURLOptions} [options={}] Optional options for the icon.
   * @returns {string} The app icon url.
   */
  appIcon(
    clientId,
    iconHash,
    options = {}
  ) {
    return this.makeURL(`/app-icons/${clientId}/${iconHash}`, options);
  }

  /**
   * Generates the default avatar URL for a discriminator.
   * @param {string} discriminator The users discriminator.
   * @returns {string} Link to the default avatar.
   */
  defaultAvatar(discriminator) {
    return this.makeURL(`/embed/avatars/${~~discriminator % 5}`);
  }

  /**
   * Generates a discovery splash URL for a guild's discovery splash.
   * @param {string} guildId The guild ID that has the discovery splash.
   * @param {string} splashHash The hash provided by Discord for this splash.
   * @param {ImageURLOptions} [options={}] Optional options for the splash.
   * @returns {string} Link to the discovery splash for the guild.
   */
  discoverySplash(
    guildId,
    splashHash,
    options = {}
  ) {
    return this.makeURL(
      `/discovery-splashes/${guildId}/${splashHash}`,
      options
    );
  }

  /**
   * Generates an emoji's URL for an emoji.
   * @param {string} emojiId The emoji ID.
   * @param {string} [extension] The extension of the emoji.
   * @returns {string} URL to the emoji.
   */
  emoji(emojiId, extension) {
    return this.makeURL(`/emojis/${emojiId}`, { format: extension });
  }

  /**
   * Generates a group DM icon URL for a group DM.
   * @param {string} channelId The group channel ID that has the icon.
   * @param {string} iconHash The hash provided by Discord for this group DM channel.
   * @param {ImageURLOptions} [options={}] Optional options for the icon.
   * @returns {string} URL to the group dm icon.
   */
  groupDMIcon(channelId, iconHash, options = {}) {
    return this.makeURL(`/channel-icons/${channelId}/${iconHash}`, options);
  }

  /**
   * Generates a banner URL for a guild's banner.
   * @param {string} guildId The guild ID that has the banner splash.
   * @param {string} bannerHash The hash provided by Discord for this banner.
   * @param {ImageURLOptions} [options={}] Optional options for the banner.
   * @returns {string} URL to the guild banner.
   */
  guildBanner(guildId, bannerHash, options = {}) {
    return this.makeURL(`/banners/${guildId}/${bannerHash}`, options);
  }

  /**
   * Generates an icon URL for a guild's icon.
   * @param {string} guildId The guild ID that has the icon splash.
   * @param {string} iconHash The hash provided by Discord for this icon.
   * @param {ImageURLOptions} [options={}] Optional options for the icon.
   * @returns {string} URL to the guild icon.
   */
  guildIcon(guildId, iconHash, options = {}) {
    return this.makeURL(`/icons/${guildId}/${iconHash}`, options);
  }

  /**
   * Generates a guild invite splash URL for a guild's invite splash.
   * @param {string} guildId The guild ID that has the invite splash.
   * @param {string} splashHash The hash provided by Discord for this splash.
   * @param {ImageURLOptions} [options={}] Optional options for the splash.
   * @returns {string} URL to the guild splash.
   */
  splash(guildId, splashHash, options = {}) {
    return this.makeURL(`/splashes/${guildId}/${splashHash}`, options);
  }

  /**
   * Generates a team icon URL for a team's icon.
   * @param {string} teamId The team ID that has the icon.
   * @param {string} iconHash The hash provided by Discord for this icon.
   * @param {ImageURLOptions} [options={}] Optional options for the icon.
   */
  teamIcon(teamId, iconHash, options = {}) {
    return this.makeURL(`/team-icons/${teamId}/${iconHash}`, options);
  }

  /**
   * Generates a user avatar URL for a user's avatar.
   * @param {string} userId The user ID that has the icon.
   * @param {string} avatarHash The hash provided by Discord for this avatar.
   * @param {ImageURLOptions} [options={}] Optional options for the avatar.
   */
  userAvatar(userId, avatarHash, { dynamic = false, ...options } = {}) {
    if (dynamic) {
      options.format = avatarHash.startsWith("a_") ? "gif" : options.format;
    }

    return this.makeURL(`/avatars/${userId}/${avatarHash}`, options);
  }

  /***
   * Constructs the URL for the CDN resource.
   * @param {string} endpoint
   * @param {ImageURLOptions} options
   * @returns {string}
   */
  makeUrl(endpoint, { format = "png", size } = {}) {
    format = String(format).toLowerCase();
    endpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

    if (format && !IMAGE_FORMATS.includes(format)) {
      throw new TypeError(`Invalid format provided: "${format}"`);
    }

    if (size && !IMAGE_SIZES.includes(size)) {
      throw new RangeError(`Invalid size provided: "${format}"`);
    }

    let url = `${this.url}${endpoint}`;
    if (size) {
      url += `?size=${size}`;
    }

    return url;
  }

}

/**
 * @typedef {"jpg" | "jpeg" | "png" | "webp" | "gif"} ImageFormat
 */

/**
 * @typedef {16 | 32 | 64 | 128 | 256 | 512 | 1024 | 2048 | 4096} ImageSize
 */

/**
 * @typedef {Object} ImageURLOptions
 * @property {boolean} [dynamic=false]
 * @property {ImageSize} [size]
 * @property {ImageFormat} [format="png"]
 */
