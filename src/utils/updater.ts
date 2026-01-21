import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Package info
const PACKAGE_NAME = 'gamekit-cli';

/**
 * Get the path to the gamekit config directory (~/.gamekit)
 */
export function getConfigDir(): string {
  const home = process.env.HOME || process.env.USERPROFILE || '';
  const configDir = path.join(home, '.gamekit');

  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }

  return configDir;
}

/**
 * Get the current version from package.json
 */
export function getCurrentVersion(): string {
  try {
    // Try to find package.json relative to this module
    const pkgPath = path.resolve(__dirname, '..', '..', 'package.json');
    if (fs.existsSync(pkgPath)) {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
      return pkg.version;
    }
  } catch {
    // Ignore errors
  }
  return '0.0.0';
}

/**
 * Fetch the latest version from npm registry
 */
export function fetchLatestVersion(): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = `https://registry.npmjs.org/${PACKAGE_NAME}/latest`;

    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json.version || '0.0.0');
        } catch {
          reject(new Error('Failed to parse npm registry response'));
        }
      });
    }).on('error', reject);
  });
}

/**
 * Compare semver versions
 * Returns: 1 if a > b, -1 if a < b, 0 if equal
 */
export function compareVersions(a: string, b: string): number {
  const partsA = a.split('.').map(Number);
  const partsB = b.split('.').map(Number);

  for (let i = 0; i < 3; i++) {
    const numA = partsA[i] || 0;
    const numB = partsB[i] || 0;
    if (numA > numB) return 1;
    if (numA < numB) return -1;
  }
  return 0;
}

/**
 * Log update activity
 */
export function logUpdate(message: string): void {
  const configDir = getConfigDir();
  const logPath = path.join(configDir, 'update.log');
  const timestamp = new Date().toISOString();
  const logLine = `[${timestamp}] ${message}\n`;

  fs.appendFileSync(logPath, logLine);
}

/**
 * Check for updates and install in background (non-blocking)
 * This spawns a detached process that runs independently
 */
export function checkForUpdatesInBackground(): void {
  const currentVersion = getCurrentVersion();
  const configDir = getConfigDir();

  // Create the update script inline
  const updateScript = `
    const https = require('https');
    const { execSync } = require('child_process');
    const fs = require('fs');
    const path = require('path');

    const PACKAGE_NAME = '${PACKAGE_NAME}';
    const currentVersion = '${currentVersion}';
    const configDir = '${configDir.replace(/\\/g, '\\\\')}';
    const logPath = path.join(configDir, 'update.log');

    function log(msg) {
      const timestamp = new Date().toISOString();
      fs.appendFileSync(logPath, '[' + timestamp + '] ' + msg + '\\n');
    }

    function fetchLatestVersion() {
      return new Promise((resolve, reject) => {
        https.get('https://registry.npmjs.org/' + PACKAGE_NAME + '/latest', (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            try {
              resolve(JSON.parse(data).version || '0.0.0');
            } catch (e) {
              reject(e);
            }
          });
        }).on('error', reject);
      });
    }

    function compareVersions(a, b) {
      const partsA = a.split('.').map(Number);
      const partsB = b.split('.').map(Number);
      for (let i = 0; i < 3; i++) {
        if ((partsA[i] || 0) > (partsB[i] || 0)) return 1;
        if ((partsA[i] || 0) < (partsB[i] || 0)) return -1;
      }
      return 0;
    }

    async function main() {
      try {
        log('Checking for updates... (current: ' + currentVersion + ')');
        const latest = await fetchLatestVersion();
        log('Latest version: ' + latest);

        if (compareVersions(latest, currentVersion) > 0) {
          log('New version available! Updating...');
          try {
            execSync('npm install -g ${PACKAGE_NAME}@' + latest, {
              stdio: 'ignore',
              timeout: 60000 // 60 second timeout
            });
            log('Updated to version ' + latest + ' successfully!');
          } catch (e) {
            log('Update failed: ' + e.message);
          }
        } else {
          log('Already up to date.');
        }
      } catch (e) {
        log('Update check failed: ' + e.message);
      }
    }

    main();
  `;

  // Spawn detached Node process to run the update script
  const child = spawn(process.execPath, ['-e', updateScript], {
    detached: true,
    stdio: 'ignore',
    // Use shell on Windows for better compatibility
    shell: process.platform === 'win32'
  });

  // Unref so parent can exit independently
  child.unref();
}

/**
 * Check if we should run an update check
 * Limits checks to once per hour to avoid hammering npm registry
 */
export function shouldCheckForUpdates(): boolean {
  const configDir = getConfigDir();
  const lastCheckPath = path.join(configDir, 'last-update-check');

  try {
    if (fs.existsSync(lastCheckPath)) {
      const lastCheck = parseInt(fs.readFileSync(lastCheckPath, 'utf-8'), 10);
      const hourAgo = Date.now() - (60 * 60 * 1000);

      if (lastCheck > hourAgo) {
        return false; // Checked less than an hour ago
      }
    }
  } catch {
    // Ignore errors, proceed with check
  }

  // Update last check time
  try {
    fs.writeFileSync(lastCheckPath, Date.now().toString());
  } catch {
    // Ignore write errors
  }

  return true;
}

/**
 * Main entry point - check for updates if appropriate
 */
export function maybeCheckForUpdates(): void {
  // Skip update checks in development
  if (process.env.GAMEKIT_NO_UPDATE_CHECK) {
    return;
  }

  if (shouldCheckForUpdates()) {
    checkForUpdatesInBackground();
  }
}
