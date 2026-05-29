/**
 * Emoji parsing utilities for AZLab
 * Splits text into emoji and non-emoji segments for independent rendering
 */

export type TextSegment =
  | { type: 'text'; content: string }
  | { type: 'emoji'; content: string };

// Comprehensive emoji Unicode regex
// Covers: emoji sequences, ZWJ sequences, variation selectors, flags
const EMOJI_REGEX =
  /(\p{Emoji_Presentation}|\p{Emoji}\uFE0F)(\u200D(\p{Emoji_Presentation}|\p{Emoji}\uFE0F))*/gu;

/**
 * Parse a string into text and emoji segments.
 * Emoji segments always render with native emoji fonts.
 * Text segments render with the user-selected font.
 */
export function parseTextWithEmoji(text: string): TextSegment[] {
  if (!text) return [];

  const segments: TextSegment[] = [];
  let lastIndex = 0;

  // Reset regex
  EMOJI_REGEX.lastIndex = 0;

  let match: RegExpExecArray | null;
  while ((match = EMOJI_REGEX.exec(text)) !== null) {
    // Text before emoji
    if (match.index > lastIndex) {
      segments.push({ type: 'text', content: text.slice(lastIndex, match.index) });
    }
    // Emoji segment
    segments.push({ type: 'emoji', content: match[0] });
    lastIndex = match.index + match[0].length;
  }

  // Remaining text
  if (lastIndex < text.length) {
    segments.push({ type: 'text', content: text.slice(lastIndex) });
  }

  return segments;
}

/**
 * Check if a string contains any emoji characters
 */
export function containsEmoji(text: string): boolean {
  EMOJI_REGEX.lastIndex = 0;
  return EMOJI_REGEX.test(text);
}

/**
 * Strip all emoji from a string
 */
export function stripEmoji(text: string): string {
  EMOJI_REGEX.lastIndex = 0;
  return text.replace(EMOJI_REGEX, '');
}

/**
 * Get the emoji font stack string
 */
export const EMOJI_FONT_STACK =
  "'Apple Color Emoji', 'Segoe UI Emoji', 'Noto Color Emoji', sans-serif";

/**
 * Build a CSS font string with emoji fallback
 */
export function buildFontWithEmojiFallback(
  fontFamily: string,
  fontSize: number,
  fontStyle: string = 'normal',
  fontWeight: string | number = 'normal'
): string {
  return `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}, ${EMOJI_FONT_STACK}`;
}
