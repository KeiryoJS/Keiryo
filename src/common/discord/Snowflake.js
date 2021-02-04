/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

const EPOCH = 1420070400000;
let INCREMENT = 0;

export class Snowflake {
  /**
   * Transforms an ID into binary.
   * @param {snowflake} snowflake The ID to transform.
   * @return {string}
   */
  static toBinary(snowflake) {
    let binary = "",
      high = parseInt(snowflake.slice(0, -10)) || 0,
      low = parseInt(snowflake.slice(-10)) || 0;

    while (low > 0 || high > 0) {
      binary = String(low & 1) + binary;
      low = Math.floor(low / 2);
      if (high > 0) {
        low += 5000000000 * (high % 2);
        high = Math.floor(high / 2);
      }
    }

    return binary.trim();
  }

  /**
   * Transforms an ID from binary to a decimal string.
   * @param {string} binary The binary string to be transformed.
   * @returns {string}
   */
  static fromBinary(binary) {
    let decimal = "";

    while (binary.length > 50) {
      const high = parseInt(binary.slice(0, -32), 2),
        low = parseInt((high % 20).toString(2) + binary.slice(-32), 2);

      decimal = (low % 10).toString() + decimal;
      binary =
        Math.floor(high / 10).toString(2) +
        Math.floor(low / 10)
          .toString(2)
          .padStart(32, "0");
    }

    let bin = parseInt(binary, 2);
    while (bin > 0) {
      decimal = (bin % 10).toString() + decimal;
      bin = Math.floor(bin / 10);
    }

    return decimal.trim();
  }

  /**
   * Deconstructs a Discord Snowflake.
   * @param {snowflake} snowflake
   * @param {number} epoch The epoch to use when deconstructing.
   * @returns {DeconstructedSnowflake}
   */
  static deconstruct(snowflake, epoch = EPOCH) {
    const binary = Snowflake.toBinary(snowflake).padStart(64, "0");

    return {
      timestamp: parseInt(binary.substring(0, 42), 2) + epoch,
      workerId: parseInt(binary.substring(42, 47), 2),
      processId: parseInt(binary.substring(47, 52), 2),
      increment: parseInt(binary.substring(52, 64), 2),
      binary
    };
  }

  /**
   * Generates a new snowflake.
   * @param {GenerateSnowflakeOptions} options The options to use when generating a snowflake.
   * @returns {snowflake}
   */
  static generate({ epoch = EPOCH, timestamp = Date.now() } = {}) {
    if (epoch instanceof Date) {
      epoch = epoch.getTime();
    }

    if (timestamp instanceof Date) {
      timestamp = timestamp.getTime();
    }

    if (INCREMENT >= 4095) {
      INCREMENT = 0;
    }

    const binary = `${(timestamp - epoch)
      .toString(2)
      .padStart(42, "0")}0000100000${(++INCREMENT)
      .toString(2)
      .padStart(12, "0")}`;

    return Snowflake.fromBinary(binary.trim());
  }
}

/**
 * A Twitter snowflake, except the default epoch is 2015-01-01T00:00:00.000Z
 *
 * ```
 * If we have a snowflake '266241948824764416' we can represent it as binary:
 *
 * 64                                          22     17     12          0
 *  000000111011000111100001101001000101000000  00001  00000  000000000000
 *           number of ms since epoch           worker  pid    increment
 * ```
 * @typedef {string} snowflake
 */

/**
 * @typedef {Object} GenerateSnowflakeOptions
 * @prop {Date | number} [timestamp] The timestamp to use.
 * @prop {Date | number} [epoch] The EPOCH to use.
 */

/**
 * @typedef {Object} DeconstructedSnowflake
 * @prop {string} binary
 * @prop {number} timestamp
 * @prop {number} workerId
 * @prop {number} processID
 * @prop {number} increment
 */
