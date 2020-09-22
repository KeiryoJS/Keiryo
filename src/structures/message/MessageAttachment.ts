import { basename, ImageResolvable } from "../../util";

import type { APIAttachment } from "discord-api-types";

export class MessageAttachment {
  /**
   * The image.
   * @type {ImageResolvable}
   */
  public attachment: ImageResolvable;

  /**
   * The name of this attachment.
   * @type {string | null}
   */
  public name: string | null;

  /**
   * Attachment id.
   * @type {string}
   */
  public id!: string;

  /**
   * Size of file in bytes.
   * @type {number}
   */
  public size!: number;

  /**
   * Source url of file.
   * @type {string}
   */
  public url!: string;

  /**
   * The proxy url of file.
   * @type {string}
   */
  public proxyUrl!: string;

  /**
   * Height of file (if image).
   * @type {number | null}
   */
  public height!: number | null;

  /**
   * Width of file (if image).
   * @type {number | null}
   */
  public width!: number | null;

  /**
   * @param {ImageResolvable} attachment
   * @param {string} [name=null]
   * @param {APIAttachment} data
   */
  public constructor(
    attachment: ImageResolvable,
    name: string | null,
    data: APIAttachment
  ) {
    this.attachment = attachment;
    this.name = name;
    if (data) this._patch(data);
  }

  /**
   * Whether or not this attachment has been marked as a spoiler.
   * @type {boolean}
   */
  public get spoiler(): boolean {
    return basename(this.url).startsWith("SPOILER_");
  }

  /**
   * Set the file of this message attachment
   * @param {ImageResolvable} file The file.
   */
  public setFile(file: ImageResolvable): MessageAttachment {
    this.attachment = file;
    return this;
  }

  /**
   * Set the name of this message attachment.
   * @param {string} name The new name of this attachment.
   */
  public setName(name: string): MessageAttachment {
    this.name = name;
    return this;
  }

  /**
   * Updates this message attachment with data from discord.
   * @protected
   */
  protected _patch(data: APIAttachment): this {
    this.id = data.id;
    this.size = data.size;
    this.proxyUrl = data.proxy_url;
    this.height = data.height;
    this.width = data.width;
    this.url = data.url;

    return this;
  }
}
