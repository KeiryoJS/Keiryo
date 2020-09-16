/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Readable } from "stream";
import { make } from "rikuesuto";
import { existsSync, promises as fs } from "fs";

export abstract class ImageResolver {
  /**
   * Whether a buffer is of the jpeg format.
   * @param buffer
   */
  public static isJpg(buffer: Buffer): boolean {
    return buffer.length > 3
      && buffer[0] === 0xFF
      && buffer[1] === 0xD8
      && buffer[2] === 0xFF;
  }

  /**
   * Whether a buffer is of the png format.
   * @param buffer
   */
  public static isPng(buffer: Buffer): boolean {
    return buffer.length > 8
      && buffer[0] === 0x89
      && buffer[1] === 0x50
      && buffer[2] === 0x4E
      && buffer[3] === 0x47
      && buffer[4] === 0x0D
      && buffer[5] === 0x0A
      && buffer[6] === 0x1A
      && buffer[7] === 0x0A;
  }

  /**
   * Whether a buffer is of the webp format.
   * @param buffer
   */
  public static isWebp(buffer: Buffer): boolean {
    return buffer.length > 12
      && buffer[0] === 0x52
      && buffer[1] === 0x49
      && buffer[2] === 0x46
      && buffer[3] === 0x46
      && buffer[8] === 0x57
      && buffer[9] === 0x45
      && buffer[10] === 0x42
      && buffer[11] === 0x50;
  }

  /**
   * Whether a buffer is of the gif format
   * @param buffer
   */
  public static isGif(buffer: Buffer): boolean {
    return buffer.length > 6
      && buffer[0] === 0x47
      && buffer[1] === 0x49
      && buffer[2] === 0x46
      && buffer[3] === 0x38
      && buffer[4] === 0x39
      && buffer[5] === 0x61;
  }

  /**
   * Get the image format of a buffer.
   * @param buffer
   */
  public static getImageFormat(buffer: Buffer): ImageFormats | null {
    if (this.isGif(buffer)) return ImageFormats.GIF;
    if (this.isJpg(buffer)) return ImageFormats.JPEG;
    if (this.isPng(buffer)) return ImageFormats.PNG;
    if (this.isWebp(buffer)) return ImageFormats.WEBP;
    return null;
  }

  /**
   * @param data
   */
  public static resolveBase64(data: Buffer | string): string {
    if (Buffer.isBuffer(data)) {
      const format = this.getImageFormat(data) ?? ImageFormats.JPEG;
      return `data:${format};base64,${data.toString("base64")}`;
    }

    return data;
  }

  /**
   * @param resource
   */
  public static async resolveFile(resource: ImageResolvable): Promise<Buffer> {
    if (resource instanceof Readable) {
      const buffers = [];
      for await (const buffer of resource) {
        buffers.push(buffer);
      }

      return Buffer.concat(buffers);
    }

    if (Buffer.isBuffer(resource)) return resource;
    else if (/^https?:\/\//.test(resource)) return (await make(resource)).buffer;
    else if (existsSync(resource)) return fs.readFile(resource);
    return Buffer.from(resource);
  }

  /**
   * Resolve an image into a base64
   * @param data
   */
  public static async resolveImage(data: ImageResolvable): Promise<string> {
    const file = await this.resolveFile(data);
    return this.resolveBase64(file);
  }
}

export type ImageResolvable = Buffer | Readable | string

export enum ImageFormats {
  WEBP = "image/webp",
  GIF = "image/gif",
  PNG = "image/png",
  JPEG = "image/jpeg"
}
