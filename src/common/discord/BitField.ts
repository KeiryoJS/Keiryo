/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import type { Dictionary } from "../Functions";

export class BitField<B extends BitResolvable> implements BitFieldObject {
  /**
   * Flags for this BitField (Should be implemented in child classes).
   * @type {any}
   */
  public static FLAGS: any = {} as const;

  /**
   * The default flags for the bitfield
   * @type {number}
   */
  public static DEFAULT = 0;

  /**
   * The bitfield data
   * @type {number}
   */
  public bitmask: number;

  /**
   * @param {BitResolvable} bits The bits to start to with.
   */
  public constructor(bits?: B) {
    const constructor = this.constructor as typeof BitField;
    this.bitmask = constructor.resolve<B>(bits);
  }

  /**
   * The value of all bits in this bitfield.
   * @type {number}
   */
  public static get ALL(): number {
    return Object.values<number>(this.FLAGS).reduce((t, b) => t | b, 0);
  }

  /**
   * Resolves a BitFieldResolvable into a number.
   * @param {BitResolvable} bit The bit/s to resolve.
   * @returns {number}
   */
  public static resolve<T extends BitResolvable>(bit?: T): number {
    if (typeof bit === "undefined") {
      return 0;
    }

    if (typeof bit === "number" && bit >= 0) {
      return bit;
    }

    if (bit instanceof BitField) {
      return bit.bitmask;
    }

    if (Array.isArray(bit)) {
      return (bit as (string | number | BitFieldObject)[])
        .map((b) => this.resolve(b))
        .reduce((t, b) => t | b, 0);
    }

    if (typeof bit === "string") {
      return this.FLAGS[bit];
    }

    throw new RangeError(
      `An invalid bit was provided. Received: ${typeof bit}`
    );
  }

  /**
   * Checks whether the bitfield has a bit, or any of multiple bits.
   * @param {number} bit Bit(s) to check for.
   * @returns {boolean}
   */
  public any(bit: B): boolean {
    return (this.bitmask & BitField.resolve(bit)) !== 0;
  }

  /**
   * Checks if this BitField matches another bitfield resolvable
   * @param {BitResolvable} bit The bit(s) to check.
   * @returns {boolean}
   */
  public equals(bit: B): boolean {
    const constructor = this.constructor as typeof BitField;
    return this.bitmask === constructor.resolve(bit);
  }

  /**
   * Checks if this BitField has a bit or bits
   *
   * @param {BitResolvable} bit The bit/s to check
   * @param {...any} args Arguments to pass when provided an array.
   * @returns {boolean}
   */
  public has(bit: B, ...args: any[]): boolean {
    if (Array.isArray(bit)) {
      const bitArr = bit as B[];
      return bitArr.every((byte) => this.has(byte, ...args));
    }

    const bits = (this.constructor as typeof BitField).resolve<B>(bit);
    return (this.bitmask & bits) === bits;
  }

  /**
   * Returns any bits this BitField is missing.
   * @param {BitResolvable} bits The bit/s to check for.
   * @param {...any} args Additional params to pass to child has methods.
   * @returns {string[]}
   */
  public missing(bits: B, ...args: any[]): string[] {
    const constructor = this.constructor as typeof BitField;
    const strings = new constructor(bits).toArray(false);
    return strings.filter((byte) => !this.has(byte as B, ...args));
  }

  /**
   * Freezes this BitField
   */
  public freeze(): this {
    return Object.freeze(this);
  }

  /**
   * Adds a bit to this BitField or a new Bitfield if this is frozen
   * @param {...BitResolvable} bits The bit(s) to add.
   * @returns {BitField}
   */
  public add(...bits: B[]): BitField<B> {
    const constructor = this.constructor as typeof BitField,
      total = bits.reduce((t, b) => t | constructor.resolve<B>(b), 0);

    if (Object.isFrozen(this)) {
      return new constructor<B>((this.bitmask | total) as B);
    }

    this.bitmask |= total;
    return this;
  }

  /**
   * Removes a bit to this BitField or a new Bitfield if this is frozen
   *
   * @param {...BitResolvable} bits The bit(s) to remove.
   * @returns {BitField}
   */
  public remove(...bits: B[]): this {
    const constructor = this.constructor as typeof BitField,
      total = bits.reduce((t, b) => t | constructor.resolve<B>(b), 0);

    if (Object.isFrozen(this)) {
      return new constructor<B>((this.bitmask & ~total) as B) as this;
    }

    this.bitmask &= ~total;
    return this;
  }

  /**
   * Returns only the bits in common between this bitfield and the passed bits.
   * @param {...BitResolvable} bits The bit(s) to mask.
   * @returns {BitField}
   */
  public mask(...bits: B[]): this {
    const constructor = this.constructor as typeof BitField,
      total = bits.reduce((acc, bit) => acc | constructor.resolve<B>(bit), 0);

    if (Object.isFrozen(this)) {
      return new constructor<B>((this.bitmask & total) as B) as this;
    }

    this.bitmask &= total;
    return this;
  }

  /**
   * Returns an object of flags: boolean.
   *
   * @param {...*} args Additional params to pass to child has methods.
   * @returns {Dictionary<boolean>} The serialized of bitmask.
   */
  public serialize(...args: any[]): Dictionary<boolean> {
    const constructor = this.constructor as typeof BitField,
      serialized: Record<string, boolean> = {};

    for (const bit of Object.keys(constructor.FLAGS)) {
      serialized[bit] = this.has(bit as B, ...args);
    }

    return serialized;
  }

  /**
   * Returns an array of Flags that make up this BitField.
   * @param {...any} args Additional params to pass to child has methods.
   * @returns {string[]}
   */
  public toArray(...args: any[]): string[] {
    const constructor = this.constructor as typeof BitField;

    return Object.keys(constructor.FLAGS).filter((bit) =>
      this.has(bit as B, ...args)
    );
  }

  /**
   * The JSON representation of this bitfield.
   * @returns {number}
   */
  public toJSON(): number {
    return this.bitmask;
  }

  /**
   * Defines value behavior of this BitField
   * @returns {number}
   */
  public valueOf(): number {
    return this.bitmask;
  }
}

export interface BitFieldObject {
  bitmask: number;
}

type bit = keyof typeof BitField.FLAGS | number | BitFieldObject;
export type BitResolvable = bit | bit[];
