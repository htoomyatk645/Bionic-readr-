import type { ReadableBlock } from "../types";

export function hashBlocks(blocks: ReadableBlock[]): string {
  let hash = 0;
  let length = 0;
  for (const block of blocks) {
    for (const sentence of block.sentences) {
      const text = sentence.text;
      length += text.length;
      for (let i = 0; i < text.length; i++) {
        hash = (hash * 31 + text.charCodeAt(i)) | 0;
      }
    }
  }
  return `${length}:${hash >>> 0}`;
}
