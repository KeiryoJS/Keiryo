import { ResourceType } from "../../external/abstract/ResourceType";

export class UncachedResourceError extends Error {

  /**
   * The type of resource that is uncached.
   *
   * @type {ResourceType}
   */
  public readonly resource: ResourceType;

  /**
   *
   * ID of the resource that is uncached.
   *
   * @type {string}
   */
  public readonly additionalMessage?: string;

  /**
   * @param {ResourceType} resource
   * @param {string} [message]
   */
  public constructor(resource: ResourceType, message?: string) {
    super();

    this.resource = resource;
    this.additionalMessage = message;

    this.name = `UncachedResource (${ResourceType[resource]}`;
    this.message = `Resource not cached. ${message ?? ""}`;
  }
}
