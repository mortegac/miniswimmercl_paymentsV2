import React, { useEffect, useCallback, ReactNode } from 'react';

interface FullscreenComponentProps {
  children: ReactNode;
}

const FullscreenComponent: React.FC<FullscreenComponentProps> = ({ children }) => {
  const enterFullscreen = useCallback(() => {
    const element = document.documentElement;
    if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if ((element as any).mozRequestFullScreen) { // Firefox
      (element as any).mozRequestFullScreen();
    } else if ((element as any).webkitRequestFullscreen) { // Chrome, Safari and Opera
      (element as any).webkitRequestFullscreen();
    } else if ((element as any).msRequestFullscreen) { // IE/Edge
      (element as any).msRequestFullscreen();
    }
  }, []);

  useEffect(() => {
    const handleUserInteraction = () => {
      enterFullscreen();
      // Remove the event listener after the first interaction
      document.removeEventListener('click', handleUserInteraction);
    };

    document.addEventListener('click', handleUserInteraction);

    return () => {
      document.removeEventListener('click', handleUserInteraction);
    };
  }, [enterFullscreen]);

  return (
    <>
      {children}
    </>
  );
};

export default FullscreenComponent;