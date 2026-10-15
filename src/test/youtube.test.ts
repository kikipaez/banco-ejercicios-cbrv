import { describe, expect, it } from "vitest";
import { getYouTubeId } from "@/lib/youtube";

const ID = "dQw4w9WgXcQ";

describe("getYouTubeId", () => {
  it.each([
    `https://www.youtube.com/watch?v=${ID}`,
    `https://www.youtube.com/watch?v=${ID}&t=42s`,
    `https://m.youtube.com/watch?feature=share&v=${ID}`,
    `https://youtu.be/${ID}`,
    `https://youtu.be/${ID}?si=abc123`,
    `https://www.youtube.com/shorts/${ID}`,
    `https://youtube.com/shorts/${ID}?feature=share`,
    `https://www.youtube.com/embed/${ID}`,
    `youtu.be/${ID}`,
    ID,
  ])("parses %s", (url) => {
    expect(getYouTubeId(url)).toBe(ID);
  });

  it.each(["", "not a url", "https://vimeo.com/123", "https://youtube.com/watch?v=short"])(
    "rejects %s",
    (url) => {
      expect(getYouTubeId(url)).toBeNull();
    },
  );
});
