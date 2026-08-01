/**
 * FETCH ENGINE CORE
 * Role: Networking and file-system inspection engine for repository synchronization.
 * Integration: Leveraged by fetch_missing.js for remote HTTP/HTTPS requests and directory tree scanning.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

class FetchEngine {
    constructor(options = {}) {
        this.timeout = options.timeout || 15000;
        this.token = options.token || process.env.GITHUB_TOKEN || null;
    }

    /**
     * Fetches remote tree structure from GitHub API or standard JSON endpoint.
     * @param {string} url 
     * @returns {Promise<Array<{path: string, type: string, sha: string}>>}
     */     async fetchRemoteTree(url) {
        return new Promise((resolve, reject) => {
            const parsedUrl = new URL(url);
            const client = parsedUrl.protocol === 'https:' ? https : http;

            const headers = {
                'User-Agent': 'Darlek-Caan-DiagnosticEngine/1.0',
                'Accept': 'application/vnd.github.v3+json'
            };

            if (this.token) {
                headers['Authorization'] = `token ${this.token}`;
            }

            const req = client.get(url, { headers, timeout: this.timeout }, (res) => {
                let data = '';

                if (res.statusCode < 200 || res.statusCode >= 300) {
                    return reject(new Error(`HTTP ${res.statusCode}: Failed to fetch repository tree from ${url}`));
                }

                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    try {
                        const parsed = JSON.parse(data);
                        if (parsed.tree && Array.isArray(parsed.tree)) {
                            resolve(parsed.tree);
                        } else if (Array.isArray(parsed)) {
                            resolve(parsed);
                        } else {
                            resolve([]);
                        }
                    } catch (err) {
                        reject(new Error(`Failed to parse tree JSON: ${err.message}`));
                    }
                });
            });

            req.on('error', (err) => reject(new Error(`Network error fetching tree: ${err.message}`)));
            req.on('timeout', () => {
                req.destroy();
                reject(new Error(`Timeout of ${this.timeout}ms exceeded while fetching repository tree`));
            });
        });
    }

    /**
     * Recursively scans local directory and returns array of relative paths using POSIX normalization.
     * @param {string} dirPath 
     * @returns {string[]}
     */
    walkDirectory(dirPath) {
        const fullPath = path.resolve(process.cwd(), dirPath);
        let results = [];

        if (!fs.existsSync(fullPath)) {
            return results;
        }

        const items = fs.readdirSync(fullPath, { withFileTypes: true });

        for (const item of items) {
            const relativeItemPath = path.posix.join(dirPath, item.name);
            if (item.isDirectory()) {
                results = results.concat(this.walkDirectory(relativeItemPath));
            } else if (item.isFile()) {
                results.push(relativeItemPath);
            }
        }

        return results;
    }
}

module.exports = { FetchEngine };