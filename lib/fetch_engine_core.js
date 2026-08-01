const fs = require('fs');
const https = require('https');

class FetchEngine {
  constructor(url) {
    this.url = url;
  }

  async download(dest) {
    return new Promise((resolve, reject) => {
      https.get(this.url, { headers: { 'User-Agent': 'Node-Diagnostic-Engine' } }, (res) => {
        if (res.statusCode !== 200) return reject(new Error(`Status Code: ${res.statusCode}`));
        const file = fs.createWriteStream(dest);
        res.pipe(file);
        file.on('finish', () => file.close(resolve(true)));
      }).on('error', reject);
    });
  }
}

module.exports = { FetchEngine };