/**
 * FETCH ENGINE CORE
 * Role: Provides resilient, diagnostic-aware HTTPS resource retrieval with automatic retries and exponential backoff.
 * Integration: Exported class `FetchEngine` consumed by fetch_engine.js.
 */

const https = require('https');
const http = require('http');
const { URL } = require('url');

class FetchEngine {
  /**
   * @param {Object} options
   * @param {string} options.url - The target URL to fetch.
   * @param {number} [options.timeout=10000] - Request timeout in milliseconds.
   * @param {number} [options.retries=3] - Maximum retry attempts on network error.
   * @param {Object} [options.headers={}] - Custom headers for the HTTP request.
   */
  constructor(options = {}) {
    if (!options.url) {
      throw new Error('FetchEngine initialization failed: "url" option is required.');
    }
    this.url = options.url;
    this.timeout = options.timeout || 10000;
    this.retries = options.retries !== undefined ? options.retries : 3;
    this.headers = options.headers || {};
  }

  /**
   * Executes resource retrieval with retry loop and telemetry.
   * @returns {Promise<string>}
   */
  async fetch() {
    let attempt = 0;
    let lastError = null;

    while (attempt <= this.retries) {
      attempt++;
      try {
        const startTime = Date.now();
        const data = await this._httpGet(this.url);
        const duration = Date.now() - startTime;
        console.log(`[FETCH_ENGINE_CORE] Attempt ${attempt} succeeded in ${duration}ms (${data.length} bytes)`);
        return data;
      } catch (err) {
        lastError = err;
        console.warn(`[FETCH_ENGINE_CORE] Attempt ${attempt}/${this.retries + 1} failed: ${err.message}`);
        if (attempt <= this.retries) {
          const delay = Math.pow(2, attempt) * 500;
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    throw new Error(`Fetch failed after ${this.retries + 1} attempts. Last error: ${lastError ? lastError.message : 'Unknown error'}`);
  }

  /**
   * Low-level HTTP/HTTPS GET request wrapper.
   * @private
   * @param {string} targetUrl
   * @returns {Promise<string>}
   */
  _httpGet(targetUrl) {
    return new Promise((resolve, reject) => {
      const parsedUrl = new URL(targetUrl);
      const transport = parsedUrl.protocol === 'https:' ? https : http;

      const requestOptions = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
        path: parsedUrl.pathname + parsedUrl.search,
        method: 'GET',
        headers: {
          'User-Agent': 'Darlek-Caan-FetchEngine/2.0.0',
          ...this.headers
        }
      };

      const req = transport.request(requestOptions, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          const redirectUrl = new URL(res.headers.location, targetUrl).href;
          return this._httpGet(redirectUrl).then(resolve).catch(reject);
        }

        if (res.statusCode < 200 || res.statusCode >= 300) {
          return reject(new Error(`HTTP Status Code: ${res.statusCode} ${res.statusMessage || ''}`));
        }

        let body = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => { body += chunk; });
        res.on('end', () => resolve(body));
      });

      req.on('error', (err) => reject(err));

      req.setTimeout(this.timeout, () => {
        req.destroy();
        reject(new Error(`Request timed out after ${this.timeout}ms`));
      });

      req.end();
    });
  }
}

module.exports = { FetchEngine };