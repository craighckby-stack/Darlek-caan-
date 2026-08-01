/**
 * FILE COMPARATOR UTILITIES
 * Role: Provides core logic for filesystem traversal and diffing.
 * Siphoned from AI_Agent_OS diagnostic patterns.
 */

const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(fullPath));
    } else {
      results.push(fullPath.replace(/\\/g, '/'));
    }
  });
  return results;
}

function performComparison(remoteFiles, localDir) {
  const localFiles = walk(localDir);
  const remoteOnly = remoteFiles.filter(f => f.startsWith(localDir + '/') && !localFiles.includes(f));
  const localOnly = localFiles.filter(f => !remoteFiles.includes(f));
  
  return { remoteOnly, localOnly };
}

module.exports = { performComparison };