/**
 * FETCH ENGINE CORE
 * Role: Provides HTTP/HTTPS fetching mechanisms with configurable timeouts, headers, and redirect handling.
 * Integration: Used by fetch_readme.js and other network orchestration tools.
 */

const https = require('https');
const http = require('http');
const { URL } = require('url');

class FetchEngine {
  constructor(options = {}) {
    this.timeoutMs = options.timeoutMs || 10000;
    this.headers = options.headers || {};
  }

  /**
   * Fetches data from a target URL with timeout and standard HTTP header handling.
   * @param {string} targetUrl 
   * @param {object} customOptions 
   * @returns {Promise<string>}
   */
  async fetch(targetUrl, customOptions = {}) {
    const parsedUrl = new URL(targetUrl);
    const transport = parsedUrl.protocol === 'https:' ? https : http;

    const reqOptions = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'GET',
      headers: {
        'User-Agent': 'Darlek-Caan-FetchEngine/1.0',
        ...this.headers,
        ...(customOptions.headers || {})
      },
      timeout: customOptions.timeoutMs || this.timeoutMs
    };

    return new Promise((resolve, reject) => {
      const req = transport.request(reqOptions, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          const redirectUrl = new URL(res.headers.location, targetUrl).href;
          return this.fetch(redirectUrl, customOptions).then(resolve).catch(reject);
        }

        if (res.statusCode < 200 || res.statusCode >= 300) {
          return reject(new Error(`HTTP Error ${res.statusCode}: ${res.statusMessage}`));
        }

        let body = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          body += chunk;
        });

        res.on('end', () => {
          resolve(body);
        });
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error(`Request timeout after ${reqOptions.timeout}ms`));
      });

      req.on('error', (err) => {
        reject(err);
      });

      req.end();
    });
  }
}

module.exports = { FetchEngine };