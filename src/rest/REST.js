/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import * as https from "https";
import fetch from "node-fetch";
import AbortController from "abort-controller";

import { Collection, EventEmitter, isInstalled, mergeObject, sleep, Snowflake, Timers } from "../common";

import { CDN } from "./CDN";
import { API_URL, CDN_URL, RESTEvent, USER_AGENT } from "./constants";
import { Bucket } from "./Bucket";
import { DiscordHTTPError } from "./errors/DiscordHTTPError";
import { DiscordAPIError } from "./errors/DiscordAPIError";

let FormData = isInstalled("form-data") ? require("form-data") : void 0;

export class REST extends EventEmitter {
  /**
   * The major endpoints.
   *
   * @see https://discord.com/developers/docs/topics/rate-limits#rate-limits
   * @type {string[]}
   */
  static MAJOR = [ "channels", "guilds", "webhooks" ];

  /**
   * The default Https Agent used for all requests.
   * @type {module:https.Agent}
   */
  static AGENT = new https.Agent({ keepAlive: true });

  /**
   * Default options used for the rest client.
   * @type {RESTOptions}
   */
  static DEFAULT_OPTIONS = {
    version: 8,
    tokenPrefix: "Bot ",
    apiUrl: API_URL,
    cdnUrl: CDN_URL,
    timeout: 15000,
    retries: 3,
    userAgent: USER_AGENT
  };

  /**
   * @param {RESTHandlerOptions} [options] The options for this rest handler.
   */
  constructor(options = {}) {
    options = mergeObject(options, REST.DEFAULT_OPTIONS);
    super();

    /**
     * The buckets.
     * @type {Collection<string, Bucket>}
     */
    this.buckets = new Collection();

    /**
     * The CDN link builder
     * @type {CDN}
     */
    this.cdn = new CDN(options.cdnUrl);

    /**
     * The options provided.
     * @type {RESTHandlerOptions}
     */
    this.options = options;

    /**
     * The global rate-limit promise.
     * @type {Promise<void> | null}
     */
    this.globalRatelimit = null;

    /**
     * The latency between the discord api and us.
     * @type {number}
     */
    this.latency = 0;
  }

  /**
   * Returns the body for the provided node-fetch response.
   * @param {Response} res The node-fetch response.
   * @returns {Promise<any>}
   */
  static bodyFor(res) {
    return (res.headers?.get("content-type").startsWith("application/json")
      ? res.json()
      : res.buffer());
  }

  /**
   * Used for tracking rate-limits across different endpoints..
   *
   * @param {string} endpoint The endpoint.
   * @param {string} method The HTTP method.
   *
   * @returns {string}
   */
  static getRoute(endpoint, method) {
    const route = endpoint
      .replace(/\/([\w-]+)\/(?:\d{17,19})/g, (m, p) => REST.MAJOR.includes(m)
        ? m
        : `/${p}/:id`)
      .replace(/\/reactions\/[^/]+/g, "/reactions/:id")
      .replace(/\/webhooks\/(\d+)\/[\w-]{64,}/g, "/webhooks/$1/:token");

    let ending = ";";
    if (method.toLowerCase() === "delete" && route.endsWith("/message/:id")) {
      const id = /\d{16, 19}$/m.exec(route)?.[0],
        snowflake = Snowflake.deconstruct(id);

      if (Date.now() - snowflake.timestamp > 12096e5) {
        // Deleting messages has a different rate-limit.
        ending += "deletes-old";
      }
    }

    return route + ending;
  }

  /**
   * Set the token of this REST instance.
   * @param {string} value Your bot (or bearer, or whatever *wink*) token.
   */
  set token(value) {
    value = value.replace(/^\w+\s+/, "").trim();
    Reflect.defineProperty(this, "_token", { value });
  }

  /**
   * The API url.
   * @returns {string}
   */
  get apiUrl() {
    const base = this.options.apiUrl.replace(/\/$/m, "");
    return `${base}/v${this.options.version}`;
  }

  /**
   * Queues a request to be made.
   *
   * @param {string | { toString(): string }} endpoint The endpoint to make.
   * @param {RequestOptions} [options] The request options.
   *
   * @returns {Promise<any>}
   */
  queue(endpoint, options = {}) {
    endpoint = endpoint.toString();
    options = mergeObject(options, { method: "get" });

    const data = this._getRequest(endpoint, options),
      route = REST.getRoute(endpoint, options.method),
      bucket = this.buckets.ensure(route, new Bucket(route));

    try {
      return this._make(route, data);
    } finally {
      this.latency = Date.now() - this._lastRequest;
      bucket.lock.next();
    }
  }

