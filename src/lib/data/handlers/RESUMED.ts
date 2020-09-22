import { Handler } from "../Handler";

import type { Shard } from "@neocord/gateway";

export default class RESUMED extends Handler {
  public handle(_d: unknown, shard: Shard): void {
    const replayed = shard.sequence - shard.closingSequence;
    this.client.emit("shardResumed", shard.id, replayed);
    return;
  }
}
