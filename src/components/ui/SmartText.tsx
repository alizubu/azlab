'use client';

import React from 'react';
import { parseTextWithEmoji, EMOJI_FONT_STACK } from '@/lib/emoji/emojiUtils';

interface SmartTextProps {
  text: string;
  fontFamily?: string;
  className?: string;
  style?: React.CSSProperties;
  as?: keyof React.JSX.IntrinsicElements;
}

/**
 * SmartText component — renders text with proper emoji isolation.
 * Emoji characters always use native emoji fonts regardless of fontFamily prop.
 */
export function SmartText({
  text,
  fontFamily,
  className,
  style,
  as: Tag = 'span',
}: SmartTextProps) {
  const segments = parseTextWithEmoji(text);

  return (
    <Tag className={className} style={style}>
      {segments.map((seg, i) =>
        seg.type === 'emoji' ? (
          <span
            key={i}
            className="emoji-char"
            style={{ fontFamily: EMOJI_FONT_STACK }}
            aria-label={seg.content}
          >
            {seg.content}
          </span>
        ) : (
          <span
            key={i}
            style={fontFamily ? { fontFamily } : undefined}
          >
            {seg.content}
          </span>
        )
      )}
    </Tag>
  );
}
