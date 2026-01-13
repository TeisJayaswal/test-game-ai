import * as fs from 'fs';
import * as path from 'path';

export interface CreateProjectOptions {
  vr?: boolean;
  multiplayer?: boolean;
}

/**
 * Check if a directory contains a valid Unity project structure
 */
export function isValidUnityProject(projectPath: string): boolean {
  const requiredDirs = ['Assets', 'Packages', 'ProjectSettings'];
  const requiredFiles = [
    'Packages/manifest.json',
    'ProjectSettings/ProjectVersion.txt',
  ];

  // Check directories exist
  for (const dir of requiredDirs) {
    if (!fs.existsSync(path.join(projectPath, dir))) {
      return false;
    }
  }

  // Check files exist
  for (const file of requiredFiles) {
    if (!fs.existsSync(path.join(projectPath, file))) {
      return false;
    }
  }

  return true;
}

/**
 * Get the Unity version from a project's ProjectVersion.txt
 */
export function getProjectVersion(projectPath: string): string | null {
  const versionPath = path.join(projectPath, 'ProjectSettings', 'ProjectVersion.txt');

  if (!fs.existsSync(versionPath)) {
    return null;
  }

  const content = fs.readFileSync(versionPath, 'utf-8');
  const match = content.match(/m_EditorVersion:\s*(.+)/);

  return match ? match[1].trim() : null;
}

/**
 * Create a Unity project directory structure
 */
export async function createUnityProjectStructure(
  projectPath: string,
  options: CreateProjectOptions = {}
): Promise<void> {
  // Create main directories
  const directories = [
    '',
    'Assets',
    'Assets/Scenes',
    'Assets/Scripts',
    'Assets/Resources',
    'Packages',
    'ProjectSettings',
  ];

  for (const dir of directories) {
    fs.mkdirSync(path.join(projectPath, dir), { recursive: true });
  }

  // Create Packages/manifest.json
  const manifest = createPackageManifest(options);
  fs.writeFileSync(
    path.join(projectPath, 'Packages', 'manifest.json'),
    JSON.stringify(manifest, null, 2)
  );

  // Create ProjectSettings/ProjectVersion.txt
  fs.writeFileSync(
    path.join(projectPath, 'ProjectSettings', 'ProjectVersion.txt'),
    'm_EditorVersion: 2022.3.0f1\nm_EditorVersionWithRevision: 2022.3.0f1 (1234567890ab)'
  );

  // Create ProjectSettings/ProjectSettings.asset (minimal)
  fs.writeFileSync(
    path.join(projectPath, 'ProjectSettings', 'ProjectSettings.asset'),
    createProjectSettingsAsset(path.basename(projectPath))
  );
}

function createPackageManifest(options: CreateProjectOptions): object {
  const dependencies: Record<string, string> = {
    'com.normalvr.normcore': '2.14.0',
    'com.unity.textmeshpro': '3.0.6',
    'com.unity.ugui': '1.0.0',
  };

  if (options.vr) {
    dependencies['com.unity.xr.interaction.toolkit'] = '3.0.3';
    dependencies['com.unity.xr.management'] = '4.4.0';
    dependencies['com.unity.inputsystem'] = '1.7.0';
  }

  return {
    dependencies,
    scopedRegistries: [
      {
        name: 'Normal',
        url: 'https://normcore.io/registry',
        scopes: ['com.normalvr'],
      },
    ],
  };
}

function createProjectSettingsAsset(projectName: string): string {
  return `%YAML 1.1
%TAG !u! tag:unity3d.com,2011:
--- !u!129 &1
PlayerSettings:
  m_ObjectHideFlags: 0
  serializedVersion: 26
  productGUID: 00000000000000000000000000000000
  productName: ${projectName}
  companyName: DefaultCompany
  defaultScreenWidth: 1920
  defaultScreenHeight: 1080
`;
}
