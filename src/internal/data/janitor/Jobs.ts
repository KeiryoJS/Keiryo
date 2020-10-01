/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { CurrentShift, Job, JobOptions } from "./Job";
import { Duration } from "@neocord/utils";
import { DiscordStructure } from "../../../util";

import type { Janitor } from "./Janitor";
import type { Cache } from "../Cache";
import type { Message } from "../../../structures/message/Message";

export abstract class Jobs {
  /**
   * The default job for all structures.
   * @param {DiscordStructure} structure The structure this job is for.
   * @param {SweeperJobOptions} options The options for this job.
   * @constructor
   */
  public static Default({ structure, ...options }: DefaultJobOptions): typeof Job {
    const lifetime =
      typeof options.lifetime === "string"
        ? Duration.parse(options.lifetime)
        : options.lifetime;

    return class DefaultJob extends Job {
      public constructor(janitor: Janitor) {
        super(janitor, `default-${(Math.random() * 100).toFixed(0)}`, options);

        this.caches = new Set();

        if (lifetime <= 0) {
          janitor.client.emit(
            "debug",
            `(Janitor) ${DiscordStructure[structure]} Job: Can't sweep anything - lifetime is unlimited.`
          );
        }
      }

      /**
       * Sweeps all cached messages.
       * @param {CurrentShift} shift The current shift of this job.
       */
      public async do(shift: CurrentShift): Promise<unknown> {
        const now = Date.now();

        let items = 0;
        if (this.caches) {
          for (const cache of this.caches)
            items += cache.sweep((m) => now - m.cachedAt > lifetime);
        }

        this.janitor.client.emit(
          "debug",
          `(Janitor) ${DiscordStructure[structure]} Job: ‹Shift ${shift.id}› Swept ${items} cached items.`
        );

        return items;
      }
    };
  }

  /**
   * An official message job for engines.
   * @param {SweeperJobOptions} options
   * @constructor
   */
  public static Message(options: SweeperJobOptions): typeof Job {
    const lifetime =
      typeof options.lifetime === "string"
        ? Duration.parse(options.lifetime)
        : options.lifetime;

    return class MessageJob extends Job {
      /**
       * The caches this job is for.
       * @type {Set<Cache>}
       */
      public caches: Set<Cache<Message>>;

      /**
       * @param {Janitor} janitor The janitor instance.
       */
      public constructor(janitor: Janitor) {
        super(janitor, `messages-${(Math.random() * 100).toFixed(0)}`, options);

        this.caches = new Set();
        if (lifetime <= 0) {
          janitor.client.emit(
            "debug",
            "(Janitor) Message Job: Can't sweep messages - lifetime is unlimited."
          );
        }
      }

      /**
       * Sweeps all cached messages.
       * @param {CurrentShift} shift The current shift of this job.
       */
      public async do(shift: CurrentShift): Promise<unknown> {
        const now = Date.now();

        let messages = 0;
        for (const cache of this.caches) {
          messages += cache.sweep((m) => {
            const timestamp = m.editedTimestamp ?? m.createdTimestamp;
            return now - timestamp > lifetime;
          });
        }

        this.janitor.client.emit(
          "debug",
          `(Janitor) Message Job: ‹Shift ${shift.id}› Swept ${messages} cached messages.`
        );

        return messages;
      }
    };
  }
}

interface DefaultJobOptions extends SweeperJobOptions {
  structure: DiscordStructure;
}

export interface SweeperJobOptions extends JobOptions {
  lifetime: number | string;
}
