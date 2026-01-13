export interface CreateProjectOptions {
    vr?: boolean;
    multiplayer?: boolean;
}
/**
 * Check if a directory contains a valid Unity project structure
 */
export declare function isValidUnityProject(projectPath: string): boolean;
/**
 * Get the Unity version from a project's ProjectVersion.txt
 */
export declare function getProjectVersion(projectPath: string): string | null;
/**
 * Create a Unity project directory structure
 */
export declare function createUnityProjectStructure(projectPath: string, options?: CreateProjectOptions): Promise<void>;
//# sourceMappingURL=unity.d.ts.map