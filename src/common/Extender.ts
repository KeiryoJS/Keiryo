/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import type { Dictionary } from "./Functions";
import { isPromise } from "./Functions";

export class Extender<S extends Dictionary<Class>> {
  /**
   * All of the structures that can be extended.
   *
   * @type {Map<string, Class>}
   */
  readonly structures: Map<keyof S, Class> = new Map();

  /**
   * Whether or not this extender is immutable.
   *
   * @type {boolean}
   *
   * @private
   */
  #immutable = false;

  /**
   * @param {Dictionary} structures Pre-defined structures.
   */
  constructor(structures?: S) {
    if (structures) {
      for (const [ name, struct ] of Object.entries(structures)) {
        this.structures.set(name, struct);
      }
    }
  }

  /**
   * Creates a new immutable extender.
   *
   * @param {Dictionary} structures The pre-defined structures.
   *
   * @returns {Extender}
   */
  static Immutable<S extends Dictionary<Class>>(
    structures: S
  ): Extender<S> {
    const extender = new Extender<S>(structures);
    extender.#immutable = true;
    return extender;
  }

  /**
   * Adds a new structure to this extender.
   *
   * @param {string} name The name of this extender.
   * @param {any} structure The structure to add.
   *
   * @returns {Extender}
   */
  add(name: string, structure: any): this {
    if (this.#immutable) {
      throw new Error("This extender is immutable.");
    }

    if (!this.structures.has(name)) {
      this.structures.set(name, structure);
    }

    return this;
  }

  /**
   * Get a structure from this extender.
   *
   * @param {string} name The structures name.
   *
   * @returns {Class}
   */
  get<K extends keyof S>(name: K): S[K] {
    if (!this.structures.has(name))
      throw new Error(`Structure "${name}" does not exist.`);

    return this.structures.get(name) as S[K];
  }

  /**
   * Extend a defined structures.
   *
   * @param {string} name The structure to extend.
   * @param {ExtenderFunction} extender The extender function.
   * @returns {Promise<Extender>}
   */
  async extend<K extends keyof S, E extends S[K]>(
    name: K,
    extender: ExtenderFunction<S[K], E>
  ): Promise<this> {
    const base = this.structures.get(name) as S[K];
    if (!base) {
      throw new Error(`Structure "${name}" does not exist.`);
    }

    let extended = extender(base);
    if (isPromise(extended)) {
      extended = await extended;
    }

    if (!extended || !(extended instanceof base)) {
      throw new Error(
        `Returned class does not extend base structure "${name}"`
      );
    }

    this.structures.set(name, extended);
    return this;
  }
}

export type ExtenderFunction<S, E> = (base: S) => E | Promise<E>;
export type Class<T = any> = new (...args: any[]) => T;
