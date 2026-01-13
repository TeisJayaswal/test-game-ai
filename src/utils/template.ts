import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Get the path to the template directory
 */
export function getTemplatePath(): string {
  // In dev: src/utils/template.ts -> ../../template
  // In prod: dist/utils/template.js -> ../../template
  const templatePath = path.join(__dirname, '..', '..', 'template');
  if (fs.existsSync(templatePath)) {
    return templatePath;
  }
  throw new Error(`Template not found at ${templatePath}`);
}

/**
 * Copy the Unity project template to a destination directory
 */
export function copyTemplate(destPath: string): void {
  const templatePath = getTemplatePath();
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
