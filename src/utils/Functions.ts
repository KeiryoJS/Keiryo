/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

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
