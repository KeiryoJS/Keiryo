/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Event } from "./Event";
import { ClientEvent } from "../../../utils";

export default class RESUMED extends Event {
  handle(_d, shard) {
    const replayed = shard.seq - shard.closingSeq;
    this.client.emit(ClientEvent.SHARD_RESUMED, shard, replayed);
  }
}