const https = require('https');
const fs = require('fs');
const path = require('path');

class FetchEngine {
    fetchRemoteTree(url) {
        return new Promise((resolve, reject) => {
            https.get(url, { headers: { 'User-Agent': 'node.js' } }, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    try {
                        const json = JSON.parse(data);
                        resolve(json.tree.filter(f => f.type === 'blob'));
                    } catch (e) { reject(e); }
                });
            }).on('error', reject);
        });
    }

    walkDirectory(dir) {
        let results = [];
        if (!fs.existsSync(dir)) return [];
        const list = fs.readdirSync(dir);
        list.forEach(file => {
            file = path.join(dir, file);
            const stat = fs.statSync(file);
            if (stat && stat.isDirectory()) results = results.concat(this.walkDirectory(file));
            else results.push(file);
        });
        return results;
    }
}
module.exports = { FetchEngine };