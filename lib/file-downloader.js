const https = require('https');
const fs = require('fs');
const path = require('path');

class FileDownloader {
  async download(url, dest) {
    return new Promise((resolve) => {
      const file = fs.createWriteStream(dest);
      https.get(url, { headers: { 'User-Agent': 'Darlek-Caan-Engine' } }, (res) => {
        if (res.statusCode !== 200) {
          return resolve({ success: false, error: `HTTP ${res.statusCode}` });
        }
        res.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve({ success: true, bytesWritten: res.headers['content-length'] });
        });
      }).on('error', (err) => {
        fs.unlink(dest, () => {});
        resolve({ success: false, error: err.message });
      });
    });
  }
}
module.exports = { FileDownloader };