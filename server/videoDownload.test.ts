import { describe, it, expect } from "vitest";
import { detectPlatform, isValidUrl } from "./videoDownload";

/**
 * Video download service tests
 */

describe("detectPlatform", () => {
  it("should detect YouTube URLs", () => {
    expect(detectPlatform("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe("YouTube");
    expect(detectPlatform("https://youtu.be/dQw4w9WgXcQ")).toBe("YouTube");
  });

  it("should detect TikTok URLs", () => {
    expect(detectPlatform("https://www.tiktok.com/@username/video/123456789")).toBe("TikTok");
    expect(detectPlatform("https://tiktok.com/v/123456789")).toBe("TikTok");
  });

  it("should detect Instagram URLs", () => {
    expect(detectPlatform("https://www.instagram.com/p/ABC123/")).toBe("Instagram");
    expect(detectPlatform("https://instagram.com/reel/ABC123/")).toBe("Instagram");
  });

  it("should detect Facebook URLs", () => {
    expect(detectPlatform("https://www.facebook.com/video.php?v=123")).toBe("Facebook");
    expect(detectPlatform("https://facebook.com/watch/?v=123")).toBe("Facebook");
  });

  it("should detect Twitter/X URLs", () => {
    expect(detectPlatform("https://twitter.com/user/status/123")).toBe("Twitter");
    expect(detectPlatform("https://x.com/user/status/123")).toBe("Twitter");
  });

  it("should return Unknown for unsupported platforms", () => {
    expect(detectPlatform("https://www.example.com/video")).toBe("Unknown");
    expect(detectPlatform("https://vimeo.com/123456")).toBe("Unknown");
  });
});

describe("isValidUrl", () => {
  it("should validate supported platform URLs", () => {
    expect(isValidUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe(true);
    expect(isValidUrl("https://www.tiktok.com/@user/video/123")).toBe(true);
    expect(isValidUrl("https://www.instagram.com/p/ABC123/")).toBe(true);
    expect(isValidUrl("https://www.facebook.com/video.php?v=123")).toBe(true);
    expect(isValidUrl("https://twitter.com/user/status/123")).toBe(true);
  });

  it("should reject invalid URLs", () => {
    expect(isValidUrl("not a url")).toBe(false);
    expect(isValidUrl("")).toBe(false);
  });

  it("should reject unsupported platform URLs", () => {
    expect(isValidUrl("https://www.vimeo.com/123456")).toBe(false);
    expect(isValidUrl("https://www.example.com/video")).toBe(false);
  });

  it("should handle URLs with various protocols", () => {
    expect(isValidUrl("http://youtube.com/watch?v=abc")).toBe(true);
    expect(isValidUrl("https://youtu.be/abc")).toBe(true);
  });
});
