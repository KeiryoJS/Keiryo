/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { has } from "@neocord/utils";

export function makeSafeQuery(dict: Dictionary<any>): Dictionary<string> {
  const obj: Dictionary<string> = {};
  for (const [k, v] of Object.entries(dict))
    if (has(v, "toString")) obj[k] = v.toString();

  return obj;
}
