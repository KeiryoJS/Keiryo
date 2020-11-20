/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Collection } from "../../utils";

/**
 * This file takes some code from dirigeants :)
 * @author Dirigeants
 * @file https://github.com/dirigeants/cache/blob/master/src/ProxyCache.ts
 */

export class ResourceProxy extends Collection {
  /**
   * The pool this resource proxy wraps.
   * @type {ResourcePool}
   */
  #pool;

  /**
   * All keys.
   * @type {string[]}
   */
  #keys;

  /**
   * @param {ResourcePool} pool The resource pool to proxy.
   */
  constructor(pool) {
    super();

    this.#pool = pool;
    this.#keys = [];
  }

  /**
   * Returns the number of keys in the proxy.
   */
  get size() {
    return this.#keys.length;
  }

  /**
   * The pool this proxy is for...
   */
  get pool() {
    return this.#pool;
  }

  /**
   * Returns a specified element from the pool. If the value that is associated to the provided key is an object,
   * then you will get a reference to that object and any change made to that object will effectively modify it inside
   * the pool.
   *
   * @param {string} key The key of the element
   * @return {?Resource}
   */
  get(key) {
    return this.#keys.includes(key)
      ? this.#pool.get(key)
      : null;
  }


  /**
   * Returns a boolean indicating whether an element with the specified key exists or not.
   * @param {string} key The key of the element to test for presence in the proxy and in the {@link Collection} object.
   * @returns {boolean} Whether or not an element with the specified key exists in the proxy and in the {@link Collection} object.
   */
  has(key) {
    return this.#keys.includes(key) && this.#pool.has(key);
  }

  /**
   * Adds a key to the proxy if it wasn't previously added and exists in the {@link Collection} object.
   * @param {string} key The key of the element to add to the proxy object.
   * @returns {ResourceProxy} The modified {@link ResourceProxy}.
   */
  set(key) {
    if (!this.#keys.includes(key) && this.#pool.has(key)) {
      this.#keys.push(key);
    }
    return this;
  }

  /**
   * Removes a key from the proxy.
   * @param {string} key The key of the element to remove from the proxy object.
   * @returns {boolean} Whether or not the key was removed.
   */
  delete(key) {
    const index = this.#keys.indexOf(key);
    const has = index !== -1;
    if (has) {
      this.#keys.splice(index, 1);
    }

    return has;
  }

  /**
   * Removes all keys from the proxy.
   */
  clear() {
    this.#keys = [];
    return this;
  }

  /**
   * Executes a provided function once per each key/value pair in the {@link Map} object, in insertion order
   * @param {Function} callbackFn Function to execute for each element.
   * @param [thisArg] Value to use as this when executing callback.
   */
  forEach(callbackFn, thisArg) {
    const fn = callbackFn.bind(thisArg);
    for (const [ key, value ] of this.entries()) {
      fn(value, key, this);
    }
  }

  /**
   * Returns a new Iterator object that contains the [key, value] pairs for each element in the {@link Map} object
   * contained in the proxy in insertion order.
   */
  * [Symbol.iterator]() {
    yield * this.entries();
  }

  /**
   * Returns a new Iterator object that contains the [key, value] pairs for each element in the {@link Map} object
   * contained in the proxy in insertion order.
   */
  * entries() {
    for (const pair of this.#pool.entries()) {
      if (this.#keys.includes(pair[0])) {
        yield pair;
      }
    }
  }

  /**
   * Returns a new Iterator object that contains the keys for each element in the {@link Map} object contained in the
   * proxy in insertion order
   */
  * keys() {
    for (const key of this.#pool.keys()) {
      if (this.#keys.includes(key)) {
        yield key;
      }
    }
  }

  /**
   * Returns a new Iterator object that contains the values for each element in the {@link Map} object contained in
   * the proxy in insertion order
   */
  * values() {
    for (const [ key, value ] of this.#pool.entries()) {
      if (this.#keys.includes(key)) {
        yield value;
      }
    }
  }

  static get [Symbol.species]() {
    return ResourceProxy;
  }
}