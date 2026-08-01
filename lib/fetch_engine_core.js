const https = require('https');

class FetchEngine {
  constructor(url) {
    this.url = url;
  }

  execute() {
    return new Promise((resolve, reject) => {
      https.get(this.url, { headers: { 'User-Agent': 'node.js' } }, (res) => {
        if (res.statusCode !== 200) return reject(new Error(`Status Code: ${res.statusCode}`));
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
        });
      }).on('error', reject);
    });
  }
}

module.exports = { FetchEngine };