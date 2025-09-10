const fs = require('fs');
const path = require('path');

class VersionInfo {
    constructor() {
        this.packageJson = this.loadPackageJson();
    }

    loadPackageJson() {
        const packagePath = path.join(__dirname, '../package.json');
        try {
            const packageContent = fs.readFileSync(packagePath, 'utf8');
            return JSON.parse(packageContent);
        } catch (error) {
            console.error('Error loading package.json:', error);
            return { version: '1.0.0', name: 'Generator Documente Minoritati' };
        }
    }

    getCurrentVersion() {
        return this.packageJson.version;
    }

    getAppName() {
        return this.packageJson.productName || this.packageJson.name;
    }

    getAuthor() {
        return this.packageJson.author;
    }

    getBuildInfo() {
        return {
            version: this.getCurrentVersion(),
            name: this.getAppName(),
            author: this.getAuthor(),
            buildDate: new Date().toISOString(),
            platform: process.platform,
            arch: process.arch,
            nodeVersion: process.version,
            electronVersion: process.versions.electron
        };
    }

    // Format version for display
    getVersionString() {
        return `v${this.getCurrentVersion()}`;
    }

    // Get full app info string
    getAppInfoString() {
        const info = this.getBuildInfo();
        return `${info.name} ${this.getVersionString()} - ${info.author}`;
    }

    // Check if version is newer than current
    isNewerVersion(newVersion) {
        const current = this.getCurrentVersion();
        return this.compareVersions(newVersion, current) > 0;
    }

    // Compare two version strings (returns -1, 0, or 1)
    compareVersions(v1, v2) {
        const parts1 = v1.replace(/^v/, '').split('.').map(Number);
        const parts2 = v2.replace(/^v/, '').split('.').map(Number);
        
        for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
            const part1 = parts1[i] || 0;
            const part2 = parts2[i] || 0;
            
            if (part1 > part2) return 1;
            if (part1 < part2) return -1;
        }
        
        return 0;
    }
}

module.exports = VersionInfo;