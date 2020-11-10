/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Collection, mergeObjects, Timers } from "@neocord/utils";
import { EventEmitter } from "events";
import { Agent } from "https";
import { URLSearchParams } from "url";

import { RequestHandler } from "./RequestHandler";
import { CDN } from "./CDN";

let FormData;
try {
  FormData = require("form-data");
} catch {
  //no-op
}

const agent = new Agent({ keepAlive: true });
/**
 * @type {RestOptions}
 */
const defaults = {
  version: 8,
  timeout: 15000,
  retries: 5,
  offset: 0,
  userAgent: "DiscordBot (https://github.com/neo-cord. 1.0.0)",
  apiUrl: "https://discord.com/api",
  tokenPrefix: "Bot"
};

export class RestHandler extends EventEmitter {
  /**
   * @param {Client} client
   * @param {RestOptions} options
   */
  constructor(client, options = {}) {
    options = mergeObjects(options, defaults);
    super();

    this.cdn = new CDN("https://cdn.discordapp.com");
    this.client = client;
    this.options = options;
    this.handlers = new Collection();
    this.globalTimeout = null;

    Timers.setInterval(() => this.handlers.sweep(h => h.inactive), 3e5);
  }

  /**
   * Makes a new GET request to the specified endpoint.
   * @param {string} endpoint The endpoint to use.
   * @param {RequestOptions} [options={}] Any request options to pass.
   */
  get(endpoint, options = {}) {
    return this.queue({ endpoint, ...options, method: "get" });
  }

  /**
   * Makes a new POST request to the specified endpoint.
   * @param {string} endpoint The endpoint to use.
   * @param {RequestOptions} [options={}] Any request options to pass.
   */
  post(endpoint, options = {}) {
    return this.queue({ endpoint, ...options, method: "post" });
  }

  /**
   * Makes a new DELETE request to the specified endpoint.
   * @param {string} endpoint The endpoint to use.
   * @param {RequestOptions} [options={}] Any request options to pass.
   */
  delete(endpoint, options = {}) {
    return this.queue({ endpoint, ...options, method: "delete" });
  }

  /**
   * Makes a new PATCH request to the specified endpoint.
   * @param {string} endpoint The endpoint to use.
   * @param {RequestOptions} [options={}] Any request options to pass.
   */
  patch(endpoint, options = {}) {
    return this.queue({ endpoint, ...options, method: "patch" });
  }

  /**
   * Makes a new PUT request to the specified endpoint.
   * @param {string} endpoint The endpoint to use.
   * @param {RequestOptions} [options={}] Any request options to pass.
   */
  put(endpoint, options = {}) {
    return this.queue({ endpoint, ...options, method: "put" });
  }

  /**
   * Queue's a new request.
   * @param {Request} request The request data.
   */
  async queue(request) {
    if (!request.method) {
      request.method = "get";
    }

    const route = RequestHandler.makeRoute(request.method, request.endpoint);
    const handler = this.handlers.get(route) ?? this._create(route);
    const { url, options } = await this._resolve(request);

    return handler.push(url, options);
  }

  /**
   * Creates a new request handler and adds it to the collection.
   * @param {string} route The route.
   * @private
   */
  _create(route) {
    const handler = new RequestHandler(this, route);
    this.handlers.set(route, handler);
    return handler;
  }

  /**
   * Resolves a request
   * @param {Request} request The request to resolve.
   * @private
   */
  async _resolve(request) {
    // (0) Setup URL and shite.
    let qs = "";
    if (request.query) {
      qs`?${new URLSearchParams(request.query)}`;
    }

    const url = `${this.options.apiUrl}/v${this.options.version}${request.endpoint}${qs}`,
      headers = {
        "User-Agent": this.options.userAgent,
        "X-RateLimit-Precision": "millisecond"
      };

    // (1) If authorize is set to true append the authorization header.
    if (request.authorize === undefined || request.authorize) {
      if (!this.client.token) {
        throw new Error("No bot token has been provided.");
      }

      headers.authorization = `${this.options.tokenPrefix.trim()} ${this.client.token}`;
    }

    // (2) Set the reason of the action.
    if (request.reason) {
      headers["X-Audit-Log-Reason"] = encodeURIComponent(request.reason);
    }

    // (3) File Handling.
    let body, _headers = {};
    if (request.files?.length) {
      if (!FormData) {
        throw new Error("Please install the 'form-data' package.");
      }

      body = new FormData();
      for (const file of request.files) {
        if (file && file.file) {
          body.append(file.name, file.file, file.name);
        }
      }

      if (typeof request.body !== "undefined") {
        body.append("payload_json", JSON.stringify(await request.body));
      }

      _headers = body.getHeaders();
    }

    const options = {
      method: request.method,
      body,
      headers: { ...(request.headers ?? {}), ..._headers, ...headers },
      agent
    };

    return { url, options };
  }
}

/**
 * @typedef {Object} RestOptions
 * @property {number} [retries]
 * @property {number} [timeout]
 * @property {number} [offset]
 * @property {number} [version]
 * @property {string} [apiUrl]
 * @property {string} [userAgent]
 * @property {string} [tokenPrefix]
 */

/**
 * @typedef {Object} RequestOptions
 * @property {URLSearchParams | Object | Array} [query]
 * @property {Object} [headers]
 * @property {any} [data]
 * @property {File[]} [files]
 * @property {boolean} [auth]
 */

/**
 * @typedef {RequestOptions} Request
 * @property {string} endpoint
 * @property {string} method
 */

/**
 * @typedef {Object} File
 * @property {string} name
 * @property {string | Buffer | NodeJS.ReadableStream} file
 */
