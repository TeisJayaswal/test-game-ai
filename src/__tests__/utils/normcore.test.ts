import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { injectAppKey, hasAppKey } from '../../utils/normcore.js';

describe('normcore utils', () => {
  let testDir: string;
  let settingsPath: string;

  const SAMPLE_ASSET = `%YAML 1.1
%TAG !u! tag:unity3d.com,2011:
--- !u!114 &11400000
MonoBehaviour:
  m_ObjectHideFlags: 0
  m_CorrespondingSourceObject: {fileID: 0}
  m_PrefabInstance: {fileID: 0}
  m_PrefabAsset: {fileID: 0}
  m_GameObject: {fileID: 0}
  m_Enabled: 1
  m_EditorHideFlags: 0
  m_Script: {fileID: 1488926636, guid: ebae63e7edba59945a994528ada1f7a2, type: 3}
  m_Name: NormcoreAppSettings
  m_EditorClassIdentifier:
  _normcoreAppKey:
  _matcherURL: wss://normcore-matcher.normcore.io:3000
`;

  beforeEach(() => {
    testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'game-ai-normcore-test-'));
    const normalResourcesDir = path.join(testDir, 'Assets', 'Normal', 'Resources');
    fs.mkdirSync(normalResourcesDir, { recursive: true });
    settingsPath = path.join(normalResourcesDir, 'NormcoreAppSettings.asset');
    fs.writeFileSync(settingsPath, SAMPLE_ASSET);
  });

  afterEach(() => {
    fs.rmSync(testDir, { recursive: true, force: true });
  });

  describe('hasAppKey', () => {
    it('should return false when app key is empty', () => {
      expect(hasAppKey(testDir)).toBe(false);
    });

    it('should return true when app key is set', () => {
      injectAppKey(testDir, 'test-app-key-12345');
      expect(hasAppKey(testDir)).toBe(true);
    });

    it('should return false when settings file does not exist', () => {
      fs.rmSync(settingsPath);
      expect(hasAppKey(testDir)).toBe(false);
    });
  });

  describe('injectAppKey', () => {
    it('should inject app key into settings file', () => {
      const appKey = 'my-test-app-key-67890';
      injectAppKey(testDir, appKey);

      const content = fs.readFileSync(settingsPath, 'utf-8');
      expect(content).toContain(`_normcoreAppKey: ${appKey}`);
    });

    it('should replace existing app key', () => {
      injectAppKey(testDir, 'first-key');
      injectAppKey(testDir, 'second-key');

      const content = fs.readFileSync(settingsPath, 'utf-8');
      expect(content).toContain('_normcoreAppKey: second-key');
      expect(content).not.toContain('first-key');
    });

    it('should preserve other settings', () => {
      injectAppKey(testDir, 'test-key');

      const content = fs.readFileSync(settingsPath, 'utf-8');
      expect(content).toContain('_matcherURL: wss://normcore-matcher.normcore.io:3000');
      expect(content).toContain('%YAML 1.1');
    });

    it('should throw when settings file does not exist', () => {
      fs.rmSync(settingsPath);
      expect(() => injectAppKey(testDir, 'test-key')).toThrow('NormcoreAppSettings.asset not found');
    });
  });
});
