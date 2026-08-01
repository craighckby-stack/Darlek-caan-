/**
 * ARCHITECTURAL FETCH ENGINE CORE
 * Siphoned and evolved for resilient HTTPS stream downloading and asset fetching.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

class FetchEngine {
  constructor(url, options = {}) {
    this.url = url;
    this.timeout = options.timeout || parseInt(process.env.FETCH_TIMEOUT_MS || '10000', 10);
    this.retries = options.retries || parseInt(process.env.FETCH_RETRIES || '3', 10);
    this.token = options.token || process.env.GITHUB_TOKEN || null;
  }

  async download(destPath) {
    const dir = path.dirname(destPath);
    if (dir && dir !== '.' && !fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    let attempt = 0;
    while (attempt < this.retries) {
      attempt++;
      try {
        const success = await this._fetchStream(destPath);
        if (success) return true;
      } catch (err) {
        if (attempt >= this.retries) {
          throw err;
        }
        await new Promise((res) => setTimeout(res, 1000 * attempt));
      }
    }
    return false;
  }

  _fetchStream(destPath) {
    return new Promise((resolve, reject) => {
      const client = this.url.startsWith('https') ? https : http;
      const options = {
        headers: {
          'User-Agent': 'Darlek-Caan-FetchEngine/1.0',
          ...(this.token ? { Authorization: `token ${this.token}` } : {})
        },
        timeout: this.timeout
      };

      const request = client.get(this.url, options, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          const redirectEngine = new FetchEngine(res.headers.location, {
            timeout: this.timeout,
            retries: 1,
            token: this.token
          });
          return redirectEngine.download(destPath).then(resolve).catch(reject);
        }

        if (res.statusCode !== 200) {
          return reject(new Error(`HTTP status code ${res.statusCode}`));
        }

        const fileStream = fs.createWriteStream(destPath);
        res.pipe(fileStream);

        fileStream.on('finish', () => {
          fileStream.close(() => resolve(true));
        });

        fileStream.on('error', (err) => {
          fs.unlink(destPath, () => {});
          reject(err);
        });
      });

      request.on('timeout', () => {
        request.destroy();
        reject(new Error(`Request timed out after ${this.timeout}ms`));
      });

      request.on('error', (err) => {
        reject(err);
      });
    });
  }
}

module.exports = { FetchEngine };
