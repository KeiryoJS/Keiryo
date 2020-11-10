/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { EventEmitter } from "events";

export class AbortSignal extends EventEmitter {
  #aborted = false;

  constructor() {
    super();

    this.addEventListener = this.addListener.bind(this);
    this.removeEventListener = this.removeListener.bind(this);
  }

  /**
   * Whether the signal was aborted.
   * @return {boolean}
   */
  get aborted() {
    return this.#aborted;
  }

  /**
   * Abort the signal.
   */
  abort() {
    this.#aborted = true;
    this.emit("aborted");
  }
}