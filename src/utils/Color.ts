/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

export enum Color {
  DEFAULT = 0x000000,
  WHITE = 0xffffff,
  AQUA = 0x1abc9c,
  GREEN = 0x2ecc71,
  BLUE = 0x3498db,
  YELLOW = 0xffff00,
  PURPLE = 0x0b59bc,
  LUMINOUS_VIVID_PINK = 0xe91e63,
  GOLD = 0xf1c40f,
  ORANGE = 0xe67e22,
  RED = 0xe74c3c,
  GREY = 0x95a5a6,
  NAVY = 0x34495e,
  DARK_AQUA = 0x11806a,
  DARK_GREEN = 0x1f8b4c,
  DARK_BLUE = 0x206694,
  DARK_PURPLE = 0x71368a,
  DARK_VIVID_PINK = 0xad1457,
  DARK_GOLD = 0xc27c0e,
  DARK_ORANGE = 0xa84300,
  DARK_RED = 0x992d22,
  DARK_GREY = 0x979c9f,
  Darker_GREY = 0x7f8c8d,
  LIGHT_GREY = 0xbcc0c0,
  DARK_NAVY = 0x2c3e50,
  BLURPLE = 0x7289da,
  GREYPLE = 0x99aab5,
  DARK_BUT_NOT_BLACK = 0x2c2f33,
  NOT_QUITE_BLACK = 0x23272a,
}

/**
 * Parses a hex code or integer to a hex integer.
 * @param {ColorResolvable} hex The hex code to parse.
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

/**
 * @typedef {Color | keyof Color | number | string | [number, number, number]} ColorResolvable
 */
export type ColorResolvable =
  | Color
  | keyof Color
  | number
  | string
  | [number, number, number];
