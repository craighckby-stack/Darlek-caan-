const https = require('https');

class FetchEngine {
  fetch(url) {
    return new Promise((resolve, reject) => {
      https.get(url, { headers: { 'User-Agent': 'node.js' } }, (res) => {
        if (res.statusCode !== 200) reject(new Error(`Status Code: ${res.statusCode}`));
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(data));
      }).on('error', reject);
    });
  }
}
module.exports = { FetchEngine };