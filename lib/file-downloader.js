/**
 * FILE DOWNLOADER UTILITY
 * Role: Handles stream-based file downloads with directory creation and error handling.
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

class FileDownloader {
  constructor(token = null) {
    this.token = token;
  }

  async download(url, outputPath) {
    return new Promise((resolve) => {
      const options = {
        headers: {
          'User-Agent': 'DARLEK-CAAN-RESTORATION-ENGINE',
          ...(this.token ? { 'Authorization': `token ${this.token}` } : {})
        }
      };

      // Ensure directory exists
      const dir = path.dirname(outputPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const file = fs.createWriteStream(outputPath);
      let bytesWritten = 0;

      https.get(url, options, (response) => {
        if (response.statusCode !== 200) {
          file.close();
          fs.unlinkSync(outputPath);
          return resolve({ success: false, error: `HTTP ${response.statusCode}` });
        }

        response.pipe(file);

        file.on('finish', () => {
          bytesWritten = file.bytesWritten;
          file.close();
          resolve({ success: true, bytesWritten });
        });

      }).on('error', (err) => {
        fs.unlinkSync(outputPath);
        resolve({ success: false, error: err.message });
      });
    });
  }
}

module.exports = { FileDownloader };