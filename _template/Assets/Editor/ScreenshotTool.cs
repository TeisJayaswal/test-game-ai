using UnityEngine;
using UnityEditor;
using System;
using System.IO;

/// <summary>
/// Editor tool for capturing screenshots from the Game view.
/// Triggered via Tools menu - can be called by Claude through Unity MCP's manage_menu_item.
///
/// PRIMARY METHOD: Tools/Take Screenshot
/// Uses RenderTexture for reliable capture during play mode.
/// </summary>
public class ScreenshotTool : EditorWindow
{
    private static string screenshotFolder = "Assets/Screenshots";

    /// <summary>
    /// PRIMARY SCREENSHOT METHOD - Uses RenderTexture for reliable capture.
    /// Works during play mode. Synchronous - file exists immediately after call.
    /// </summary>
    [MenuItem("Tools/Take Screenshot")]
    public static void CaptureScreenshot()
    {
        // Ensure folder exists
        if (!Directory.Exists(screenshotFolder))
        {
            Directory.CreateDirectory(screenshotFolder);
        }

        // Generate timestamped filename
        string timestamp = DateTime.Now.ToString("yyyyMMdd_HHmmss");
        string filename = $"screenshot_{timestamp}.png";
        string fullPath = Path.Combine(screenshotFolder, filename);

        // Use RenderTexture method for reliability
        bool success = CaptureWithRenderTexture(fullPath);

        if (success)
        {
            // Verify file exists
            if (File.Exists(fullPath))
            {
                FileInfo fi = new FileInfo(fullPath);
                Debug.Log($"[ScreenshotTool] SUCCESS - Screenshot saved: {fullPath} ({fi.Length} bytes)");
                AssetDatabase.Refresh();
            }
            else
            {
                Debug.LogError($"[ScreenshotTool] FAILED - File not created: {fullPath}");
            }
        }
    }

    /// <summary>
    /// Capture using RenderTexture - more reliable than ScreenCapture.CaptureScreenshot()
    /// </summary>
    private static bool CaptureWithRenderTexture(string path)
    {
        // Find main camera
        Camera cam = Camera.main;
        if (cam == null)
        {
            // Try to find any camera
            cam = FindObjectOfType<Camera>();
        }

        if (cam == null)
        {
            Debug.LogError("[ScreenshotTool] No camera found in scene!");

            // Fallback to ScreenCapture method
            Debug.Log("[ScreenshotTool] Attempting fallback with ScreenCapture.CaptureScreenshot...");
            ScreenCapture.CaptureScreenshot(path);
            return true; // Let caller verify if file exists
        }

        // Get Game view resolution or use defaults
        int width = Screen.width > 0 ? Screen.width : 1920;
        int height = Screen.height > 0 ? Screen.height : 1080;

        // Ensure reasonable size
        width = Mathf.Clamp(width, 640, 3840);
        height = Mathf.Clamp(height, 480, 2160);

        try
        {
            // Create RenderTexture
            RenderTexture rt = new RenderTexture(width, height, 24, RenderTextureFormat.ARGB32);
            rt.antiAliasing = 2;

            // Store original target
            RenderTexture originalTarget = cam.targetTexture;

            // Render to our texture
            cam.targetTexture = rt;
            cam.Render();

            // Read pixels
            RenderTexture.active = rt;
            Texture2D screenshot = new Texture2D(width, height, TextureFormat.RGB24, false);
            screenshot.ReadPixels(new Rect(0, 0, width, height), 0, 0);
            screenshot.Apply();

            // Restore camera
            cam.targetTexture = originalTarget;
            RenderTexture.active = null;

            // Encode and save
            byte[] bytes = screenshot.EncodeToPNG();

            // Ensure directory exists
            string directory = Path.GetDirectoryName(path);
            if (!string.IsNullOrEmpty(directory) && !Directory.Exists(directory))
            {
                Directory.CreateDirectory(directory);
            }

            File.WriteAllBytes(path, bytes);

            // Cleanup
            DestroyImmediate(rt);
            DestroyImmediate(screenshot);

            return true;
        }
        catch (Exception e)
        {
            Debug.LogError($"[ScreenshotTool] RenderTexture capture failed: {e.Message}");

            // Fallback to ScreenCapture
            Debug.Log("[ScreenshotTool] Attempting fallback with ScreenCapture.CaptureScreenshot...");
            try
            {
                ScreenCapture.CaptureScreenshot(path);
                return true;
            }
            catch (Exception e2)
            {
                Debug.LogError($"[ScreenshotTool] Fallback also failed: {e2.Message}");
                return false;
            }
        }
    }

    /// <summary>
    /// Alternative method using Unity's built-in ScreenCapture (less reliable during play mode)
    /// </summary>
    [MenuItem("Tools/Take Screenshot (Legacy)")]
    public static void CaptureScreenshotLegacy()
    {
        if (!Directory.Exists(screenshotFolder))
        {
            Directory.CreateDirectory(screenshotFolder);
        }

        string timestamp = DateTime.Now.ToString("yyyyMMdd_HHmmss");
        string filename = $"screenshot_legacy_{timestamp}.png";
        string fullPath = Path.Combine(screenshotFolder, filename);

        ScreenCapture.CaptureScreenshot(fullPath);
        Debug.Log($"[ScreenshotTool] Legacy capture initiated: {fullPath}");
        Debug.Log("[ScreenshotTool] Note: File may not exist immediately (async capture)");

        // Schedule verification
        EditorApplication.delayCall += () =>
        {
            EditorApplication.delayCall += () =>
            {
                if (File.Exists(fullPath))
                {
                    FileInfo fi = new FileInfo(fullPath);
                    Debug.Log($"[ScreenshotTool] Legacy capture SUCCESS: {fullPath} ({fi.Length} bytes)");
                    AssetDatabase.Refresh();
                }
                else
                {
                    Debug.LogWarning($"[ScreenshotTool] Legacy capture may have failed - file not found: {fullPath}");
                }
            };
        };
    }

    /// <summary>
    /// Capture to a specific path programmatically.
    /// </summary>
    public static bool CaptureToPath(string path)
    {
        string directory = Path.GetDirectoryName(path);
        if (!string.IsNullOrEmpty(directory) && !Directory.Exists(directory))
        {
            Directory.CreateDirectory(directory);
        }

        bool success = CaptureWithRenderTexture(path);

        if (success && File.Exists(path))
        {
            FileInfo fi = new FileInfo(path);
            Debug.Log($"[ScreenshotTool] SUCCESS - Screenshot saved: {path} ({fi.Length} bytes)");
            AssetDatabase.Refresh();
            return true;
        }
        else
        {
            Debug.LogError($"[ScreenshotTool] FAILED - Could not capture screenshot to: {path}");
            return false;
        }
    }

    /// <summary>
    /// List all screenshots in the folder
    /// </summary>
    [MenuItem("Tools/List Screenshots")]
    public static void ListScreenshots()
    {
        if (!Directory.Exists(screenshotFolder))
        {
            Debug.Log("[ScreenshotTool] No screenshots folder exists yet.");
            return;
        }

        string[] files = Directory.GetFiles(screenshotFolder, "*.png");
        if (files.Length == 0)
        {
            Debug.Log("[ScreenshotTool] No screenshots found in Assets/Screenshots/");
            return;
        }

        Debug.Log($"[ScreenshotTool] Found {files.Length} screenshots:");
        foreach (string file in files)
        {
            FileInfo fi = new FileInfo(file);
            Debug.Log($"  - {Path.GetFileName(file)} ({fi.Length} bytes, {fi.LastWriteTime})");
        }
    }
}
