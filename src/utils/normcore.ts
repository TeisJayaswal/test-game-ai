import * as fs from 'fs';
import * as path from 'path';

/**
 * Path to NormcoreAppSettings.asset relative to project root
 */
const APP_SETTINGS_PATH = 'Assets/Normal/Resources/NormcoreAppSettings.asset';

/**
 * Inject the Normcore app key into the NormcoreAppSettings.asset file
 */
export function injectAppKey(projectPath: string, appKey: string): void {
  const settingsPath = path.join(projectPath, APP_SETTINGS_PATH);

  if (!fs.existsSync(settingsPath)) {
    throw new Error(`NormcoreAppSettings.asset not found at ${settingsPath}`);
  }

  let content = fs.readFileSync(settingsPath, 'utf-8');

  // Replace the empty app key with the provided one
  // Format: _normcoreAppKey: value (or empty)
  content = content.replace(
    /(_normcoreAppKey:).*$/m,
    `$1 ${appKey}`
  );

  fs.writeFileSync(settingsPath, content, 'utf-8');
}

/**
 * Check if the app key is set in NormcoreAppSettings.asset
 */
export function hasAppKey(projectPath: string): boolean {
  const settingsPath = path.join(projectPath, APP_SETTINGS_PATH);

  if (!fs.existsSync(settingsPath)) {
    return false;
  }

  const content = fs.readFileSync(settingsPath, 'utf-8');
  // Match app key on the same line only (use [^\n] instead of \s to avoid crossing lines)
  const match = content.match(/_normcoreAppKey:[ \t]*(\S+)/);

  return match !== null && match[1] !== undefined && match[1].length > 0;
}
