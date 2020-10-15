/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import type { Resource } from "./Resource";
import type { ResourcePool } from "./ResourcePool";

export abstract class ResourceProxy<R extends Resource> {
  /**
   * The pool this resource proxy wraps.
   *
   * @type {ResourcePool}
   * @private
   */
  readonly #pool: ResourcePool<R>;

  /**
   * @param {ResourcePool} pool The pool this resource proxy wraps.
   */
  protected constructor(pool: ResourcePool<R>) {
    this.#pool = pool;
  }

  /**
   * The pool this resource proxy wraps.
   *
   * @type {ResourcePool}
   */
  public get pool(): ResourcePool<R> {
    return this.#pool;
  }
}