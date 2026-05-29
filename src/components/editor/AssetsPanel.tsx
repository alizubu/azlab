'use client';

import React, { useState } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import { Search, Image as ImageIcon } from 'lucide-react';
import { SectionHeader } from '@/components/ui/Panel';
import { useCanvasStore } from '@/store/canvasStore';
import { addImageToCanvas } from '@/lib/canvas/fabricSetup';
import { clsx } from 'clsx';

// Sample Unsplash photos (in production, use Unsplash API)
const SAMPLE_PHOTOS = [
  { id: '1', url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400', thumb: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200', alt: 'Mountain landscape' },
  { id: '2', url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400', thumb: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=200', alt: 'Forest' },
  { id: '3', url: 'https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=400', thumb: 'https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=200', alt: 'Ocean' },
  { id: '4', url: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400', thumb: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=200', alt: 'City' },
  { id: '5', url: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=400', thumb: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=200', alt: 'Nature' },
  { id: '6', url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400', thumb: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=200', alt: 'Stars' },
];

// Sample sticker emojis
const STICKERS = [
  '😊', '😂', '❤️', '🔥', '⭐', '🎨', '🎉', '🚀',
  '💎', '🌈', '🦋', '🌸', '🎵', '💫', '✨', '🎯',
  '🏆', '💡', '🌙', '☀️', '🌊', '🍀', '🦄', '🎪',
];

export function AssetsPanel() {
  const [searchQuery, setSearchQuery] = useState('');
  const { fabricCanvas, addObject } = useCanvasStore();

  const handleAddPhoto = async (url: string, alt: string) => {
    if (!fabricCanvas) return;
    try {
      const imgObj = await addImageToCanvas(fabricCanvas, url);
      addObject({
        id: imgObj.get('id') as string,
        type: 'image',
        name: alt,
        visible: true,
        locked: false,
        opacity: 100,
        blendMode: 'normal',
      });
    } catch {
      // Image load failed
    }
  };

  const handleAddSticker = async (emoji: string) => {
    if (!fabricCanvas) return;
    const { IText } = await import('fabric');
    const textObj = new IText(emoji, {
      left: fabricCanvas.width / 2,
      top: fabricCanvas.height / 2,
      originX: 'center',
      originY: 'center',
      fontSize: 64,
      fontFamily: "'Apple Color Emoji', 'Segoe UI Emoji', 'Noto Color Emoji'",
      id: crypto.randomUUID(),
      name: `Sticker ${emoji}`,
    });
    fabricCanvas.add(textObj);
    fabricCanvas.setActiveObject(textObj);
    fabricCanvas.renderAll();
    addObject({
      id: textObj.get('id') as string,
      type: 'text',
      name: `Sticker ${emoji}`,
      visible: true,
      locked: false,
      opacity: 100,
      blendMode: 'normal',
    });
  };

  return (
    <div className="flex flex-col h-full">
      <SectionHeader title="Assets" />

      <Tabs.Root defaultValue="photos" className="flex flex-col flex-1 overflow-hidden">
        <Tabs.List className="flex border-b border-[var(--border)] px-2 pt-1 gap-1 shrink-0">
          {['photos', 'stickers'].map((tab) => (
            <Tabs.Trigger
              key={tab}
              value={tab}
              className={clsx(
                'px-2.5 py-1.5 text-xs rounded-t-md transition-colors capitalize',
                'data-[state=active]:text-[var(--accent-primary)] data-[state=active]:border-b-2 data-[state=active]:border-[var(--accent-primary)]',
                'data-[state=inactive]:text-[var(--text-muted)] data-[state=inactive]:hover:text-[var(--text-primary)]'
              )}
            >
              {tab}
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        <Tabs.Content value="photos" className="flex-1 overflow-y-auto">
          <div className="p-2">
            <div className="flex items-center gap-2 bg-[var(--bg-panel)] rounded-lg px-2.5 py-1.5 mb-2">
              <Search size={12} className="text-[var(--text-muted)]" />
              <input
                type="text"
                placeholder="Search photos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 text-xs bg-transparent text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {SAMPLE_PHOTOS.map((photo) => (
                <button
                  key={photo.id}
                  onClick={() => handleAddPhoto(photo.url, photo.alt)}
                  className="relative aspect-square rounded-lg overflow-hidden hover:ring-2 hover:ring-[var(--accent-primary)] transition-all group"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.thumb}
                    alt={photo.alt}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <ImageIcon size={16} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </Tabs.Content>

        <Tabs.Content value="stickers" className="flex-1 overflow-y-auto">
          <div className="p-2">
            <div className="grid grid-cols-6 gap-1">
              {STICKERS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleAddSticker(emoji)}
                  className="aspect-square flex items-center justify-center text-2xl rounded-lg hover:bg-[var(--bg-panel-hover)] transition-colors"
                  title={`Add ${emoji}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
}
