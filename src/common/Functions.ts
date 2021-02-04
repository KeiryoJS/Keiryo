/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Timers } from "./Timers";
import { parse } from "path";

export type Dictionary<V = any> = Record<string, V>;
export type PartialRecord<K extends string | number | symbol, V> = Partial<Record<K, V>>;
export type Tuple<A = any, B = any> = [ A, B ];

export function isInstalled(pkg: string): boolean {
  try {
    require(pkg);
    return true;
  } catch {
    return false;
  }
}

/**
 * A helper function for capitalizing the first letter in the sentence.
 *
 * @param {string} str
 * @param {boolean} [lowerRest=true]
 *
 * @returns {string}
 */
export function capitalize(str: string, lowerRest = true): string {
  const [ f, ...r ] = str.split("");
  return `${f.toUpperCase()}${
    lowerRest ? r.join("").toLowerCase() : r.join("")
  }`;
}


/**
 * Pauses the event loop for a set duration of time.
 *
 * @param {number} ms The duration in milliseconds.
 *
 * @returns {Promise<NodeJS.Timeout>}
 */
export function sleep(ms: number): Promise<NodeJS.Timeout> {
  return new Promise((r) => Timers.setTimeout(r, ms));
}

/**
 * Returns an object without the provided keys.
 *
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
 * Merges objects into one.
 * @param {Dictionary} objects The objects to merge.
 */
export function mergeObject<O extends Record<PropertyKey, any> = Record<PropertyKey, any>>(...objects: Partial<O>[]): O {
  const o: Record<PropertyKey, any> = {};
  for (const object of objects) {
    for (const key of Reflect.ownKeys(object)) {
      const def = Reflect.get(object, key);
      if (!Reflect.has(o, key)) {
        Reflect.set(o, key, def);
      } else {
        let cur = Reflect.get(o, key);
        if (typeof cur === "object") {
          cur = mergeObject(cur, def);
        } else if (cur instanceof Map) {
          for (const [ k, v ] of def) {
            if (!cur.has(k)) {
              cur.set(k, v);
            }
          }
        } else if (cur instanceof Set) {
          const _new = new Set([ ...cur, ...def ]);
          cur = _new;
        } else if (Array.isArray(cur)) {
          cur = cur.concat(def);
        }

        Reflect.set(o, key, cur);
      }
    }
  }

  return o as O;
}


/**
 * A helper function for determining whether or not a value is a promise,
 *
 * @param {any} input
 *
 * @returns {boolean} Whether the input was a promise.
 */
export function isPromise<V = unknown>(input: unknown): input is Promise<V> {
  const i = input as undefined | Promise<V>;
  return !!i && typeof i?.then === "function" && typeof i?.catch === "function";
}

/**
 * Determines whether a value in an object.
 *
 * @param input
 */
export function isObject(input: unknown): input is Dictionary {
  return input !== null && typeof input === "object";
}

/**
 * Alternative to Node's `path.basename`, removing query string after the extension if it exists.
 *
 * @param {string} path Path to get the basename of
 * @param {string} [ext] File extension to remove
 *
 * @see https://github.com/discordjs/discord.js/blob/master/src/util/Util.js#L483-L493
 */
export function basename(path: string, ext?: string): string {
  const res = parse(path);
  return ext && res.ext.startsWith(ext) ? res.name : res.base.split("?")[0];
}

/**
 * @param {any | any[]} value
 */
export function array<T>(value: T | T[]): T[] {
  return Array.isArray(value) ? value : [ value ];
}


export function humanizeEnum(enumObj: Dictionary): string[] {
  const keys = [];
  for (const key of Object.keys(enumObj).filter(key => isNaN(parseInt(key)))) {
    keys.push(humanizeEnumKey(key as string));
  }

  return keys;
}

/**
 * Humanizes an enum key.
 *
 * @param {string} key The enum key.
 *
 * @returns {string} The humanized enum key.
 */
export const humanizeEnumKey = (key: string) => key
  .split(/_/g)
  .map(part => capitalize(part))
  .join(" ");
