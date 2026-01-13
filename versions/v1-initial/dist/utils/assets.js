import * as path from 'path';
const KENNEY_BASE_URL = 'https://kenney.nl/assets';
const POLYHAVEN_API_URL = 'https://api.polyhaven.com';
/**
 * Get the URL for a Kenney asset pack
 */
export function getKenneyAssetUrl(assetPackSlug) {
    return `${KENNEY_BASE_URL}/${assetPackSlug}`;
}
/**
 * Get the Polyhaven API URL for querying assets
 */
export function getPolyhavenApiUrl(endpoint, params) {
    const url = `${POLYHAVEN_API_URL}/${endpoint}`;
    if (!params) {
        return url;
    }
    const queryParams = new URLSearchParams();
    if (params.type) {
        queryParams.set('type', params.type);
    }
    if (params.categories) {
        queryParams.set('categories', params.categories);
    }
    const queryString = queryParams.toString();
    return queryString ? `${url}?${queryString}` : url;
}
/**
 * Get the import path for an asset within a Unity project
 */
export function getAssetImportPath(projectPath, folder, filename) {
    return path.join(projectPath, 'Assets', folder, filename);
}
/**
 * Recommended asset packs from Kenney for game development
 */
export const RECOMMENDED_KENNEY_PACKS = [
    {
        slug: 'prototype-kit',
        name: 'Prototype Kit',
        description: 'Basic shapes for prototyping',
    },
    {
        slug: 'nature-kit',
        name: 'Nature Kit',
        description: 'Trees, rocks, grass for outdoor scenes',
    },
    {
        slug: 'furniture-kit',
        name: 'Furniture Kit',
        description: 'Indoor furniture and objects',
    },
    {
        slug: 'space-kit',
        name: 'Space Kit',
        description: 'Spacecraft and space station parts',
    },
    {
        slug: 'mini-dungeon',
        name: 'Mini Dungeon',
        description: 'Dungeon tiles and props',
    },
];
/**
 * Asset categories available on Polyhaven
 */
export const POLYHAVEN_CATEGORIES = {
    hdris: ['indoor', 'outdoor', 'studio', 'skies'],
    textures: ['brick', 'concrete', 'fabric', 'ground', 'metal', 'wood'],
    models: ['architecture', 'furniture', 'nature', 'props'],
};
//# sourceMappingURL=assets.js.map