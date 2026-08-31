import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";

// Downlib type declaration - lazy load to avoid import issues in tests
let Downlib: any = null;
let downlib: any = null;

try {
  Downlib = require("downlib");
  downlib = new Downlib({
    deleteAfterDownload: false,
  });
} catch (error) {
  console.warn("[VideoDownload] Failed to initialize Downlib:", error);
  downlib = null;
}

/**
 * Video download service using Downlib
 * Handles downloading videos from various platforms
 */

interface DownloadOptions {
  format?: "mp4-hd" | "mp4-sd" | "mp3";
  audioOnly?: boolean;
}

interface DownloadResult {
  success: boolean;
  filePath?: string;
  fileName?: string;
  platform?: string;
  error?: string;
  metadata?: {
    title?: string;
    duration?: number;
    thumbnail?: string;
  };
}

/**
 * Detect platform from URL
 */
export function detectPlatform(url: string): string {
  if (url.includes("youtube.com") || url.includes("youtu.be")) return "YouTube";
  if (url.includes("tiktok.com")) return "TikTok";
  if (url.includes("instagram.com")) return "Instagram";
  if (url.includes("facebook.com")) return "Facebook";
  if (url.includes("twitter.com") || url.includes("x.com")) return "Twitter";
  return "Unknown";
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return detectPlatform(url) !== "Unknown";
  } catch {
    return false;
  }
}

/**
 * Download video from URL
 */
export async function downloadVideo(
  url: string,
  options: DownloadOptions = {}
): Promise<DownloadResult> {
  try {
    // Validate URL
    if (!isValidUrl(url)) {
      return {
        success: false,
        error: "Invalid URL or unsupported platform",
      };
    }

    const platform = detectPlatform(url);
    const downloadDir = path.join(process.cwd(), "downloads", uuidv4());

    // Ensure download directory exists
    if (!fs.existsSync(downloadDir)) {
      fs.mkdirSync(downloadDir, { recursive: true });
    }

    let result;
    const audioOnly = options.format === "mp3";

    // Download based on platform
    switch (platform) {
      case "YouTube":
        result = await downlib.downloadFromYouTube(downloadDir, url, {
          audioOnly,
        });
        break;
      case "TikTok":
        result = await downlib.downloadFromTikTok(url, downloadDir);
        break;
      case "Instagram":
        result = await downlib.downloadFromInstagram(url, downloadDir);
        break;
      case "Facebook":
        result = await downlib.downloadFromFacebook(downloadDir, url, {
          audioOnly,
        });
        break;
      case "Twitter":
        result = await downlib.downloadFromTwitter(url, downloadDir);
        break;
      default:
        return {
          success: false,
          error: "Platform not supported",
        };
    }

    // Get downloaded file
    const files = fs.readdirSync(downloadDir);
    if (files.length === 0) {
      return {
        success: false,
        error: "Download failed: no file generated",
      };
    }

    const fileName = files[0];
    const filePath = path.join(downloadDir, fileName);

    return {
      success: true,
      filePath,
      fileName,
      platform,
      metadata: {
        title: url.substring(0, 100),
      },
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[VideoDownload] Error:", errorMessage);
    return {
      success: false,
      error: `Download failed: ${errorMessage}`,
    };
  }
}

/**
 * Get video metadata without downloading
 */
export async function getVideoMetadata(url: string) {
  try {
    if (!isValidUrl(url)) {
      return {
        success: false,
        error: "Invalid URL or unsupported platform",
      };
    }

    const platform = detectPlatform(url);

    return {
      success: true,
      platform,
      url,
      metadata: {
        title: `Video from ${platform}`,
        duration: 0,
        thumbnail: "",
      },
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      error: `Failed to fetch metadata: ${errorMessage}`,
    };
  }
}

/**
 * Clean up old downloads
 */
export function cleanupOldDownloads(maxAgeMs: number = 3600000): void {
  try {
    const downloadsDir = path.join(process.cwd(), "downloads");
    if (!fs.existsSync(downloadsDir)) return;

    const now = Date.now();
    const entries = fs.readdirSync(downloadsDir);

    entries.forEach((entry) => {
      const fullPath = path.join(downloadsDir, entry);
      const stats = fs.statSync(fullPath);
      const age = now - stats.mtimeMs;

      if (age > maxAgeMs) {
        if (stats.isDirectory()) {
          fs.rmSync(fullPath, { recursive: true, force: true });
        } else {
          fs.unlinkSync(fullPath);
        }
      }
    });
  } catch (error) {
    console.error("[VideoDownload] Cleanup error:", error);
  }
}
