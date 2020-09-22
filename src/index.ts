export * from "./internal";
export * from "./managers";
export * from "./structures";
export * from "./util";

declare global {
  interface Object {
    entries<O extends Record<PropertyKey, unknown>, K extends keyof O>(
      obj: O
    ): ArrayLike<[K, O[K]]>;

    keys<O extends Record<PropertyKey, unknown>, K extends keyof O>(
      obj: O
    ): K[];
  }
}
