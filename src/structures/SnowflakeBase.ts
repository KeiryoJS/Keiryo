/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Base } from "./Base";
import { Snowflake } from "@neocord/utils";

export abstract class SnowflakeBase extends Base {
  /**
   * The date when this object was created.
   */
  public get createdAt(): Date {
    return new Date(this.createdTimestamp);
  }

  /**
   * The time when this object was created.
   */
  public get createdTimestamp(): number {
    return new Snowflake(this.id).timestamp;
  }

  /**
   * The snowflake data.
   */
  public get snowflake(): Snowflake {
    return new Snowflake(this.id);
  }
}
