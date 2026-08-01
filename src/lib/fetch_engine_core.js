const https = require('https');

class FetchEngine {
  async fetch(url) {
    return new Promise((resolve, reject) => {
      https.get(url, { headers: { 'User-Agent': 'Diagnostic-Agent-OS/1.0' } }, (res) => {
        if (res.statusCode !== 200) return reject(new Error(`Status Code: ${res.statusCode}`));
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(data));
      }).on('error', reject);
    });
  }
}

module.exports = { FetchEngine };