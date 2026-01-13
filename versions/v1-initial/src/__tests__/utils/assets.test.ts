import { describe, it, expect } from 'vitest';
import {
  getKenneyAssetUrl,
  getPolyhavenApiUrl,
  getAssetImportPath,
} from '../../utils/assets.js';

describe('Asset utilities', () => {
  describe('getKenneyAssetUrl', () => {
    it('returns correct URL for asset pack', () => {
      const url = getKenneyAssetUrl('kenney-blocks');
      expect(url).toBe('https://kenney.nl/assets/kenney-blocks');
    });

    it('handles asset packs with spaces (converted to dashes)', () => {
      const url = getKenneyAssetUrl('3d-platformer');
      expect(url).toBe('https://kenney.nl/assets/3d-platformer');
    });
  });

  describe('getPolyhavenApiUrl', () => {
    it('returns correct API URL for assets list', () => {
      const url = getPolyhavenApiUrl('assets');
      expect(url).toBe('https://api.polyhaven.com/assets');
    });

    it('returns correct API URL for specific asset type', () => {
      const url = getPolyhavenApiUrl('assets', { type: 'hdris' });
      expect(url).toBe('https://api.polyhaven.com/assets?type=hdris');
    });

    it('returns correct API URL for textures', () => {
      const url = getPolyhavenApiUrl('assets', { type: 'textures' });
      expect(url).toBe('https://api.polyhaven.com/assets?type=textures');
    });
  });

  describe('getAssetImportPath', () => {
    it('returns path under Assets folder', () => {
      const path = getAssetImportPath('/project', 'Models', 'player.fbx');
      expect(path).toBe('/project/Assets/Models/player.fbx');
    });

    it('creates correct path for textures', () => {
      const path = getAssetImportPath('/project', 'Textures', 'wood.png');
      expect(path).toBe('/project/Assets/Textures/wood.png');
    });

    it('handles nested folders', () => {
      const path = getAssetImportPath('/project', 'Models/Characters', 'hero.fbx');
      expect(path).toBe('/project/Assets/Models/Characters/hero.fbx');
    });
  });
});
