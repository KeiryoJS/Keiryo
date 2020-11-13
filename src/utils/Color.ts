/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

export enum Color {
  Default = 0x000000,
  White = 0xffffff,
  Aqua = 0x1abc9c,
  Green = 0x2ecc71,
  Blue = 0x3498db,
  Yellow = 0xffff00,
  Purple = 0x0b59bc,
  LuminousVividPink = 0xe91e63,
  Gold = 0xf1c40f,
  Orange = 0xe67e22,
  Red = 0xe74c3c,
  Grey = 0x95a5a6,
  Navy = 0x34495e,
  DarkAqua = 0x11806a,
  DarkGreen = 0x1f8b4c,
  DarkBlue = 0x206694,
  DarkPurple = 0x71368a,
  DarkVividPink = 0xad1457,
  DarkGold = 0xc27c0e,
  DarkOrange = 0xa84300,
  DarkRed = 0x992d22,
  DarkGrey = 0x979c9f,
  DarkerGrey = 0x7f8c8d,
  LightGrey = 0xbcc0c0,
  DarkNavy = 0x2c3e50,
  Blurple = 0x7289da,
  Greyple = 0x99aab5,
  DarkButNotBlack = 0x2c2f33,
  NotQuiteBlack = 0x23272a,
}

/**
 * Parses a hex code or integer to a hex integer.
 * @param {ColorResolvable} hex The hex code to parse.
 *
 * @returns {number}
 */
export function parseColor(hex: ColorResolvable): number {
  let color!: number;

  if (Array.isArray(hex)) color = (hex[0] << 16) + (hex[1] << 16) + hex[2];
  else if (typeof hex === "number") color = hex;
  else {
    if (hex === "RANDOM") return Math.floor(Math.random() * (0xffffff + 1));
    if (hex === "DEFAULT") return 0;
    // @ts-expect-error
    color = Color[hex] || parseInt(hex.replace("#", ""), 16);
  }

  if (color < 0 || color > 0xffffff) throw new RangeError();
  else if (color && isNaN(color)) throw new TypeError();

  return color;
}

export type ColorResolvable =
  | Color
  | keyof Color
  | number
  | string
  | [number, number, number];
