import { useCallback } from 'react';
import {
  executeAddItem,
  type AddItemActions,
} from '@/components/add-items/addItemRegistry';
import { getAddItemDragData } from '@/components/element-palette/elementPaletteDnD';

interface UseFlowCanvasDragDropParams {
  screenToFlowPosition: (position: { x: number; y: number }) => { x: number; y: number };
  handleAddImage: (imageUrl: string, position: { x: number; y: number }) => void;
  addItemActions: AddItemActions;
  onFileDrop?: (file: File, content: string) => void;
}

interface UseFlowCanvasDragDropResult {
  onDragOver: (event: React.DragEvent) => void;
  onDrop: (event: React.DragEvent) => void;
}

const CODE_EXTENSIONS = new Set([
  'sql',
  'tfstate',
  'tf',
  'hcl',
  'yaml',
  'yml',
  'ts',
  'tsx',
  'js',
  'jsx',
  'mjs',
  'py',
  'go',
  'java',
  'rb',
  'cs',
  'cpp',
  'cc',
  'cxx',
  'rs',
  'json',
]);

export function useFlowCanvasDragDrop({
  screenToFlowPosition,
  handleAddImage,
  addItemActions,
  onFileDrop,
}: UseFlowCanvasDragDropParams): UseFlowCanvasDragDropResult {
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const addItemId = getAddItemDragData(event.dataTransfer);
      if (addItemId) {
        const position = screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        });
        executeAddItem(addItemId, addItemActions, position);
        return;
      }

      const file = event.dataTransfer.files?.[0];
      if (!file) return;

      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (loadEvent) => {
          const imageUrl = loadEvent.target?.result as string;
          if (!imageUrl) return;
          const position = screenToFlowPosition({
            x: event.clientX,
            y: event.clientY,
          });
          handleAddImage(imageUrl, position);
        };
        reader.readAsDataURL(file);
        return;
      }

      const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
      if (CODE_EXTENSIONS.has(ext) && onFileDrop) {
        const reader = new FileReader();
        reader.onload = (loadEvent) => {
          const content = loadEvent.target?.result;
          if (typeof content === 'string') {
            onFileDrop(file, content);
          }
        };
        reader.readAsText(file);
      }
    },
    [addItemActions, handleAddImage, onFileDrop, screenToFlowPosition]
  );

  return { onDragOver, onDrop };
}