  /**
   * Makes a request.
   *
   * @param {string} route The route identifier.
   * @param {RequestData} data The request data.
   * @param {number} tries The number of tries this request has taken so far.
   *
   * @private
   */
  async _make(route, { url, request }, tries = 0) {
    const bucket = this.buckets.get(route);
    if (Bucket.GLOBAL_RATE_LIMIT) {
      await Bucket.GLOBAL_RATE_LIMIT;
    }

    await bucket.lock.wait();
    if (bucket.rateLimited) {
      /**
       * Emitted whenever a routes rate-limit bucket was exceeded.
       * @event RequestHandler#rate-limited
       * @property {RateLimitedData} data The rate-limit data.
       */
      this.emit(RESTEvent.RATE_LIMITED, {
        bucket: bucket.info,
        route,
        request
      });

      await sleep(bucket.untilReset);
    }

    const controller = new AbortController(),
      timeout = Timers.setTimeout(() => controller.abort(), this.options.timeout);

    let res;
    try {
      res = await fetch(url, { ...request, signal: controller.signal });
    } catch (err) {
      if (tries >= this.options.retries) {
        throw new DiscordHTTPError(err.message, err.status, route, request.method);
      }

      return this._make(route, { url, request }, tries++);
    } finally {
      Timers.clearTimeout(timeout);

      /**
       * Timestamp of the last request made.
       * @type {number}
       * @private
       */
      this._lastRequest = Date.now();
    }

    await bucket.handle(res);
    if (res.ok) {
      return await REST.bodyFor(res);
    }

    if (res.status >= 400 && res.status < 500) {
      // check for a 429
      if (res.status === 429) {
        this._debug(`oh no, we hit 429 on route: ${route}, retrying in ${bucket.untilReset}ms`);
        await sleep(bucket.untilReset);
        return this._make(route, { url, request }, tries++);
      }

      let data;
      try {
        data = await REST.bodyFor(res);
      } catch (err) {
        throw new DiscordHTTPError(err.message, err.status, route, request.method);
      }

      throw new DiscordAPIError(data, res.status, request.method, route);
    }

    if (res.status >= 500 && res.status < 600) {
      if (res.status === 502) {
        throw new DiscordHTTPError("Discord API is unavailable (https://discordstatus.com/", 502, route);
      }

      if (tries < this.options.retries) {
        return this._make(route, { url, request }, tries++);
      }

      throw new DiscordHTTPError(res.statusText, res.status, route, request.method);
    }

    return null;
  }

  /**
   * Get the RequestInit object for requests.
   *
   * @param {string} endpoint The endpoint.
   * @param {RequestOptions} options The request options.
   *
   * @returns {RequestData}
   * @private
   */
  _getRequest(endpoint, options) {
    endpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

    let url = `${this.apiUrl}${endpoint}`;
    if (options.query) {
      let qs = "";
      for (const [ k, v ] of Object.entries(options.query)) {
        const add = (k, v) => qs += `&${encodeURIComponent(k)}=${encodeURIComponent(v)}`;
        Array.isArray(v) ? v.forEach(p => add(k, p)) : add(k, v);
      }

      url += `?${qs.slice(1)}`;
    }

    const headers = {
      "User-Agent": this.options.userAgent,
      "X-RateLimit-Precision": "millisecond"
    };

    if (options.authorize !== false) {
      const prefix = this.options.tokenPrefix
        ? `${this.options.tokenPrefix.trim()} `
        : "";

      headers.Authorization = `${prefix}${this._token}`;
    }

    if (options.auditReason) {
      headers["X-Audit-Log-Reason"] = encodeURIComponent(options.auditReason);
    }

    let body;
    if (options.files?.length) {
      if (!FormData) {
        throw new Error("You must install 'form-data' before sending attachments.");
      }

      body = new FormData();
      for (const file of options.files) {
        if (!file.file) {
          continue;
        }

        file.name ??= "file.png";
        body.append(file.name, file.file, { filename: file.name });
      }

      if (typeof options.body === "object") {
        body.append("payload_json", JSON.stringify(options.body));
      }

      headers["Content-Type"] = body.getHeaders();
    } else if (typeof options.body === "object") {
      headers["Content-Type"] = "application/json";
      body = JSON.stringify(options.body);
    }

    return {
      url,
      request: {
        body,
        method: options.method,
        headers,
        agent: REST.AGENT
      }
    };
  }

  /**
   * Used for general debugging purposes.
   * @param {string} message The debug message.
   * @private
   */
  _debug(message) {
    this.emit(RESTEvent.DEBUG, `(rest) ${message.trim()}`);
  }
}

/**
 * @typedef {Object} RESTOptions
 * @property {number} [version] The API version to use, v8 is the default and recommended.
 * @property {string} [apiUrl] The API url to use.
 * @property {string} [cdnUrl] The CDN url to use.
 * @property {number} [timeout] The response timeout, in milliseconds.
 * @property {number} [retries] The total number of retries.
 * @property {string} [userAgent] The user agent to use.
 * @property {string} [tokenPrefix] The token prefix to use.
 */

/**
 * @typedef {Object} RequestOptions
 * @property {Dictionary} [query] The query parameters.
 * @property {any} [body] The request body.
 * @property {string} [method] The request method.
 * @property {boolean} [authorize] Whether to authorize the request being made.
 * @property {string} [auditReason] The audit-log-reason to define.
 */

/**
 * @typedef {Object} RateLimitedData
 * @property {number} limit
 * @property {string} method
 * @property {string} url
 */

/**
 * @typedef {RequestData}
 * @property {string} url The request url.
 * @property {RequestInit} request The node-fetch request data.
 */
