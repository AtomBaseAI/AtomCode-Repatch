"use client";
import { useEffect } from 'react';

const useDisableEscKey = (): void => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape' || event.keyCode === 27) {
        // console.log("Escape key pressed, but prevented.");
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);

    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  }, []); 
};

export default useDisableEscKey;
