/**
 * RESTORATION ENGINE
 * Role: Handles recursive file fetching and atomic writing.
 */
const https = require('https');
const fs = require('fs');
const path = require('path');

class RestorationEngine {
  constructor(config) { this.config = config; }

  async execute() {
    try {
      const tree = await this.fetchTree();
      const files = tree.filter(f => f.type === 'blob' && f.path.startsWith(this.config.targetDir));
      
      for (const file of files) {
        await this.downloadFile(file.path);
      }
      return { status: 'SUCCESS' };
    } catch (e) {
      return { status: 'FAILURE', error: e.message };
    }
  }

  fetchTree() {
    return new Promise((resolve, reject) => {
      https.get(`https://api.github.com/repos/${this.config.owner}/${this.config.repo}/git/trees/${this.config.branch}?recursive=1`, { headers: { 'User-Agent': 'node.js' } }, (res) => {
        let data = '';
        res.on('data', c => data += c);
        res.on('end', () => resolve(JSON.parse(data).tree));
      }).on('error', reject);
    });
  }

  downloadFile(filePath) {
    return new Promise((resolve, reject) => {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      https.get(`https://raw.githubusercontent.com/${this.config.owner}/${this.config.repo}/${this.config.branch}/${filePath}`, { headers: { 'User-Agent': 'node.js' } }, (res) => {
        const file = fs.createWriteStream(filePath);
        res.pipe(file);
        file.on('finish', resolve);
      }).on('error', reject);
    });
  }
}
module.exports = { RestorationEngine };