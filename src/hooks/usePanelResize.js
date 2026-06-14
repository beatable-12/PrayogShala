import { useState, useEffect, useCallback } from 'react';

export function usePanelResize(initialBottomHeight = 250, initialRightWidth = 320) {
  const [bottomPanelHeight, setBottomPanelHeight] = useState(initialBottomHeight);
  const [rightPanelWidth, setRightPanelWidth] = useState(initialRightWidth);
  const [dragging, setDragging] = useState(null);

  const handleMouseDown = useCallback((e, target) => {
    e.preventDefault();
    setDragging(target);
  }, []);

  useEffect(() => {
    if (!dragging) return;

    const handleMouseMove = (e) => {
      if (dragging === 'bottom') {
        const newHeight = window.innerHeight - e.clientY;
        if (newHeight > 80 && newHeight < window.innerHeight - 120) {
          setBottomPanelHeight(newHeight);
        }
      } else if (dragging === 'right') {
        const newWidth = window.innerWidth - e.clientX;
        if (newWidth > 200 && newWidth < window.innerWidth - 300) {
          setRightPanelWidth(newWidth);
        }
      }
    };

    const handleMouseUp = () => setDragging(null);

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging]);

  return {
    bottomPanelHeight,
    rightPanelWidth,
    dragging,
    handleBottomResize: (e) => handleMouseDown(e, 'bottom'),
    handleRightResize: (e) => handleMouseDown(e, 'right'),
  };
}