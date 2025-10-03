// src/data/toastAtoms.ts
import { atom } from 'jotai';

export interface Toast {
  id: number;
  message: string;
  icon: string;
}

export const toastsAtom = atom<Toast[]>([]);

// This is a "write-only" atom. It provides a function to add a toast,
// but components don't need to read its value.
export const addToastAtom = atom(
  null,
  (get, set, { message, icon }: { message: string; icon: string }) => {
    const newToast = { id: Date.now(), message, icon };
    const currentToasts = get(toastsAtom);

    // Coalesce rapid, identical toasts by resetting the timer of the existing one.
    // In our ToastContainer, the key will be the ID, so we need to remove and re-add to re-trigger animation/timer.
    const existingToastIndex = currentToasts.findIndex(t => t.message === message);
    if (existingToastIndex > -1) {
      const updatedToasts = [...currentToasts];
      updatedToasts.splice(existingToastIndex, 1);
      set(toastsAtom, [...updatedToasts, newToast]);
    } else {
      set(toastsAtom, [...currentToasts, newToast]);
    }
  }
);