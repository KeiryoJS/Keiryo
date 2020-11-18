/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { isObject } from "./Functions";

export class Collection extends Map {
  /**
   * Creates a collection from the provided value.
   * @param {Dictionary | Tuple[] | Array} value The value to create the collection from.
   * @returns {Collection}
   */
  static from(value) {
    const col = new Collection();
    if (Array.isArray(value) && value.length) {
      if (Array.isArray(value[0])) {
        for (const [ k, v ] of value) {
          col.set(k, v);
        }

        return col;
      }

      let i = 0;
      for (const v of value) {
        col.set(i, v);
        i++;
      }

      return col;
    } else if (isObject(value)) {
      return new Collection(Object.entries(value));
    }

    throw new Error(
      `Collection#from: Expected an object or array, got "${typeof value}"`
    );
  }

  /**
   * The first key(s) in this collection.
   *
   * @returns {any}
   */
  first(amount) {
    const it = this.entries();
    if (amount) {
      return amount < 0
        ? this.last(amount * -1)
        : Array.from(
          { length: Math.min(amount, this.size) },
          () => it.next().value
        );
    }

    return it.next().value ?? null;
  }

  /**
   * The last key(s) in this collection.
   * @returns {any | any[]}
   */
  last(amount) {
    const arr = Array.from(this.entries());
    if (amount) {
      return amount < 0 ? this.first(amount * -1) : arr.slice(-amount);
    }

    return arr[arr.length - 1] ?? null;
  }

  /**
   * Get an array of all values in this collection.
   * @returns {any[]}
   */
  array() {
    return Array.from(this.values());
  }

