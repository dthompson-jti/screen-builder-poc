// src/data/useUndoRedo.ts
import { useSetAtom, useAtomValue } from 'jotai';
import { undoAtom, redoAtom, canUndoAtom, canRedoAtom, actionMetaHistoryAtom } from './historyAtoms';
import { addToastAtom } from './toastAtoms';

export const useUndoRedo = () => {
  const performUndo = useSetAtom(undoAtom);
  const performRedo = useSetAtom(redoAtom);
  const addToast = useSetAtom(addToastAtom);
  const metaHistory = useAtomValue(actionMetaHistoryAtom);
  
  const canUndo = useAtomValue(canUndoAtom);
  const canRedo = useAtomValue(canRedoAtom);

  const undo = () => {
    if (!canUndo) return;
    const lastMeta = metaHistory.past[metaHistory.past.length - 1];
    performUndo();
    addToast({ message: `Undid: ${lastMeta.message}`, icon: 'undo' });
  };

  const redo = () => {
    if (!canRedo) return;
    const nextMeta = metaHistory.future[0];
    performRedo();
    addToast({ message: `Redid: ${nextMeta.message}`, icon: 'redo' });
  };

  return { undo, redo, canUndo, canRedo };
};