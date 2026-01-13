import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface TemplateVariables {
  appKey: string;
  projectName: string;
}

/**
 * Sanitizes a template name to prevent path traversal attacks.
 * Only allows alphanumeric characters, dashes, and underscores.
 */
function sanitizeTemplateName(name: string): string {
  if (!/^[a-zA-Z0-9-_]+$/.test(name)) {
    throw new Error(`Invalid template name: ${name}. Only alphanumeric characters, dashes, and underscores are allowed.`);
  }
  return name;
}

/**
 * Validates that a destination path is within the current working directory.
 */
function validateDestPath(destPath: string): string {
  const resolvedDest = path.resolve(destPath);
  const cwd = process.cwd();

  // Ensure the destination is within the current working directory
  if (!resolvedDest.startsWith(cwd + path.sep) && resolvedDest !== cwd) {
    throw new Error('Destination must be within current directory');
  }

  return resolvedDest;
}

/**
 * Copies a template directory to the destination, substituting variables.
 */
export function copyTemplate(
  templateName: string,
  destPath: string,
  variables: TemplateVariables
): void {
  // Security: sanitize template name to prevent path traversal
  const safeTemplateName = sanitizeTemplateName(templateName);

  // Security: validate destination path
  validateDestPath(destPath);

  const templateDir = getTemplateDir(safeTemplateName);
  copyDirRecursive(templateDir, destPath, variables);
}

/**
 * Gets the path to a template directory.
 * Handles both development (src/templates) and production (dist/../src/templates) paths.
 */
function getTemplateDir(name: string): string {
  // Development: src/utils -> src/templates
  const devPath = path.join(__dirname, '..', 'templates', name);
  // Production: dist/utils -> src/templates
  const prodPath = path.join(__dirname, '..', '..', 'src', 'templates', name);

  if (fs.existsSync(devPath)) return devPath;
  if (fs.existsSync(prodPath)) return prodPath;

  throw new Error(`Template directory not found: ${name}`);
}

/**
 * Recursively copies a directory, substituting template variables in file contents.
 * Skips symbolic links for security.
 */
function copyDirRecursive(
  src: string,
  dest: string,
  variables: TemplateVariables
): void {
  fs.mkdirSync(dest, { recursive: true });

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    // Security: skip symbolic links to prevent escaping template directory
    if (entry.isSymbolicLink()) {
      console.warn(`Skipping symbolic link: ${srcPath}`);
      continue;
    }

    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath, variables);
    } else if (entry.isFile()) {
      copyFileWithSubstitution(srcPath, destPath, variables);
    }
  }
}

/**
 * Copies a file, substituting template variables in the content.
 * Only performs substitution on text files.
 */
function copyFileWithSubstitution(
  src: string,
  dest: string,
  variables: TemplateVariables
): void {
  // Text file extensions for Unity projects
  const textExtensions = [
    '.md', '.txt', '.json', '.cs', '.meta', '.asset', '.unity',
    '.prefab', '.mat', '.yml', '.yaml', '.asmdef', '.asmref',
    '.xml', '.shader', '.cginc', '.hlsl', '.compute',
  ];
  const ext = path.extname(src).toLowerCase();
  const basename = path.basename(src);

  // Treat dotfiles without extension as text (like .gitignore), but not .DS_Store
  const isTextFile = textExtensions.includes(ext) ||
    (basename.startsWith('.') && ext === '' && basename !== '.DS_Store');

  try {
    if (isTextFile) {
      let content = fs.readFileSync(src, 'utf-8');

      // Substitute variables
      content = content.replace(/\{\{APP_KEY\}\}/g, variables.appKey);
      content = content.replace(/\{\{PROJECT_NAME\}\}/g, variables.projectName);

      fs.writeFileSync(dest, content);
    } else {
      // Binary file - just copy
      fs.copyFileSync(src, dest);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to copy ${src} to ${dest}: ${message}`);
  }
}

/**
 * Lists available templates.
 */
export function listTemplates(): string[] {
  const templatesDir = path.join(__dirname, '..', 'templates');
  if (!fs.existsSync(templatesDir)) {
    return [];
  }

  return fs.readdirSync(templatesDir, { withFileTypes: true })
    .filter(entry => entry.isDirectory() && !entry.isSymbolicLink())
    .map(entry => entry.name);
}
