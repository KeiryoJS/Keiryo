/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Duration } from "@neocord/utils";
import { CurrentShift, Job, JobOptions } from "./Job";
import { DiscordStructure } from "../../../util";

import type { Cached, MemoryEngine } from "../MemoryEngine";
import type { Message } from "../../../structures/message/Message";

export abstract class Jobs {
  /**
   * The default job for all structures.
   * @param {DiscordStructure} structure The structure this job is for.
   * @param {SweeperJobOptions} options The options for this job.
   * @constructor
   */
  public static Default({
    structure,
    ...options
  }: SweeperJobOptions & { structure: DiscordStructure }): Job {
    const lifetime =
      typeof options.lifetime === "string"
        ? Duration.parse(options.lifetime)
        : options.lifetime;

    return new (class DefaultJob extends Job {
      public constructor() {
        super(`default-${(Math.random() * 100).toFixed(0)}`, options);
      }

      /**
       * Sweeps all cached messages.
       * @param {CurrentShift} shift The current shift of this job.
       * @param {MemoryEngine} engine The engine.
       */
      public async do(
        shift: CurrentShift,
        engine: MemoryEngine
      ): Promise<unknown> {
        const now = Date.now();
        if (lifetime <= 0) {
          engine.emit(
            "debug",
            `(Message Job) Shift ${shift.id}: Didn't sweep messages - lifetime is unlimited`
          );
          return -1;
        }

        const items = engine
          .all<Cached<Dictionary>>(structure)
          .sweep((i) => now - i.cachedAt > lifetime);

        engine.emit(
          "debug",
          `(${DiscordStructure[structure]} Job) Shift ${shift.id}: Swept ${items} cached items.`
        );

        return items;
      }
    })();
  }

  /**
   * An official message job for engines.
   * @param {SweeperJobOptions} options
   * @constructor
   */
  public static Message(options: SweeperJobOptions): Job {
    const lifetime =
      typeof options.lifetime === "string"
        ? Duration.parse(options.lifetime)
        : options.lifetime;

    return new (class MessageJob extends Job {
      public constructor() {
        super(`messages-${(Math.random() * 100).toFixed(0)}`, options);
      }

      /**
       * Sweeps all cached messages.
       * @param {CurrentShift} shift The current shift of this job.
       * @param {MemoryEngine} engine The engine.
       */
      public async do(
        shift: CurrentShift,
        engine: MemoryEngine
      ): Promise<unknown> {
        const now = Date.now();
        if (lifetime <= 0) {
          engine.emit(
            "debug",
            `(Janitor) Message Job: ‹Shift ${shift.id}› Didn't sweep messages - lifetime is unlimited`
          );
          return -1;
        }

        const messages = engine
          .all<Message>(DiscordStructure.Message)
          .sweep((m) => {
            const timestamp = m.editedTimestamp ?? m.createdTimestamp;
            return now - timestamp > lifetime;
          });

        engine.emit(
          "debug",
          `(Janitor) Message Job: ‹Shift ${shift.id}› Swept ${messages} cached messages.`
        );

        return messages;
      }
    })();
  }
}

export interface SweeperJobOptions extends JobOptions {
  lifetime: number | string;
}