  /**
   * Tests whether or not an entry in this collection meets the provided predicate.
   * @param {function} predicate A predicate that tests all entries.
   * @param {any} [thisArg] An optional binding for the predicate function.
   * @returns {boolean}
   */
  some(predicate, thisArg) {
    if (thisArg) {
      predicate = predicate.bind(thisArg);
    }

    for (const [ k, v ] of this) {
      if (predicate(v, k, this)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Creates a new collection with the items within the provided range.
   * @param {number} [from] Where to stop.
   * @param {number} [end] Where to end.
   * @returns {Collection}
   */
  slice(from, end) {
    const col = new Collection(),
      entries = Array.from(this.entries());

    for (const [ k, v ] of entries.slice(from, end)) {
      col.set(k, v);
    }

    return col;
  }

  /**
   * Collection#forEach but it returns the collection instead of nothing.
   * @param {function} fn The function to be ran on all entries.
   * @param {any} [thisArg] An optional binding for the fn parameter.
   * @returns {Collection}
   */
  each(fn, thisArg) {
    if (thisArg) {
      fn = fn.bind(thisArg);
    }
    for (const [ k, v ] of this) {
      fn(v, k, this);
    }
    return this;
  }

  /**
   * Computes a value if it's absent in this collection.
   * @param {any} key The key.
   * @param {any} value The value to use if nothing is found.
   * @returns {any}
   */
  ensure(key, value) {
    let v = this.get(key);
    if (!v) {
      v = typeof value === "function" ? value(key) : value;

      this.set(key, v);
    }

    return v;
  }

  /**
   * Get a random value from this collection.
   * @returns {any}
   */
  random() {
    const values = Array.from(this.values());
    return values[Math.floor(Math.random() * values.length)];
  }

  /**
   * Get a random key from this collection.
   * @returns {any}
   */
  randomKey() {
    const keys = Array.from(this.keys());
    return keys[Math.floor(Math.random() * keys.length)];
  }

  /**
   * Get random entry from this collection.
   * @returns {Tuple}
   */
  randomEntry() {
    const entries = Array.from(this.entries());
    return entries[Math.floor(Math.random() * entries.length)];
  }

  /**
   * Sweeps entries from the collection.
   *
   * @param {function} fn The predicate.
   * @param {any} [thisArg] Optional binding for the predicate.
   * @returns {number}
   */
  sweep(fn, thisArg) {
    if (thisArg) {
      fn = fn.bind(thisArg);
    }

    const oldSize = this.size;
    for (const [ k, v ] of this) {
      if (fn(v, k, this)) {
        this.delete(k);
      }
    }

    return oldSize - this.size;
  }

  /**
   * Finds a value using a predicate from this collection
   * @param {function} fn Function used to find the value.
   * @param {any} [thisArg] Optional binding to use.
   * @returns {?any}
   */
  find(fn, thisArg) {
    if (thisArg) {
      fn = fn.bind(this);
    }

    for (const [ k, v ] of this) {
      if (fn(v, k, this)) {
        return v;
      }
    }

    return null;
  }

  /**
   * Reduces this collection down into a single value.
   *
   * @param {function} fn The function used to reduce this collection.
   * @param {any} acc The accumulator.
   * @param {any} [thisArg] Optional binding for the reducer function.
   * @returns {any}
   */
  reduce(fn, acc, thisArg) {
    if (thisArg) {
      fn = fn.bind(thisArg);
    }
    for (const [ k, v ] of this) {
      acc = fn(acc, v, k, this);
    }

    return acc;
  }

  /**
   * Partition this collection. First collection are the entries that returned true, second collection are the entries that returned false.
   * @param {function} predicate The predicate function.
   * @param {any} [thisArg] Optional binding for the predicate.
   * @returns {[Collection, Collection]}
   */
  partition(predicate, thisArg) {
    if (thisArg) {
      predicate = predicate.bind(thisArg);
    }

    const [ p1, p2 ] = [ new Collection(), new Collection() ];
    for (const [ k, v ] of this) {
      const partition = predicate(v, k, this) ? p1 : p2;

      partition.set(k, v);
    }

    return [ p1, p2 ];
  }

  /**
   * Returns a filtered collection based on the provided predicate.
   * @param {function} fn The predicate used to determine whether or not an entry can be passed to the new collection.
   * @param {any} [thisArg] Optional binding for the predicate.
   * @returns {Collection}
   */
  filter(fn, thisArg) {
    if (thisArg) {
      fn = fn.bind(thisArg);
    }

    const col = new this.constructor[Symbol.species]();
    for (const [ k, v ] of this) {
      if (fn(v, k, this)) {
        col.set(k, v);
      }
    }

    return col;
  }

  /**
   * Maps this collection into an array. Array#map equivalent.
   * @param {function} fn Function used to map values to an array.
   * @param {any} [thisArg] Optional binding for the map function.
   * @returns {any[]}
   */
  map(fn, thisArg) {
    if (thisArg) {
      fn = fn.bind(thisArg);
    }

    const arr = [];
    for (const [ k, v ] of this) {
      const value = fn(v, k, this);
      arr.push(value);
    }

    return arr;
  }

  /**
   * Sorts the entries in-place in this collection.
   * @param {function} compareFunction Function to determine how this collection should be sorted.
   * @returns {Collection}
   */
  sort(compareFunction = (first, second) => +(first > second) || +(first === second) - 1) {
    const entries = Array.from(this.entries()).sort((a, b) =>
      compareFunction(a[1], b[1], a[0], b[0])
    );

    this.clear();
    for (const [ key, value ] of entries) {
      this.set(key, value);
    }

    return this;
  }

  /**
   * Sorts entries in a new collection
   * @param {function} compareFunction Function to determine how the resulting collection should be sorted
   * @returns {Collection}
   */
  sorted(compareFunction = (first, second) => +(first > second) || +(first === second) - 1) {
    const entries = Array.from(this.entries()).sort((a, b) =>
      compareFunction(a[1], b[1], a[0], b[0])
    );

    return new this.constructor(entries);
  }

  /**
   * Returns a clone of this collection.
   * @returns {Collection}
   */
  clone() {
    return new this.constructor[Symbol.species](this.entries());
  }
}
