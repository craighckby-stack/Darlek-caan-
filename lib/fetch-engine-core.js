const https = require('https');

class FetchEngine {
  constructor(config) {
    this.url = config.url;
    this.timeout = config.timeout || 5000;
  }

  async fetch() {
    return new Promise((resolve, reject) => {
      const req = https.get(this.url, { headers: { 'User-Agent': 'node.js-diagnostic-engine' } }, (res) => {
        if (res.statusCode !== 200) return reject(new Error(`Status Code: ${res.statusCode}`));
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(data));
      });
      req.on('error', reject);
      req.setTimeout(this.timeout, () => {
        req.destroy();
        reject(new Error('Request Timeout'));
      });
    });
  }
}

module.exports = { FetchEngine };