/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { has } from "@neocord/utils";
import { parse } from "path";
import { Color, ColorResolvable } from "./constants";

export function makeSafeQuery(dict: Dictionary): Dictionary<string> {
  const obj: Dictionary<string> = {};
  for (const [k, v] of Object.entries(dict))
    if (has(v, "toString")) obj[k] = v.toString();

  return obj;
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
 * Returns an object without the provided keys.
 * @param {Dictionary} obj The object.
 * @param {string[]} keys The keys to exclude.
 */
export function exclude<O extends Dictionary, K extends keyof O>(
  obj: O,
  ...keys: K[]
): Omit<O, K> {
  const o: Dictionary = {};
  for (const key of Object.keys(obj)) {
    if (!keys.includes(key as K)) {
      o[key] = obj[key];
    }
  }

  return o as O;
}

/**
 * Alternative to Node's `path.basename`, removing query string after the extension if it exists.
 * @param {string} path Path to get the basename of
 * @param {string} [ext] File extension to remove
 * @see https://github.com/discordjs/discord.js/blob/master/src/util/Util.js#L483-L493
 */
export function basename(path: string, ext?: string): string {
  const res = parse(path);
  return ext && res.ext.startsWith(ext) ? res.name : res.base.split("?")[0];
}
