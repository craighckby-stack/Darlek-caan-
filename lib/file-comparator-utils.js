/**
 * FILE COMPARATOR UTILITIES
 * Role: Core logic for filesystem traversal and set-based file comparison.
 */

const fs = require('node:fs');
const path = require('node:path');

/**
 * Recursively walks a directory and returns a list of relative file paths.
 * @param {string} dir 
 * @param {string} baseDir 
 * @returns {string[]}
 */
function walkSync(dir, baseDir = dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;

  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walkSync(filePath, baseDir));
    } else {
      // Normalize to forward slashes for GitHub compatibility
      results.push(path.relative(path.dirname(baseDir), filePath).replace(/\\/g, '/'));
    }
  });
  return results;
}

/**
 * Compares remote file list against local directory.
 * @param {string[]} remoteFiles 
 * @param {string} localDir 
 */
function performComparison(remoteFiles, localDir) {
  const localFiles = walkSync(localDir);
  
  const remoteSet = new Set(remoteFiles);
  const localSet = new Set(localFiles);

  const remoteOnly = remoteFiles.filter(f => !localSet.has(f));
  const localOnly = localFiles.filter(f => !remoteSet.has(f));

  return {
    remoteOnly,
    localOnly,
    totalRemote: remoteFiles.length,
    totalLocal: localFiles.length
  };
}

/**
 * Computes summary metrics for the comparison result.
 * Siphoned from AI_Agent_OS: summarize_diagnostic_results
 */
function summarizeSyncMetrics(diff) {
  const totalIssues = diff.remoteOnly.length + diff.localOnly.length;
  const is_healthy = totalIssues === 0;
  
  // Calculate pass rate based on total files involved
  const totalFiles = Math.max(diff.totalRemote, diff.totalLocal);
  const passedFiles = totalFiles - totalIssues;
  
  return {
    total: totalFiles,
    passed: passedFiles,
    failed: totalIssues,
    is_healthy,
    pass_rate: totalFiles > 0 ? ((passedFiles / totalFiles) * 100).toFixed(2) : "100.00"
  };
}

module.exports = {
  walkSync,
  performComparison,
  summarizeSyncMetrics
};