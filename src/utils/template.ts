import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import * as os from 'os';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// GitHub repo for downloading template
const GITHUB_REPO = 'TeisJayaswal/test-game-ai';
const TEMPLATE_BRANCH = 'main';

/**
 * Get the path to the cached template directory
 */
function getCachedTemplatePath(): string {
  const home = process.env.HOME || process.env.USERPROFILE || '';
  return path.join(home, '.gamekit', 'template');
}

/**
 * Get the path to the template directory (local dev or cached)
 */
export function getTemplatePath(): string {
  // First, try local development path
  const localPath = path.join(__dirname, '..', '..', 'template');
  if (fs.existsSync(localPath) && fs.existsSync(path.join(localPath, '.claude'))) {
    return localPath;
  }

  // Check for cached template
  const cachedPath = getCachedTemplatePath();
  if (fs.existsSync(cachedPath) && fs.existsSync(path.join(cachedPath, '.claude'))) {
    return cachedPath;
  }

  throw new Error(
    `Template not found. Run 'gamekit install-commands' first or check your installation.`
  );
}

/**
 * Download file from URL
 */
function downloadFile(url: string, dest: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const options = {
      headers: { 'User-Agent': 'gamekit' }
    };

    https.get(url, options, (res) => {
      // Handle redirects
      if (res.statusCode === 301 || res.statusCode === 302) {
        const redirectUrl = res.headers.location;
        if (redirectUrl) {
          downloadFile(redirectUrl, dest).then(resolve).catch(reject);
          return;
        }
      }

      if (res.statusCode !== 200) {
        reject(new Error(`Failed to download: ${res.statusCode}`));
        return;
      }

      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', reject);
  });
}

/**
 * Download and cache the template from GitHub
 */
export async function downloadTemplate(): Promise<string> {
  const cachedPath = getCachedTemplatePath();
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gamekit-template-'));
  const tarballPath = path.join(tempDir, 'template.tar.gz');

  try {
    // Download tarball from GitHub
    const tarballUrl = `https://github.com/${GITHUB_REPO}/archive/refs/heads/${TEMPLATE_BRANCH}.tar.gz`;
    console.log('Downloading template from GitHub...');
    await downloadFile(tarballUrl, tarballPath);

    // Extract tarball
    execSync(`tar -xzf "${tarballPath}" -C "${tempDir}"`, { stdio: 'ignore' });

    // Find the extracted directory (it will be named like repo-branch)
    const extractedDir = fs.readdirSync(tempDir).find(f =>
      f.startsWith('test-game-ai-') && fs.statSync(path.join(tempDir, f)).isDirectory()
    );

    if (!extractedDir) {
      throw new Error('Failed to find extracted template directory');
    }

    const templateSrc = path.join(tempDir, extractedDir, 'template');

    if (!fs.existsSync(templateSrc)) {
      throw new Error('Template directory not found in downloaded archive');
    }

    // Remove old cached template if exists
    if (fs.existsSync(cachedPath)) {
      fs.rmSync(cachedPath, { recursive: true, force: true });
    }

    // Copy to cache location
    fs.mkdirSync(path.dirname(cachedPath), { recursive: true });
    copyDirectorySync(templateSrc, cachedPath);

    console.log('Template cached successfully.');
    return cachedPath;
  } finally {
    // Cleanup temp directory
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

/**
 * Ensure template is available (download if needed)
 */
export async function ensureTemplate(): Promise<string> {
  try {
    return getTemplatePath();
  } catch {
    // Template not found, download it
    return await downloadTemplate();
  }
}

/**
 * Copy the Unity project template to a destination directory
 */
export function copyTemplate(destPath: string): void {
  const templatePath = getTemplatePath();
  copyDirectorySync(templatePath, destPath);
}

/**
 * Copy the Unity project template to a destination directory (async, downloads if needed)
 */
export async function copyTemplateAsync(destPath: string): Promise<void> {
  const templatePath = await ensureTemplate();
  copyDirectorySync(templatePath, destPath);
}

/**
 * Recursively copy a directory
 */
function copyDirectorySync(src: string, dest: string): void {
  fs.mkdirSync(dest, { recursive: true });

  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    // Skip symlinks for security
    if (entry.isSymbolicLink()) {
      continue;
    }

    if (entry.isDirectory()) {
      copyDirectorySync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}
