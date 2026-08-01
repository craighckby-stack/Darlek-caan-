/**
 * FETCH ENGINE
 * Role: Secure, resilient HTTP transport layer for repository data.
 */

const https = require('https');

class FetchEngine {
  constructor() {
    this.token = process.env.GITHUB_TOKEN;
    this.timeout = parseInt(process.env.FETCH_TIMEOUT_MS || '15000', 10);
  }

  async secureFetch(url) {
    return new Promise((resolve, reject) => {
      const options = {
        headers: {
          'User-Agent': 'Darlek-Caan-Evolution-Engine',
          'Accept': 'application/vnd.github.v3+json',
          ...(this.token ? { 'Authorization': `token ${this.token}` } : {})
        },
        timeout: this.timeout
      };

      const req = https.get(url, options, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          return this.secureFetch(res.headers.location).then(resolve).catch(reject);
        }

        if (res.statusCode !== 200) {
          return reject(new Error(`Request failed with status ${res.statusCode}`));
        }

        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => resolve(data));
      });

      req.on('error', reject);
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timed out'));
      });
    });
  }
}

module.exports = { FetchEngine };