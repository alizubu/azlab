'use client';

import React, { useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Eye, EyeOff, Lock, Unlock, GripVertical, Trash2 } from 'lucide-react';
import { useCanvasStore, type CanvasObject } from '@/store/canvasStore';
import { SectionHeader } from '@/components/ui/Panel';
import { clsx } from 'clsx';

export function LayersPanel() {
  const { objects, selectedIds, setSelectedIds, updateObject, removeObject, reorderObjects, fabricCanvas } = useCanvasStore();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const fromIndex = objects.findIndex((o) => o.id === active.id);
      const toIndex = objects.findIndex((o) => o.id === over.id);
      if (fromIndex === -1 || toIndex === -1) return;

      reorderObjects(fromIndex, toIndex);

      // Sync with Fabric.js
      if (fabricCanvas) {
        const fabricObjects = fabricCanvas.getObjects();
        const fabricObj = fabricObjects.find((o: { get: (k: string) => unknown }) => o.get('id') === active.id);
        if (fabricObj) {
          // Fabric layers are reversed (index 0 = bottom)
          const fabricIndex = fabricObjects.length - 1 - toIndex;
          fabricCanvas.moveTo(fabricObj, Math.max(0, fabricIndex));
          fabricCanvas.renderAll();
        }
      }
    },
    [objects, reorderObjects, fabricCanvas]
  );

  const handleToggleVisibility = useCallback(
    (id: string, visible: boolean) => {
      updateObject(id, { visible: !visible });
      if (fabricCanvas) {
        const obj = fabricCanvas.getObjects().find((o: { get: (k: string) => unknown }) => o.get('id') === id);
        if (obj) {
          obj.set('visible', !visible);
          fabricCanvas.renderAll();
        }
      }
    },
    [updateObject, fabricCanvas]
  );

  const handleToggleLock = useCallback(
    (id: string, locked: boolean) => {
      updateObject(id, { locked: !locked });
      if (fabricCanvas) {
        const obj = fabricCanvas.getObjects().find((o: { get: (k: string) => unknown }) => o.get('id') === id);
        if (obj) {
          obj.set({
            selectable: locked,
            evented: locked,
          });
          fabricCanvas.renderAll();
        }
      }
    },
    [updateObject, fabricCanvas]
  );

  const handleDelete = useCallback(
    (id: string) => {
      removeObject(id);
      if (fabricCanvas) {
        const obj = fabricCanvas.getObjects().find((o: { get: (k: string) => unknown }) => o.get('id') === id);
        if (obj) {
          fabricCanvas.remove(obj);
          fabricCanvas.renderAll();
        }
      }
    },
    [removeObject, fabricCanvas]
  );

  const handleSelect = useCallback(
    (id: string) => {
      setSelectedIds([id]);
      if (fabricCanvas) {
        const obj = fabricCanvas.getObjects().find((o: { get: (k: string) => unknown }) => o.get('id') === id);
        if (obj) {
          fabricCanvas.setActiveObject(obj);
          fabricCanvas.renderAll();
        }
      }
    },
    [setSelectedIds, fabricCanvas]
  );

  return (
    <div className="flex flex-col h-full">
      <SectionHeader title="Layers" />

      {objects.length === 0 ? (
        <div className="flex-1 flex items-center justify-center p-4">
          <p className="text-xs text-[var(--text-muted)] text-center">
            No layers yet.<br />Add text or images to get started.
          </p>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={objects.map((o) => o.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex-1 overflow-y-auto py-1">
              <AnimatePresence>
                {objects.map((obj) => (
                  <SortableLayerItem
                    key={obj.id}
                    obj={obj}
                    isSelected={selectedIds.includes(obj.id)}
                    onSelect={() => handleSelect(obj.id)}
                    onToggleVisibility={() => handleToggleVisibility(obj.id, obj.visible)}
                    onToggleLock={() => handleToggleLock(obj.id, obj.locked)}
                    onDelete={() => handleDelete(obj.id)}
                    onRename={(name) => updateObject(obj.id, { name })}
                  />
                ))}
              </AnimatePresence>
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}

interface LayerItemProps {
  obj: CanvasObject;
  isSelected: boolean;
  onSelect: () => void;
  onToggleVisibility: () => void;
  onToggleLock: () => void;
  onDelete: () => void;
  onRename: (name: string) => void;
}

function SortableLayerItem(props: LayerItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: props.obj.id,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      transition={{ duration: 0.15 }}
    >
      <LayerItem {...props} dragHandleProps={{ ...attributes, ...listeners }} />
    </motion.div>
  );
}

function LayerItem({
  obj,
  isSelected,
  onSelect,
  onToggleVisibility,
  onToggleLock,
  onDelete,
  onRename,
  dragHandleProps,
}: LayerItemProps & { dragHandleProps?: Record<string, unknown> }) {
  const [editing, setEditing] = React.useState(false);
  const [name, setName] = React.useState(obj.name);

  const typeIcon = obj.type === 'text' ? 'T' : obj.type === 'image' ? '🖼' : '◻';

  return (
    <div
      className={clsx(
        'group flex items-center gap-1.5 px-2 py-1.5 cursor-pointer transition-colors',
        isSelected
          ? 'bg-[rgba(124,58,237,0.15)] border-l-2 border-[var(--accent-primary)]'
          : 'hover:bg-[var(--bg-panel-hover)] border-l-2 border-transparent'
      )}
      onClick={onSelect}
    >
      {/* Drag handle */}
      <button
        className="text-[var(--text-muted)] opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing shrink-0"
        {...dragHandleProps}
        onClick={(e) => e.stopPropagation()}
        aria-label="Drag to reorder"
      >
        <GripVertical size={12} />
      </button>

      {/* Type icon */}
      <span className="text-xs text-[var(--text-muted)] w-4 text-center shrink-0">{typeIcon}</span>

      {/* Name */}
      {editing ? (
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => { setEditing(false); onRename(name); }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') { setEditing(false); onRename(name); }
            if (e.key === 'Escape') { setEditing(false); setName(obj.name); }
          }}
          onClick={(e) => e.stopPropagation()}
          className="flex-1 text-xs bg-[var(--bg-panel)] border border-[var(--accent-primary)] rounded px-1 py-0.5 text-[var(--text-primary)] focus:outline-none"
        />
      ) : (
        <span
          className="flex-1 text-xs text-[var(--text-primary)] truncate"
          onDoubleClick={(e) => { e.stopPropagation(); setEditing(true); }}
        >
          {obj.name}
        </span>
      )}

      {/* Actions */}
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => { e.stopPropagation(); onToggleVisibility(); }}
          className="p-0.5 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          aria-label={obj.visible ? 'Hide layer' : 'Show layer'}
        >
          {obj.visible ? <Eye size={12} /> : <EyeOff size={12} />}
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onToggleLock(); }}
          className="p-0.5 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          aria-label={obj.locked ? 'Unlock layer' : 'Lock layer'}
        >
          {obj.locked ? <Lock size={12} /> : <Unlock size={12} />}
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="p-0.5 rounded text-[var(--text-muted)] hover:text-red-400"
          aria-label="Delete layer"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
}
