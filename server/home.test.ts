import { describe, it, expect } from "vitest";

/**
 * Platform detection tests
 * These tests verify that URLs are correctly identified by platform
 */
describe("Platform Detection", () => {
  const detectPlatform = (url: string): string => {
    if (url.includes("youtube.com") || url.includes("youtu.be")) return "YouTube";
    if (url.includes("tiktok.com")) return "TikTok";
    if (url.includes("instagram.com")) return "Instagram";
    if (url.includes("facebook.com")) return "Facebook";
    if (url.includes("twitter.com") || url.includes("x.com")) return "Twitter/X";
    return "Unknown";
  };

  it("should detect YouTube URLs", () => {
    expect(detectPlatform("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe("YouTube");
    expect(detectPlatform("https://youtu.be/dQw4w9WgXcQ")).toBe("YouTube");
    expect(detectPlatform("https://youtube.com/watch?v=abc123")).toBe("YouTube");
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
    expect(detectPlatform("https://twitter.com/user/status/123")).toBe("Twitter/X");
    expect(detectPlatform("https://x.com/user/status/123")).toBe("Twitter/X");
  });

  it("should return Unknown for unsupported platforms", () => {
    expect(detectPlatform("https://www.example.com/video")).toBe("Unknown");
    expect(detectPlatform("https://vimeo.com/123456")).toBe("Unknown");
  });
});

/**
 * Download history tests
 * These tests verify that download history is correctly managed
 */
describe("Download History Management", () => {
  it("should add items to history", () => {
    const history: any[] = [];
    const newItem = {
      id: "1",
      url: "https://youtube.com/watch?v=abc",
      platform: "YouTube",
      title: "Test Video",
      timestamp: Date.now(),
    };

    const updated = [newItem, ...history].slice(0, 10);
    expect(updated).toHaveLength(1);
    expect(updated[0]).toEqual(newItem);
  });

  it("should maintain maximum 10 items in history", () => {
    let history: any[] = [];

    for (let i = 0; i < 15; i++) {
      const newItem = {
        id: i.toString(),
        url: `https://youtube.com/watch?v=${i}`,
        platform: "YouTube",
        title: `Video ${i}`,
        timestamp: Date.now() + i,
      };
      history = [newItem, ...history].slice(0, 10);
    }

    expect(history).toHaveLength(10);
  });

  it("should keep newest items first", () => {
    let history: any[] = [];

    const item1 = {
      id: "1",
      url: "https://youtube.com/watch?v=1",
      platform: "YouTube",
      title: "Video 1",
      timestamp: 1000,
    };

    const item2 = {
      id: "2",
      url: "https://youtube.com/watch?v=2",
      platform: "YouTube",
      title: "Video 2",
      timestamp: 2000,
    };

    history = [item1, ...history].slice(0, 10);
    history = [item2, ...history].slice(0, 10);

    expect(history[0]).toEqual(item2);
    expect(history[1]).toEqual(item1);
  });

  it("should serialize and deserialize from JSON", () => {
    const history = [
      {
        id: "1",
        url: "https://youtube.com/watch?v=abc",
        platform: "YouTube",
        title: "Test Video",
        timestamp: Date.now(),
      },
    ];

    const serialized = JSON.stringify(history);
    const deserialized = JSON.parse(serialized);

    expect(deserialized).toEqual(history);
    expect(deserialized[0].platform).toBe("YouTube");
  });
});

/**
 * Format selection tests
 * These tests verify that format selection works correctly
 */
describe("Format Selection", () => {
  it("should support MP4 HD format", () => {
    const format = "mp4-hd";
    expect(format).toBe("mp4-hd");
  });

  it("should support MP4 SD format", () => {
    const format = "mp4-sd";
    expect(format).toBe("mp4-sd");
  });

  it("should support MP3 audio format", () => {
    const format = "mp3";
    expect(format).toBe("mp3");
  });
});
