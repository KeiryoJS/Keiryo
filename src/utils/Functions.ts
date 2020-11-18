/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Timers } from "./Timers";

/**
 * Pauses the event loop for a set duration of time.
 * @param {number} ms The duration in milliseconds.
 * @returns {Promise<NodeJS.Timeout>}
 */
export function sleep(ms: number): Promise<NodeJS.Timeout> {
  return new Promise((r) => Timers.setTimeout(r, ms));
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
 * Merges objects into one.
 * @param {Dictionary} objects The objects to merge.
 */
export function mergeObjects<
  O extends Record<PropertyKey, any> = Record<PropertyKey, any>
  >(...objects: Partial<O>[]): O {
  const o: Record<PropertyKey, any> = {};
  for (const object of objects) {
    for (const key of Reflect.ownKeys(object)) {
      if (!Reflect.has(o, key)) {
        const v = Reflect.get(object, key);
        Reflect.set(o, key, v);
      }
    }
  }

  return o as O;
}

/**
 * A helper function for determining whether or not a value is a promise,
 *
 * @param {any} input
 * @returns {boolean} Whether the input was a promise.
 */
export function isPromise<V = unknown>(input: unknown): input is Promise<V> {
  const i = input as undefined | Promise<V>;
  return !!i && typeof i?.then === "function" && typeof i?.catch === "function";
}

/**
 * Determines whether a value in an object.
 * @param input
 */
export function isObject(input: unknown): input is Dictionary {
  return input !== null && typeof input === "object";
}
