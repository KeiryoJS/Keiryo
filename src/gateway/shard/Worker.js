/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { isMainThread, parentPort, workerData } from "worker_threads";
import { WorkerShard } from "./WorkerShard";

if (isMainThread || parentPort === null) {
  throw new Error("Worker can only be used as a WorkerThread.");
}

const data = workerData;
new WorkerShard(parentPort, data);
