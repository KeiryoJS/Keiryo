/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

export class WelcomeChannel {
  /**
   * @param {WelcomeScreen } welcomeScreen The welcome screen.
   * @param {Object} data The welcome channel data.
   */
  constructor(welcomeScreen, data) {
    this.welcomeScreen = welcomeScreen;

    this.channelId = data.channel_id;
    this.emojiId = data.emoji_id;
    this.emojiName = data.emoji_name;
  }

  /**
   * The guild this welcome channel belongs to.
   * @return {Guild}
   */
  get guild() {
    return this.welcomeScreen.guild;
  }

  /**
   * The channel this welcome channel represents.
   * @type {TextBasedChannel}.
   */
  get channel() {
    return this.guild.channels.get(this.channelId);
  }
}