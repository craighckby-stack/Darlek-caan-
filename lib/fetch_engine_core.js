/**
 * ARCHITECTURAL FETCH ENGINE CORE
 * Role: Provides resilient, retry-aware, telemetry-monitored HTTP/HTTPS data retrieval.
 * Integration: Exported class FetchEngine used by repo fetchers and diagnostic modules.
 */

const https = require('https');
const http = require('http');
const { URL } = require('url');

class FetchEngine {
  /**
   * @param {string} url - Target URL to fetch
   * @param {object} [options] - Fetch configuration (headers, timeout, retries)
   */
  constructor(url, options = {}) {
    this.url = url;
    this.options = {
      timeout: options.timeout || parseInt(process.env.FETCH_TIMEOUT_MS, 10) || 15000,
      retries: options.retries || parseInt(process.env.FETCH_RETRIES, 10) || 3,
      headers: {
        'Accept': 'application/json, text/plain, */*',
        ...(options.headers || {})
      },
      ...options
    };
  }

  /**
   * Executes the HTTP request with exponential backoff and retry mechanism.
   * @returns {Promise<any>}
   */
  async execute() {
    let lastError = null;
    let attempt = 0;

    while (attempt < this.options.retries) {
      attempt++;
      try {
        const result = await this._performRequest(this.url);
        return result;
      } catch (err) {
        lastError = err;
        if (attempt < this.options.retries) {
          const backoffMs = Math.pow(2, attempt) * 500;
          await new Promise((resolve) => setTimeout(resolve, backoffMs));
        }
      }
    }

    throw new Error(`FetchEngine failed after ${attempt} attempts. Last error: ${lastError ? lastError.message : 'Unknown'}`);
  }

  /**
   * Internal request helper supporting redirects and JSON parsing.
   * @private
   */
  _performRequest(targetUrl) {
    return new Promise((resolve, reject) => {
      try {
        const parsedUrl = new URL(targetUrl);
        const protocol = parsedUrl.protocol === 'https:' ? https : http;

        const reqOptions = {
          protocol: parsedUrl.protocol,
          hostname: parsedUrl.hostname,
          port: parsedUrl.port,
          path: parsedUrl.pathname + parsedUrl.search,
          method: 'GET',
          headers: this.options.headers,
          timeout: this.options.timeout
        };

        const req = protocol.request(reqOptions, (res) => {
          // Handle redirects
          if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
            const redirectUrl = new URL(res.headers.location, targetUrl).toString();
            return this._performRequest(redirectUrl).then(resolve).catch(reject);
          }

          if (res.statusCode < 200 || res.statusCode >= 300) {
            return reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
          }

          let body = '';
          res.setEncoding('utf8');
          res.on('data', (chunk) => { body += chunk; });
          res.on('end', () => {
            try {
              const contentType = res.headers['content-type'] || '';
              if (contentType.includes('application/json') || body.trim().startsWith('{') || body.trim().startsWith('[')) {
                resolve(JSON.parse(body));
              } else {
                resolve(body);
              }
            } catch (jsonErr) {
              resolve(body);
            }
          });
        });

        req.on('error', (err) => reject(err));
        req.on('timeout', () => {
          req.destroy();
          reject(new Error(`Request timed out after ${this.options.timeout}ms`));
        });

        req.end();
      } catch (err) {
        reject(err);
      }
    });
  }
}

module.exports = { FetchEngine };
