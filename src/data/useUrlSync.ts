// src/data/useUrlSync.ts

import { useEffect } from 'react';
// 1. REMOVED useSetAtom from this line, as it wasn't being used.
import { useAtom } from 'jotai'; 
import { 
  appViewModeAtom, 
  isPreviewFluidAtom, 
  previewWidthAtom,
  AppViewMode,
} from './atoms';

/**
 * A custom hook to synchronize the application's view state 
 * with the URL's query parameters.
 * - On initial load, it reads the URL to set the state.
 * - On state change, it updates the URL.
 */
export const useUrlSync = () => {
  const [viewMode, setViewMode] = useAtom(appViewModeAtom);
  const [isFluid, setIsFluid] = useAtom(isPreviewFluidAtom);
  const [pWidth, setPWidth] = useAtom(previewWidthAtom);
  
  // Effect 1: Read from URL on initial component mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const view = params.get('view') as AppViewMode;
    const fluid = params.get('fluid');
    const width = params.get('width');

    if (view && ['editor', 'preview', 'settings'].includes(view)) {
      setViewMode(view);
    }
    if (fluid === 'true') {
      setIsFluid(true);
    } else if (width && !isNaN(parseInt(width, 10))) {
      setIsFluid(false);
      setPWidth(parseInt(width, 10));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  // Effect 2: Write to URL when relevant state atoms change
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    params.set('view', viewMode);

    if (viewMode === 'preview') {
      if(isFluid) {
        params.set('fluid', 'true');
        params.delete('width');
      } else {
        params.delete('fluid');
        params.set('width', pWidth.toString());
      }
    } else {
      params.delete('fluid');
      params.delete('width');
    }
    
    const newUrl = `${window.location.pathname}?${params}`;
    window.history.replaceState({}, '', newUrl);
  }, [viewMode, isFluid, pWidth]);
};