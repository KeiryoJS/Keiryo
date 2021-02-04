/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Readable } from "stream";
import { existsSync, promises as fs } from "fs";
import fetch from "node-fetch";

export namespace Files {
  export enum ImageFormat {
    WEBP = "image/webp",
    GIF = "image/gif",
    PNG = "image/png",
    JPEG = "image/jpeg",
  }


  /**
   * Whether a buffer is of the jpeg image format.
   *
   * @param {Buffer} buffer
   *
   * @returns {boolean}
   */
  export function isJpegImage(buffer: Buffer): boolean {
    return (
      buffer.length > 3 &&
      buffer[0] === 0xff &&
      buffer[1] === 0xd8 &&
      buffer[2] === 0xff
    );
  }

  /**
   * Whether a buffer is of the png image format.
   *
   * @param {Buffer} buffer
   *
   * @returns {boolean}
   */
  export function isPngImage(buffer: Buffer): boolean {
    return (
      buffer.length > 8 &&
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47 &&
      buffer[4] === 0x0d &&
      buffer[5] === 0x0a &&
      buffer[6] === 0x1a &&
      buffer[7] === 0x0a
    );
  }

  /**
   * Whether a buffer is of the webp format.
   *
   * @param {Buffer} buffer
   *
   * @returns {boolean}
   */
  export function isWebpImage(buffer: Buffer): boolean {
    return (
      buffer.length > 12 &&
      buffer[0] === 0x52 &&
      buffer[1] === 0x49 &&
      buffer[2] === 0x46 &&
      buffer[3] === 0x46 &&
      buffer[8] === 0x57 &&
      buffer[9] === 0x45 &&
      buffer[10] === 0x42 &&
      buffer[11] === 0x50
    );
  }


  /**
   * Whether a buffer is of the gif format
   *
   * @param {Buffer} buffer
   *
   * @returns {boolean}
   */
  export function isGif(buffer: Buffer): boolean {
    return (
      buffer.length > 6 &&
      buffer[0] === 0x47 &&
      buffer[1] === 0x49 &&
      buffer[2] === 0x46 &&
      buffer[3] === 0x38 &&
      buffer[4] === 0x39 &&
      buffer[5] === 0x61
    );
  }

  /**
   * Get the image format of a buffer.
   *
   * @param {Buffer} buffer
   *
   * @returns {ImageFormat | null}
   */
  export function getImageFormat(buffer: Buffer): ImageFormat | null {
    if (isGif(buffer)) {
      return ImageFormat.GIF;
    }
    if (isJpegImage(buffer)) {
      return ImageFormat.JPEG;
    }
    if (isPngImage(buffer)) {
      return ImageFormat.PNG;
    }
    if (isWebpImage(buffer)) {
      return ImageFormat.WEBP;
    }
    return null;
  }

  /**
   * Resolves a buffer into a base64 string.
   * @param {Buffer} data
   * @returns {string}
   */
  export function resolveBase64(data: Buffer): string {
    if (Buffer.isBuffer(data)) {
      const format = getImageFormat(data) ?? ImageFormat.JPEG;
      return `data:${format};base64,${data.toString("base64")}`;
    }

    return data;
  }

  /**
   * Resolves a file.
   * @param {ImageResolvable} resource
   * @returns {Promise<Buffer>}
   */
  export async function resolveFile(resource: ImageResolvable): Promise<Buffer> {
    if (resource instanceof Readable) {
      const buffers = [];
      for await (const buffer of resource) {
        buffers.push(buffer);
      }

      return Buffer.concat(buffers);
    }

    if (Buffer.isBuffer(resource)) {
      return resource;
    } else if (/^https?:\/\//.test(resource)) {
      return await (await fetch(resource)).buffer();
    } else if (existsSync(resource)) {
      return fs.readFile(resource);
    }
    return Buffer.from(resource);
  }

  /**
   * Resolve an image into a base64
   * @param {ImageResolvable} data
   * @returns {Promise<string>}
   */
  export async function resolveImage(data: ImageResolvable): Promise<string> {
    const file = await resolveFile(data);
    return resolveBase64(file);
  }

  type ImageResolvable = Buffer | Readable;
}
