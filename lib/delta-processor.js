/**
 * DELTA PROCESSOR
 * Role: Logic for local file scanning and Git-compatible SHA comparison.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class DeltaProcessor {
  /**
   * Calculates the Git blob SHA-1 for a given buffer.
   * Formula: sha1("blob " + size + "\0" + content)
   */
  calculateGitSha(buffer) {
    const header = `blob ${buffer.length}\0`;
    const store = Buffer.concat([Buffer.from(header), buffer]);
    return crypto.createHash('sha1').update(store).digest('hex');
  }

  async scanLocalDirectory(dir, baseDir = dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    
    for (const file of list) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      
      if (stat && stat.isDirectory()) {
        if (file !== '.git' && file !== 'node_modules') {
          results = results.concat(await this.scanLocalDirectory(fullPath, baseDir));
        }
      } else {
        const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, '/');
        const content = fs.readFileSync(fullPath);
        results.push({
          path: relativePath,
          sha: this.calculateGitSha(content),
          size: stat.size
        });
      }
    }
    return results;
  }

  compareStates(remoteFiles, localFiles) {
    const report = {
      added: [],
      modified: [],
      deleted: [],
      unchanged: []
    };

    const localMap = new Map(localFiles.map(f => [f.path, f]));
    const remoteMap = new Map(remoteFiles.map(f => [f.path, f]));

    // Check remote files against local
    for (const [path, remoteFile] of remoteMap) {
      const localFile = localMap.get(path);
      if (!localFile) {
        report.added.push(path); // Missing locally, needs to be added
      } else if (localFile.sha !== remoteFile.sha) {
        report.modified.push(path);
      } else {
        report.unchanged.push(path);
      }
    }

    // Check for local files that don't exist on remote
    for (const [path] of localMap) {
      if (!remoteMap.has(path)) {
        report.deleted.push(path); // Exists locally but not on remote
      }
    }

    return report;
  }
}

module.exports = { DeltaProcessor };