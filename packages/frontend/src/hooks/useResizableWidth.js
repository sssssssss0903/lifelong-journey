import { useState, useEffect } from 'react';

/**
 * 管理 Sidebar 拖拽宽度逻辑
 */
export function useResizableWidth(min = 400, max = 720, defaultWidth = 400) {
  const [width, setWidth] = useState(defaultWidth);
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;
      const newWidth = e.clientX;
      if (newWidth >= min && newWidth <= max) {
        setWidth(newWidth);
      }
    };

    const handleMouseUp = () => setIsResizing(false);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, min, max]);

  return { width, isResizing, setIsResizing, setWidth };
}
