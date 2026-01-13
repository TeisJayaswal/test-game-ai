export interface PolyhavenQueryParams {
    type?: 'hdris' | 'textures' | 'models';
    categories?: string;
}
/**
 * Get the URL for a Kenney asset pack
 */
export declare function getKenneyAssetUrl(assetPackSlug: string): string;
/**
 * Get the Polyhaven API URL for querying assets
 */
export declare function getPolyhavenApiUrl(endpoint: string, params?: PolyhavenQueryParams): string;
/**
 * Get the import path for an asset within a Unity project
 */
export declare function getAssetImportPath(projectPath: string, folder: string, filename: string): string;
/**
 * Recommended asset packs from Kenney for game development
 */
export declare const RECOMMENDED_KENNEY_PACKS: {
    slug: string;
    name: string;
    description: string;
}[];
/**
 * Asset categories available on Polyhaven
 */
export declare const POLYHAVEN_CATEGORIES: {
    hdris: string[];
    textures: string[];
    models: string[];
};
//# sourceMappingURL=assets.d.ts.map